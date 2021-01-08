import React, {Component} from 'react'
import {Form, message} from 'antd'
import router from 'umi/router'
import Link from 'umi/link'
import {register, addMerchantInfo} from '../api/api'
import RegStep1 from '@/components/regStep1'
import RegStep2 from '@/components/RegStep2'
//console.log(RegStep1)
class Register extends Component{
  constructor(props) {
    super(props);
    this.state = {
      form: {
        phone: '',
        authCode: '',
        msgAuthCode: null,
        password: null,
        confirmPassword: null,
        picUniqueToken: null
      },
      addForm: {
        userName: null,
        merchantBusiness: null,
        wechatNum: null,
        merchantName: null
      },
      step: 1
    };
  }
  async componentDidMount() {
    await this.setState({
      step: this.props.location.state.step
    });
    window.localStorage.setItem('reg', 'reg')
  }
  //注册第一步
  RegisterEvent = (form) => {
    this.setState({regStatus: null})
    register(form).then(rs => {
      if (rs.success) {
        message.success(rs.message)
        //代表注册成功，进入完善信息界面
        let addForm = this.state.addForm;
        window.localStorage.setItem('token', rs.token);
        addForm = Object.assign(addForm, {token: rs.token});
        this.setState({
          step: 2,
          addForm
        });
      } else {
        this.setState({regStatus: 1})
      }
    });
  }
  //完善个人信息(注册第二步)
  RegisterUserInfoEvent = (form) => {
    //let addForm = this.state.addForm;
    const token = window.localStorage.getItem('token');
    let addForm = Object.assign(form, {token});
    addMerchantInfo(addForm).then(rs => {
      const params = {
        data: {
          ...rs.data
        }
      };
      window.localStorage.setItem('login_info', JSON.stringify(params));
      if (rs.success) {
        router.push('/');
      }
    });
  }
  changeFormEvent = (type, e) => {
    let form = this.state.form, value = e.target.value
    if (type === 'phone' && value === '') {
      this.error()
    }
    let addForm = this.state.addForm
    if (type === 'merchantName') {
      addForm = Object.assign(addForm, {merchantName: value})
    }
    form = Object.assign(form, {[type]: value})
    this.setState({form, addForm})
  }
  resetEvent = () => {
    router.push('/');
  }
  render() {
    const {getFieldDecorator} = this.props.form;
    const {
      step,
      addForm,
      regStatus
    } = this.state;
    return(
      <div className="login-form">
        <div className="header">
          <div className="nav">
            <img src={require('@/assets/images/logo.png')} />
            <div className="nav-reg">
              <Link to="/login">登录</Link>
              <Link to="/register" className="active">注册</Link>
            </div>
          </div>  
        </div>
        {
          step === 1 ?
            <RegStep1
              form={this.props.form}
              getFieldDecorator={getFieldDecorator}
              RegisterEvent={this.RegisterEvent}
              regStatus={regStatus}
            />
           :
            <RegStep2
              form={this.props.form}
              getFieldDecorator={getFieldDecorator}
              RegisterUserInfoEvent={this.RegisterUserInfoEvent}
            />
        }
      </div> 
    );
  }
}
//export default Register
export default Form.create()(Register);