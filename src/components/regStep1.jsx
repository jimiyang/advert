import React, {Component} from 'react';
import {Form, Input, Icon, message, Button} from 'antd'
import {msgVerify, picVerify} from '@/api/api'
let num = 1
class RegStep1 extends Component {
  constructor(props) {
    super(props)
    this.state = {
      form: {
        phone: '',
        authCode: '',
        msgAuthCode: null,
        password: null,
        confirmPassword: null,
        picUniqueToken: null
      },
      verifyTxt: '',
      sendStatus: false,
      sendTxt: '发送验证码',
      number: 60,
      timer: null,
      regStatus: null
    }
  }
  async componentDidMount() {
    await this.changeVerify()
  }
  componentWillReceiveProps(nprops) {
    ///console.log(this.props.regStatus, nprops.regStatus)
    if (nprops.regStatus !== this.props.regStatus) {
      this.changeVerify()
    }
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
  changeVerify = async () => {
    let form = this.state.form;
    const res = await picVerify()
    if (res.success) {
      form = Object.assign(form, {picUniqueToken: res.data.picUniqueToken});
      this.setState({
        verifyTxt: res.data.authCode,
        form,
        regStatus: null
      })
    }
  }
  changeFormEvent = (e, type) => {
    let form = this.state.form, value = e.target.value
    if (type === 'phone' && value === '') {
      this.error()
    }
    form = Object.assign(form, {[type]: value})
    this.setState({form})
  }
  //发送验证码
  sendCodeEvent = () => {
    num = 2
    const that = this;
    let {number, form} = this.state;
    let validateFields = this.props.form.validateFields
    validateFields(['phone', 'authCode'], (errors, values) => {
      if (!errors) {
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
        msgVerify({phone: form.phone}).then(rs => {
          if (!rs.success) {
            this.props.form.setFields({
              user: {
                value: values.phone,
                errors: [new Error('请输入手机号')],
              },
            });
          } else {
            message.success('验证码发送成功')
          }
        });
      }
    }) 
  }
  //注册第一步
  RegisterEvent = (e) => {
    e.preventDefault();
    this.props.form.validateFields((err, values) => {
      if (!err) {
        let form = this.state.form;
        form = Object.assign(form, values);
        this.props.RegisterEvent(this.state.form)
      } else {
        this.changeVerify()
      }
    })
  }
  componentWillUnmount() {
    this.error()
  }
  render() {
    const {
      form,
      sendStatus,
      verifyTxt,
      sendTxt
    } = this.state
    const {getFieldDecorator} = this.props;
    const checkAuthCode = (rule, value, callback) => {
      if (value === '') {
        callback('请输入页面验证码')
      }
      if (value.toLowerCase() !== verifyTxt.toLowerCase()) {
        callback('页面验证码错误')
      }
      callback(); 
    }
    return (
      <div className={`register-blocks`}>
        <Form onSubmit={this.RegisterEvent} className="form" name="form" id="form">
          <Form.Item>
            {
              getFieldDecorator(
                'phone',
                {
                  initialValue: form.phone,
                  rules: [
                    {required: true, message: "请输入手机号码"},
                    {pattern: /^1(3|4|5|6|7|8|9)\d{9}$/, message: '请输入正确的手机号'}
                  ]
                }
              )(<div className="items"><Input
                  className="ipttxt"
                  placeholder="请输入手机号码"
                  prefix={<Icon component={() => (
                    <img src={require('@/assets/images/ico-1.png')} />
                    )} />
                  }
                  onChange={e => this.changeFormEvent(e, 'phone')}
              /></div>)
            }
          </Form.Item>
          <Form.Item>
            {
              getFieldDecorator(
                'authCode',
                {
                  initialValue: form.authCode,
                  rules: [
                    {validator: checkAuthCode}
                  ]
                }
              )(<div className="items"><Input
                  className="ipttxt"
                  placeholder="请输入页面验证码"
                  prefix={<Icon component={() => (
                    <img src={require('@/assets/images/ico-2.png')} />
                    )} />
                  }
                  value={form.authCode}
                  style={{width: '280px'}}
                  onChange={e => this.changeFormEvent(e, 'authCode')}
                />
                <div style={{display: 'inline-block', width: '80px'}} className="verify g-tc" onClick={() => this.changeVerify()}>
                  {verifyTxt}
                </div>
              </div>)
            }
          </Form.Item>
          <Form.Item>
            {
              getFieldDecorator(
                'msgAuthCode',
                {
                  initialValue: form.msgAuthCode || '',
                  rules: [
                    {required: true, message: '请输入手机验证码'}
                  ]
                }
              )(<div className="items">
                <Input
                  className="ipttxt"
                  placeholder="请输入手机验证码"
                  prefix={<Icon component={() => (
                    <img src={require('@/assets/images/ico-3.png')} />
                    )} />
                  }
                  style={{width: '269px'}}
                  onChange={e => this.changeFormEvent(e, 'msgAuthCode')}
              />
              <div style={{display: 'inline-block'}}>
                <Button
                  onClick={() => this.sendCodeEvent()}
                  disabled={sendStatus === true ? true : false}
                  className={sendStatus === true ? '' : 'yellow'}
                >{sendTxt}</Button>
              </div>
              </div>)
            }
          </Form.Item>
          <Form.Item>
            {
              getFieldDecorator(
                'password',
                {
                  initialValue: form.password || '',
                  rules: [
                    {required: true, message: '请输入登录密码'},
                    {pattern: /^(?![0-9]+$)(?![a-zA-Z]+$)[0-9A-Za-z]{6,20}$/, message: '请输入6-20位密码须包含英文、数字'}
                  ]
                }
              )(<div className="items"><Input
                type="password"
                className="ipttxt"
                placeholder="请输入登录密码"
                prefix={<Icon component={() => (
                  <img src={require('@/assets/images/ico-5.png')} />
                  )} />
                }
                onChange={e => this.changeFormEvent(e, 'password')}
              /> </div>)
            }
          </Form.Item>
          <Form.Item>
            {
              getFieldDecorator(
                'confirmPassword',
                {
                  initialValue: form.confirmPassword || '',
                  rules: [
                    {required: true, message: '请输入确认密码'},
                    {pattern: /^(?![0-9]+$)(?![a-zA-Z]+$)[0-9A-Za-z]{6,20}$/, message: '请输入6-20位密码须包含英文、数字'}
                  ]
                }
              )(<div className="items"><Input
                type="password"
                className="ipttxt"
                placeholder="请输入确认密码"
                prefix={<Icon component={() => (
                  <img src={require('@/assets/images/ico-5.png')} />
                  )} />
                }
                onChange={e => this.changeFormEvent(e, 'confirmPassword')}
              /></div>)
            }
          </Form.Item>
          <Form.Item>
            <div className="g-tc">
              <Button type="primary" className="btn-purple" htmlType="submit">注册</Button>
            </div>
          </Form.Item>
        </Form>
      </div>
    )
  }
}
export default RegStep1;