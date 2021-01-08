import React, {Component} from 'react';
import {Input} from 'antd';
import style from './component.less';
class AddEmployess extends Component{
  constructor(props) {
    super(props);
    this.state = {
      type: 'add',
      addForm: {
        name: null,
        mobile: null
      }
    };
  }
  componentDidMount() {
    this.setState({type: this.props.type, addForm: this.props.addForm});
  }
  componentWillReceiveProps(props) {
    this.setState({type: props.type, addForm: props.addForm});
  } 
  changeValueEvent = (type, e) => {
    let addForm = this.state.addForm;
    let obj = {[type]: e.target.value};
    addForm = Object.assign(addForm, obj);
    this.setState({addForm});
    this.props.changeValueEvent(type, e);
  }
  render() {
    const {
      type,
      addForm
    } = this.state;
    return (
      <div>
        {
          type === 'add' ?
            <ul className={style.addEm}>
              <li>
                <em className={style.name}>姓名：</em>
                <Input placeholder="请输入姓名" onChange={this.changeValueEvent.bind(this, 'name')} value={addForm.name} />
              </li>
              <li>
                <em className={style.name}>手机：</em>
                <Input placeholder="请输入手机号" onChange={this.changeValueEvent.bind(this, 'mobile')} value={addForm.mobile} />
              </li>
              <li>
                <em className={style.name}>登录名：</em>
                <Input placeholder="请输入登录名" onChange={this.changeValueEvent.bind(this, 'loginName')} />
              </li>
              <li>
                <em className={style.name}>密码：</em>
                <Input type="password" placeholder="请输入密码格式为数字+字母" onChange={this.changeValueEvent.bind(this, 'password')} />
              </li>
            </ul>
            :
            <ul className={style.addEm}>
              <li>
                <em className={style.name}>姓名：</em>
                <Input placeholder="请输入姓名" onChange={this.changeValueEvent.bind(this, 'name')} value={addForm.name} />
              </li>
              <li>
                <em className={style.name}>手机：</em>
                <Input placeholder="请输入手机号" onChange={this.changeValueEvent.bind(this, 'mobile')} value={addForm.mobile} />
              </li>
              <li>
                <em className={style.name}>登录名：</em>
                <div>{addForm.loginName}</div>
              </li>
            </ul>
        }
      </div>
    )
  }
};
export default AddEmployess;