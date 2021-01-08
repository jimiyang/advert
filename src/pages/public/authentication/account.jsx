import React, { Component} from 'react';
import {Form, Input, Button, message, Icon} from 'antd';
import style from './index.less'
import {getAccountBankInfo, applyWithdraw, getAdAccountBankInfo, AdapplyWithdraw} from '@/api/api'
import ReactTooltip from 'react-tooltip'
import WithDrawNotice from '@/components/withdrawmsg' //提现通知
class AccountWithdrawal extends Component {
    constructor(props) {
        super(props);
        this.state = {
          isdisabled: false,
          form: {
            availableBalance: 0,
            bankName: null,
            bankCardNumber: null,
            subbranchCityName: null,
            subbranchName: null
          },
          amt: 0,
          withDrawAmt: 0
        }
    }
    componentDidMount() {
        const token = this.props.location.state.token
        const merchantType = this.props.location.state.merchantType
        this.setState({
            token,
            merchantType
        }, async () => {
            await this.initForm()
        })
    }
    initForm = async () => {
      const {merchantType, token} = this.state
      const Fun = Number(merchantType) === 1 ? getAdAccountBankInfo() : getAccountBankInfo({token})
      //const rs = await getAccountBankInfo({token: this.state.token})
      await Fun.then(rs => {
        if (rs.success) {
            const f = Object.assign(this.state.form, rs.data)
            this.setState({form: f})
          }
      })
    }
    changeFormEvent = (e, type) => {
        let {form, merchantType} = this.state, value = e.target.value
        let reg = /^[0-9]+([.]{1}[0-9]{1,2})?$/;
        if (reg.test(value)) {
            let amt = (value * 0.03).toFixed(2)
            let withDrawAmt = Number(merchantType) === 1 ? value : (value - amt).toFixed(2)
            this.setState({[type]: e.target.value, withDrawAmt, amt}) 
        }
    }
    handleSubmit = (e) => {
        e.preventDefault();
        this.props.form.validateFields((err, values) => {
            if(!err){
                this.setState({isdisabled: true})
                const {token, merchantType} = this.state
                const params = {
                  ...values,
                  token
                }
                const Fun = Number(merchantType) === 1 ? AdapplyWithdraw : applyWithdraw
                Fun(params).then(rs => {
                    if (rs.success) {
                        message.success(rs.message)
                        window.history.go(-1)
                    }
                    this.setState({
                        isdisabled: false
                    })
                })
            }
        })
    }
    render() {
        const {
          isdisabled,
          form,
          amt,
          withDrawAmt,
          merchantType
        } = this.state
        const {getFieldDecorator} = this.props.form
        const maxValue = (rule, value, callback) => {
            let reg = /^([1-9][0-9]*){1,3}|(^[0-9][.][0-9]{1}$)|(^[0-9][.][0-9]{2}$)$/;
            if (Number(value) > Number(form.availableBalance)) {
              callback('可提现金额不足');
            } // 必须总是返回一个 callback，否则 validateFields 无法响应
            if (!reg.test(value)) {
              callback('请输入正确的提现金额');
            }
            if (Number(value) < 100) {
              callback('提现最低额度为100元')
            }
            callback(); 
        };
        return (
        <div className={style['authenticationForm']}>
            <h1 className={style['title']}>提现申请</h1>
            <WithDrawNotice />
            <Form layout='inline' onSubmit={this.handleSubmit}>
            <ul className={style['form']}>
                <li>
                    <label className={style['name']}>可提现金额：</label>
                    <div className={`${style['content']}`}>
                        <span className={style['amt']}>{form.availableBalance}</span>
                        <em className="f12 ml10 red-color">元</em>
                    </div>
                </li>
                <li>
                    <label className={style['name']}><i>*</i>本次提现金额：</label>
                    <div className={`${style['content']}`}>
                        <Form.Item>
                        {getFieldDecorator(
                        'withDrawAmt',
                            {
                              rules: [
                                {validator: maxValue}
                              ]
                            }    
                            )(<Input className={style['ipttxt']} placeholder="请输入提现金额" onChange={e => this.changeFormEvent(e, 'withDrawAmt')} />)
                        }
                        </Form.Item>
                    </div>
                </li>
                <li>
                    <label className={style['name']}>实际到账金额：</label>
                    <div className={`${style['content']}`}>
                        <em className={style['amt']}>{withDrawAmt}</em><em className="f12 ml10 mr20 red-color">元</em> 
                            {
                              Number(merchantType) === 1 ? null :
                              <span>
                              <Icon type="question-circle" data-html="html" data-tip="针对您的每笔提现，平台将收取3%的提现服务费"
                                />手续费：
                                    <em className={style['amt']}>{amt}</em>
                                <em className="f12 ml10 red-color">元</em></span>
                            }
                        <ReactTooltip />
                    </div>
                </li>
                <li>
                    <label className={style['name']}>提现银行：</label>
                    <div className={`${style['content']} ${style['mt5']}`}>{form.bankName}</div>
                </li>
                <li>
                    <label className={style['name']}>银行卡号：</label>
                    <div className={`${style['content']} ${style['mt5']}`}>{form.bankCardNumber}</div>
                </li>
                <li>
                    <label className={style['name']}>开户网点：</label>
                    <div className={`${style['content']} ${style['mt5']}`}>{form.subbranchName}</div>
                </li>
            </ul>
            <div  className={style['pl150']} >
                <Form.Item>
                    <Button type="primary" htmlType="submit" disabled={isdisabled === true ? true : false}>申请提现</Button>
                    <Button className="ml30" onClick={() => {window.history.go(-1)}}>返回</Button>
                </Form.Item>
            </div>
            </Form>
        </div>
        )
    }
}
export default Form.create()(AccountWithdrawal); 