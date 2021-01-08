import React, {Component} from 'react'
import {Modal, Form, Input, Button, Popover, Icon, message} from 'antd'
import {msgVerify, updatePassword, updatePhone, validateSmsCode} from '@/api/api'
import style from '@/pages/user/style.less'
let flag
class Modify extends Component{
  constructor(props) {
    super(props)
    this.state = {
      isVisible: false,
      sendStatus: false,
      sendTxt: '发送验证码',
      number: 60,
      timer: null,
      smsCode: null
    }
  }
  componentDidMount() {
    this.setState({
      isVisible: this.props.isVisible,
      phone: JSON.parse(window.localStorage.getItem('login_info')).data.phone
    })
    this.props.form.setFieldsValue({smsCode: null})
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
    msgVerify({phone}).then(rs => {
      if (!rs.success) {
        this.props.form.setFields({
          user: {
            value: phone,
            errors: [new Error('请输入手机号')],
          },
        });
      } else {
        message.success('验证码发送成功')
      }
    });
  }
  //发送验证码
  sendCodeEvent = () => {
    const type = this.props.modifyType
    //const phone = JSON.parse(window.localStorage.getItem('login_info')).data.phone;
    const phone = this.state.phone
    if (type === 'phone') {
      if (this.state.nextType !== 'next') {
        this.setPhone(phone)
      } else {
        this.props.form.validateFields(['phone'], (errors, values) => {
          if (!errors) {
            this.setPhone(values.phone)
          }
        })
      }
    } else {
      this.setPhone(phone)
    }
  }
  handleSubmit = e => {
    e.preventDefault();
    if (this.state.nextType !== 'next' && this.props.modifyType === 'phone') {
      this.props.form.validateFields((err, values) => {
        if (!err) {
          const merchantCode = JSON.parse(window.localStorage.getItem('login_info')).data.merchantCode
          validateSmsCode({merchantCode, ...values}).then(rs => {
            if(rs.success) {
              this.setState({nextType: 'next', smsCode: null})
              this.error()
            }
          })
        }
      })
    } else {
      const Fun = this.props.modifyType === 'pwd' ? updatePassword : updatePhone
      this.props.form.validateFields((err, values) => {
        if (!err) {
          Fun(values).then(rs => {
            if(rs.success) {
              message.success(rs.message)
              this.setState({isVisible: false})
            }
          })
        }
      })
    }
  }
  changeFormEvent = (e, type) => {
    this.setState({smsCode: e.target.value})
  }
  closeEvent = () => {
    this.setState({
      isVisible: false,
      nextType: null
    })
    this.props.closeEvent()
    this.error()
  }
  componentWillUnmount() {
    this.error()
  }
  render() {
    const { getFieldDecorator } = this.props.form
    const {
      isVisible,
      sendTxt,
      sendStatus,
      nextType,
      smsCode,
      phone
    } = this.state
    const loginInfo = JSON.parse(window.localStorage.getItem('login_info')).data
    const content = (
      <div className="service-wx g-tc">
        <p><img src={require('@/assets/images/service-wx.png')} style={{width: '150px', height: '150px'}}/></p>
        <h2><Icon type="scan" style={{marginRight: '5px'}}/>微信扫码联系客服</h2>
      </div>
    )
    const confimPassword = (rule, value, callback) => {
      if (value === undefined) {
        callback('6~20位，至少含字母/数字/特殊字符两种组合')
      }
      this.props.form.validateFields(['password'], (err, values) => {
        if (!err) {
          if (value !== values.password) {
            callback('两次输入的密码不一致')
          }
        }
      })
      callback(); 
    }
    const checkPhone = (rule, value, callback) => {
      if (value === undefined) {
        callback('请输入手机号码')
      }
      const reg = /^1(3|4|5|6|7|8|9)\d{9}$/
      if (!reg.test(value)) {
        callback('请输入正确的手机号')
      }
      if (value === phone) {
        callback('新手机号不能与旧手机号相同')
      }
      callback();
    }
    return(
      <Modal
        visible={isVisible}
        title={this.props.modifyTitle}
        width={400}
        onOk={e => this.handleSubmit(e)}
        onCancel={() => this.closeEvent()}
        footer={null}
        maskClosable={false}
      >
        <div className={style['user-modifyInfo']}>
          <h1>
            {
              this.props.modifyType === 'pwd' ?
              '安全性高的密码可以使帐号更安全，建议设置一个包含字母，符号或数字中至少两项且长度超过6位的密码。' :
              nextType === 'next' ? '我们不会泄漏您的手机信息' : '为确保您的账户安全，请完成以下验证'
            }
          </h1>
          <Form onSubmit={this.handleSubmit}>
            {
              this.props.modifyType === 'phone' && nextType === 'next' ?
              <Form.Item>
                {getFieldDecorator('phone', {
                  rules: [
                    //{required: true, message: "请输入手机号码"},
                    //{pattern: /^1(3|4|5|6|7|8|9)\d{9}$/, message: '请输入正确的手机号'},
                    {validator: checkPhone}
                  ],
                })(<Input prefix={<Icon type="mobile" />} placeholder="请输入手机号码" />)}
              </Form.Item>
              : 
              <div className={style['phone']}>
                <span>手机号码：
                  <em className="purple-color cur">
                    {window.common.reaplceStar(loginInfo.phone, 'phone')}
                  </em>
                </span>
                <span className="cur ml10">
                  <Popover placement="bottom" content={content} trigger="click">    
                    [手机不可用，点此修改]
                  </Popover>
                </span>
              </div>
            } 
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
            {
              this.props.modifyType === 'pwd' ? 
                <div>
                  <Form.Item>
                    {getFieldDecorator('password', {
                      rules: [
                        {required: true, message: '6~20位，至少含字母/数字/特殊字符两种组合'},
                        {pattern: /^(?![0-9]+$)(?![a-zA-Z]+$)[0-9A-Za-z]{6,20}$/, message: '请输入6-20位密码须包含英文、数字'}
                      ]
                    })(<Input.Password placeholder="6~20位，至少含字母/数字/特殊字符两种组合" />)}
                  </Form.Item>
                  <Form.Item>
                    {getFieldDecorator('confimPassword', {
                      rules: [
                        //{required: true, message: '6~20位，至少含字母/数字/特殊字符两种组合'},
                        //{pattern: /^(?![0-9]+$)(?![a-zA-Z]+$)[0-9A-Za-z]{6,20}$/, message: '请输入6-20位密码须包含英文、数字'}
                        {validator: confimPassword}
                      ]
                    })(<Input.Password placeholder="再次输入确认密码" />)}
                  </Form.Item>
                </div> : null
            }
            <div>
              {
                this.props.modifyType === 'pwd' ? 
                <Button type="primary" htmlType="submit" block>确认修改</Button>
                :
                <Button type="primary" htmlType="submit" block>{nextType === 'next' ? '确认修改' : '下一步'}</Button>
              }
            </div>
          </Form>
        </div>
      </Modal>
    )
  }
}
export default Form.create()(Modify)