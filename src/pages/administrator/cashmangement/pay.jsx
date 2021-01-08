import React, {Component} from 'react'
import {Modal, Icon, Input, Button, message, Form, Tooltip} from 'antd'
import style from '../style.less'
import {sendWithdrawCode, onlinePay} from '@/api/api'
class PAY extends Component {
  constructor (props) {
    super(props)
    this.state = {
      isVisible: false,
      sendStatus: false,
      sendTxt: '发送验证码',
      number: 60,
      timer: null,
      smsCode: null,
      phone: '15313061840'
    }
  }
  componentDidMount() {
    this.setState({isVisible: this.props.isVisible})
  }
  changeFormEvent = (e, type) => {
    this.setState({smsCode: e.target.value})
  }
  //清除setInterval
  error = () => {
    let {timer} = this.state
    const that = this
    window.clearInterval(timer);
    that.setState({
      sendTxt: '发送验证码',
      sendStatus: false,
      number: 60
    });
  }
  setPhone = (phone) => {
    const that = this
    let {number} = this.state
    this.setState({
      sendTxt: `59s后重发`,
      sendStatus: true
    })
    this.state.timer = window.setInterval(()=> {
      if(number <= 1){
        this.error();
      }else{
        number--;
        that.setState({
          sendTxt: `${number}s后重发`,
          sendStatus: true
        });
      }
    }, 1000);
    sendWithdrawCode({phone}).then(rs => {
      if (!rs.success) {
        this.error()
      } else {
        message.success('验证码发送成功')
      }
    });
  }
  //发送验证码
  sendCodeEvent = () => {
    //const phone = JSON.parse(window.localStorage.getItem('login_info')).data.phone;
    const phone = this.state.phone
    if (phone === undefined) {
      message.error('请输入手机号')
      return false
    }
    this.setPhone(phone)
  }
  handleSubmit = (e) => {
    e.preventDefault();
    this.props.form.validateFields((err, values) => {
      if (!err) {
        const params = {
          smsCode: values.smsCode,
          orderNo: this.props.orderNo,
          phone: this.state.phone
        }
        //console.log(params)
        //return false
        onlinePay(params).then(res => {
          if(res.success) {
            message.success('付款成功')
            this.setState({isVisible: false})
            this.props.reload()
          }
        })
      }
    })
  }
  handleCancel = () => {
    this.setState({isVisible: false})
    this.props.handleCancel()
  }
  componentWillUnmount() {
    this.error()
  }
  render() {
    const {
      isVisible,
      smsCode,
      sendStatus,
      sendTxt,
      phone
    } = this.state
    const { getFieldDecorator } = this.props.form
    return(
      <div className={style['administrator']}>
        <Modal
          title="付款确认"
          visible={isVisible}
          onOk={(e) => this.handleSubmit(e)}
          okText="确定付款"
          onCancel={this.handleCancel}
          cancelText="取消"
          width={430}
        >
          <div className={style['pay-box']}>
            <p><Icon type="info-circle" className={style['ico']}/> 请仔细确认提现信息无误后再付款，确认付款后系统将自动完成打款，且不可撤回！</p>
            <div className={style['phone']}>操作人手机号码
              <Tooltip title="为确保安全操作，必须通过当前指定人员的手机号验证后才可完成付款">
                <Icon type="question-circle" theme="filled"  className={style['ico']} />
              </Tooltip>
              ：<label className="purple-color">{phone}</label>
            </div>
            <Form onSubmit={this.handleSubmit}>
              <Form.Item>
                {getFieldDecorator('smsCode', {
                    initialValue: smsCode || null,
                    rules: [
                    {
                      required: true,
                      message: '请输入短信验证码',
                    }
                    ],
                })(<div>
                    <div className="inlineb w2600">
                      <Input 
                        placeholder="请输入短信验证码" 
                        prefix={<Icon type="safety-certificate" />}
                        value={smsCode}
                        onChange={e => this.changeFormEvent(e, 'smsCode')}
                      />
                    </div>
                    <div className="inlineb" style={{marginLeft: '-10px'}}>
                      <Button type="primary"
                        onClick={() => this.sendCodeEvent()}
                        disabled={sendStatus}
                      >{sendTxt}</Button>
                    </div>
                </div>)}
              </Form.Item>
            </Form>
         </div>
        </Modal>
      </div>
    )
  }
}
export default Form.create()(PAY)