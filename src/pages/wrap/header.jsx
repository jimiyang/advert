import React, {Component} from 'react';
import router from 'umi/router';
import {logout, getByMerchantCodeInfo} from '@/api/api';
import {Icon, Popover, Avatar} from 'antd';
import EventBus from '@/untils/eventbus';
import urlFn from '@/untils/method'
class Header extends Component{
  constructor(props) {
    super(props);
    this.state = {
      loginInfo: {},
      merchantInfo: {
        headImg: ''
      },
      count: 'header'
    };
  }
  componentWillMount() {
    EventBus.addListener('ChangeAvatar', (url)=>{
      let merchantInfo = this.state.merchantInfo;
      merchantInfo = Object.assign(merchantInfo, {headImg: url});
      this.setState({
        merchantInfo
      });
    });
  }
  componentDidMount() {
    let urlObj = urlFn(), info = JSON.parse(window.localStorage.getItem('login_info'))
    if (urlObj.token === undefined && info !== null) {
      const loginInfo = info.data;
      this.setState({
        loginInfo
      }, async () => {
        await this.getMerchantIno();
      });
    }

  }
  getMerchantIno = () => {
    const merchantCode = this.state.loginInfo.merchantCode;
    getByMerchantCodeInfo({merchantCode}).then(rs => {
      if (rs.success) {
        this.setState({
          merchantInfo: rs.data
        });
      }
    });
  }
  LoginOutEvent = () => {
    const loginInfo = this.state.loginInfo;
    logout({loginName: loginInfo.loginName}).then(rs => {
      if (rs.code === 0 || rs.code === 100000) {
        window.localStorage.clear();
        router.push('/login');
      }
    });
  }
  //点击进入个人中心页面
  setEvent = (current) => {
    router.push({
      pathname: '/merchant',
      state: {current}
    });
  }
  render() {
    const {
      merchantInfo
    } = this.state;
    const content = (
      <div className="service-wx g-tc">
        <h1>客服中心</h1>
        <h2>您好，我是您的专属客服小粉</h2>
        <p><img alt="" src={require('@/assets/images/service-wx.png')} style={{width: '150px', height: '150px'}}/></p>
        <h2><Icon type="scan" style={{marginRight: '5px'}}/>微信扫码联系客服</h2>
      </div>
    );
    const userInfo = (
      <div className="service-user" style={{width: '140px'}}>
        <div className="col" onClick={() => this.setEvent(1)}>
          <Icon type="setting" className="mr10" />账号设置
        </div>
        <div className="col" onClick={() => this.setEvent(2)}>
          <Icon type="user" className="mr10" />商户中心
        </div>
        <div className="col" onClick={() => this.LoginOutEvent()}>
          <Icon type="import" className="mr10" />退出
        </div>
      </div>
    );
    return(
      <div className="header-blocks">
        <div className="logo">
          <img alt="" src={require('@/assets/images/logo3.png')} /> 
        </div>
        <div>
          <Popover placement="bottom" content={content} trigger="hover">
            <span className="service-items">
              <img alt="" src={require('@/assets/images/service-ico.png')} style={{width: '27px', height: '27px'}}/>联系客服</span>
          </Popover>
          <div className="login-info inlineb">
            <Popover placement="bottom" content={userInfo} trigger="hover">
              <div className="inlineb">
                <Avatar size={30} icon="user" src={merchantInfo.headImg} />
              </div>
              <span className="username">
                {merchantInfo.phone}&nbsp;
                {
                  Number(merchantInfo.merchantType) === 0 ? null :
                  <span>{Number(merchantInfo.isCrossAuth) !== 1 ? null : <em>(<i className="red-color">未认证</i>)</em>}</span>
                }
                </span> 
            </Popover>
            <Icon type="caret-down" className="m5" />
          </div>
        </div>
      </div>
    );
  }
}
export default Header;