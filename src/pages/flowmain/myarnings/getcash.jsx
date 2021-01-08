import React, {Component} from 'react'
import {Alert, Form, Input, Button, message} from 'antd'
import {historyList, applyWithdraw} from '@/api/api'
import style from './style.less'
class GetCash extends Component{
  constructor(props) {
    super(props)
    this.state = {
      isDisabled: false,
      withDrawData: [],
      form: {
        realWithdrawAmt: 0
      },
      pagination: {
        size: 'small',
        currentPage: 1,
        total: 0,
        limit: 10,
        pageSize: 10,
        onChange: this.changePage,
        onShowSizeChange: this.onShowSizeChange
      }
    }
  }
  async componentDidMount() {
    //const loginInfo = JSON.parse(window.localStorage.getItem('login_info'))
    //await this.setState({loginName: loginInfo.data.loginName})
    await this.loadList()
  }
  loadList = () => {
    const {pagination} = this.state
    const params = {
      currentPage: pagination.currentPage,
      limit: pagination.limit
    }
    historyList(params).then(rs => {
      const p = Object.assign(pagination, {total: rs.total})
      this.setState({withDrawData: rs.data, pagination: p})
    })
  }
  changePage = (page) => {
    page = page === 0 ? 1 : page
    const pagination = Object.assign(this.state.pagination, {currentPage: page})
    this.setState({pagination})
    this.loadList()
  }
  //改变每页条数事件
  onShowSizeChange = (current, size) => {
    let p = this.state.pagination
    p = Object.assign(p, {currentPage: current, limit: size, pageSize: size})
    this.setState({pagination: p})
    this.loadList()
  }
  changeFormEvent = (type, e) => {
    let form = this.state.form
    let obj = {}
    if (type === 'orderAmt') {
      const number = isNaN(Number(e.target.value) * 0.9) === true ? 0 : Number(e.target.value) * 0.9
      obj = {realWithdrawAmt: number.toFixed(2)}
    }
    form = Object.assign(form, {[type]: e.target.value}, obj)
    this.setState({form})
  }
  applyEvent = (e) => {
    e.preventDefault()
    this.props.form.validateFields((err, values) => {
      if (!err) {
        let {form} = this.state
        form = Object.assign(form, values)
        this.setState({isDisabled: true})
        applyWithdraw(form).then(rs => {
          this.setState({isDisabled: false})
          if (rs.success) {
            message.success(rs.message)
          }
          window.history.go(-1)
        })
      }
    })
  }
  render () {
    const {getFieldDecorator} = this.props.form
    const {
      form,
      isDisabled
    } = this.state
    const formItemLayout = {
      labelCol: {
        xs: {span: 2},
        sm: {span: 4},
      },
      wrapperCol: {
        xs: {span: 5},
        sm: {span: 10},
      }
    }
    const tailFormItemLayout = {
      wrapperCol: {
        xs: {
          span: 10,
          offset: 0,
        },
        sm: {
          span: 15,
          offset: 0,
        }
      },
    }
    const columns = [
      {
        title: '银行卡号',
        key: 'bankCardNo',
        dataIndex: 'bankCardNo'
      },
      {
        title: '开户行',
        key: 'bankName',
        dataIndex: 'bankName'
      },
      {
        title: '户主姓名',
        key: 'bankCardOwnerName',
        dataIndex: 'bankCardOwnerName'
      }
    ]
    return (
      <div className={style.arnings}>
        <div className={style.cashArea}>
          <div className={style.notice}>
            <Alert
              message="提现服务费说明"
              description={<div><p>针对您的每笔提现，平台将收取10%的提现服务费。</p></div>}
              type="warning"
              closable
            />
          </div>
          <div className={style.applyInfo}>
            <ul className={style.form}>
              <Form {...formItemLayout} name="form" id="form" onSubmit={this.applyEvent}>
                <li>
                  <Form.Item label="提现金额" {...tailFormItemLayout}>
                    {
                      getFieldDecorator(
                        'orderAmt',
                        {
                          initialValue: form.unitPrice || '',
                          rules: [
                            {required: true, message: '请输入提现金额'},
                            {pattern: /(^[1-9]{1}[0-9]*$)|(^[0-9]*\.[0-9]{2}$)/, message: '请输入大于0的整数或小数(保留后两位)'}
                          ]
                        }
                      )(<div><Input onChange={this.changeFormEvent.bind(this, 'orderAmt')} /></div>)
                    }
                  </Form.Item>
                </li>
                <li>
                  <Form.Item label="到账金额" {...tailFormItemLayout}>
                    {
                      (<div style={{fontWeight: 'bold', fontSize: '18px', color: '#f00'}}>{form.realWithdrawAmt}元</div>)
                    }
                  </Form.Item>
                </li>
                <li>
                  <Form.Item label="银行卡号" {...tailFormItemLayout}>
                    {
                      getFieldDecorator(
                        'bankCardNo',
                        {
                          initialValue: form.unitPrice || '',
                          rules: [
                            {required: true, message: '请输入银行卡号'},
                            {pattern: /^\d+$/, message: '请输入正确的银行卡号'}
                          ]
                        }
                      )(<div><Input  maxLength={19} onChange={this.changeFormEvent.bind(this, 'bankCardNo')} /></div>)
                    }
                  </Form.Item>
                </li>
                <li>
                  <Form.Item label="开户行" {...tailFormItemLayout}>
                    {
                      getFieldDecorator(
                        'bankName',
                        {
                          initialValue: form.unitPrice || '',
                          rules: [
                            {required: true, message: '请输入开户行'},
                          ]
                        }
                      )(<div><Input onChange={this.changeFormEvent.bind(this, 'bankName')} /></div>)
                    }
                  </Form.Item>
                </li>
                <li>
                  <Form.Item label="开户人" {...tailFormItemLayout}>
                    {
                      getFieldDecorator(
                        'bankCardOwnerName',
                        {
                          initialValue: form.unitPrice || '',
                          rules: [
                            {required: true, message: '请输入开户人姓名'},
                          ]
                        }
                      )(<div><Input onChange={this.changeFormEvent.bind(this, 'bankCardOwnerName')} /></div>)
                    }
                  </Form.Item>
                </li>
                <li className={style.button}>
                  <Form.Item>
                    <Button type="primary" htmlType="submit" className={style.btn} disabled={isDisabled}>确认</Button>
                  </Form.Item>
                </li>
              </Form>
            </ul>
            <div className={style.historylist}>
              {
                /*<h1>历史提现信息</h1>
                <Table
                  dataSource={withDrawData}
                  columns={columns}
                  rowKey={record => record.id}
                  pagination={pagination}
                  className="table"
                />*/
              }
            </div>
          </div>
        </div>
      </div>
    )
  }
}
export default Form.create()(GetCash)