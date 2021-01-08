import React, {Component} from 'react';
import {Form, Input, Icon, Button} from 'antd'
class RegStep2 extends Component {
  constructor(props) {
    super(props);
    this.state = {
      addForm: {
        userName: null,
        merchantBusiness: null,
        wechatNum: null,
        merchantName: null
        }
      };
  }
  changeFormEvent = (e, type) => {
    let value = e.target.value
    if (type === 'phone' && value === '') {
      this.error()
    }
    let addForm = this.state.addForm
    if (type === 'merchantName') {
      addForm = Object.assign(addForm, {merchantName: value})
    }
    //form = Object.assign(form, {[type]: value})
    this.setState({addForm})
  }
  RegisterUserInfoEvent = (e) => {
    e.preventDefault();
    this.props.form.validateFields((err, values) => {
      if (!err) {
        let addForm = this.state.addForm;
        addForm = Object.assign(addForm, values);
        this.props.RegisterUserInfoEvent(this.state.addForm)
      }
    })
  }
  render() {
    const {
      addForm
    } = this.state
    const {getFieldDecorator} = this.props;
    return (
        <div className="register-blocks">
            <h1 className="title">完善个人信息</h1>
            <p className="describe">为了获得更多优质服务，方便我们的客服人员联系到您，请您填写下列信息</p>
            <Form onSubmit={this.RegisterUserInfoEvent} className="form" name="form" id="form">
            <Form.Item>
                {
                getFieldDecorator(
                    'userName',
                    {
                    initialValue: addForm.userName || '',
                    rules: [
                        {required: true, message: "请输入您的姓名"}
                    ]
                    }
                )(<div className="items">
                    <Input
                        className="ipttxt"
                        placeholder="请输入您的姓名"
                        prefix={
                        <div>
                            <em className="star-ico">*</em>
                            <Icon component={() => (
                            <img src={require('@/assets/images/ico-1.png')} />
                            )} />
                        </div>
                        }
                        allowClear={true}
                    />
                    </div>)
                }
            </Form.Item>
            <Form.Item>
                {
                getFieldDecorator(
                    'merchantBusiness',
                    {
                    initialValue: addForm.merchantBusiness || '',
                    rules: [
                        {required: true, message: '请输入您从事的行业'}
                    ]
                    }
                )(<div className="items"><Input
                    className="ipttxt"
                    placeholder="请输入您从事的行业"
                    prefix={
                        <div>
                        <em className="star-ico" style={{marginRight: 0}}>*</em>
                        <Icon component={() => (
                            <img src={require('@/assets/images/ico-2.png')} />
                        )} />
                        </div>
                    }
                />
                </div>)
                }
            </Form.Item>
            <Form.Item>
                {
                getFieldDecorator(
                    'wechatNum',
                    {
                    initialValue: addForm.msgAuthCode || '',
                    rules: [
                        {required: true, message: '请输入您的微信号'}
                    ]
                    }
                )(<div className="items">
                    <Input
                    className="ipttxt"
                    placeholder="请输入您的微信号"
                    prefix={
                        <div>
                        <em className="star-ico" style={{marginRight: '3px'}}>*</em>
                        <Icon component={() => (
                            <img src={require('@/assets/images/ico-3.png')} />
                        )} />
                        </div>
                    }
                />
                </div>)
                }
            </Form.Item>
            <Form.Item>
                {
                getFieldDecorator(
                    'merchantName',
                    {
                    initialValue: addForm.merchantName || '',
                    rules: [
                        {required: true, message: '请输入您的公司名称'}
                    ]
                    }
                )(<div className="items">
                    <Input
                        className="ipttxt"
                        placeholder="请输入您的公司名称"
                        prefix={
                        <div>
                            <em className="star-ico" style={{marginRight: '3px'}}>*</em>
                            <Icon component={() => (
                            <img src={require('@/assets/images/ico-5.png')} />
                            )} />
                        </div>
                        }
                        onChange={e => this.changeFormEvent(e, 'merchantName')}
                    />
                    </div>)
                }
            </Form.Item>
            <Form.Item>
                <div className="g-tc mt40">
                <Button type="primary" className="btn-purple" htmlType="submit">立即进入</Button>
                </div>
            </Form.Item>
            </Form>
        </div>
    )
  }
}
export default RegStep2