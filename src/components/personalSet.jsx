import React, {Component} from 'react'
import style from '@/pages/user/style.less'
import Link from 'umi/link'
import { Icon } from 'antd'
import Modify from '@/components/modify'
class PersonalSet extends Component{
  constructor(props) {
    super(props)
    this.state = {
      isVisible: false,
      merchantInfo: {}
    }
  }
  componentWillMount() {
    this.setState({
      userInfo: JSON.parse(window.localStorage.getItem('login_info')).data,
      merchantInfo: this.props.merchantInfo
    })
  }
  modifyEvent = (type) => {
    const title = type === 'pwd' ? '修改密码' : '修改手机号'
    this.setState({
      isVisible: true,
      modifyType: type,
      modifyTitle: title
    })
    
  }
  closeEvent = () => {
    this.setState({isVisible: false})
  }
  render() {
    const {
      userInfo,
      isVisible,
      modifyType,
      modifyTitle,
      merchantInfo
    } = this.state
    return(
      <ul className={style['user-setInfo']}>
        <li>
          <div className={style['col']}>
            <h1>商户中心</h1>
            <p>完善店铺/商户信息，有助于平台为您提供个性化的服务，也有助于平台与您之间开展更好地合作。</p>
          </div>
          <div className={style['opeartion']}>
            <span className={`${Number(merchantInfo.infoStatus) === 2 ? style['green'] : style['red']}`}>
              <Icon type="safety-certificate" theme="filled"  className="m5" />
              {Number(merchantInfo.infoStatus) === 2 ? '已设置' : '未完善'}
            </span> | <Link to={{pathname: '/merchant', state: {current: 2}}}>
              {Number(merchantInfo.infoStatus) === 2 ? 
                Number(userInfo.merchantType) === 0 ? '查看' : '修改' : '立即完善'
              }
            </Link>
          </div>
        </li>
        <li>
          <div className={style['col']}>
            <h1>登录密码</h1>
            <p>安全性高的密码可以使帐号更安全。建议您定期更换密码，设置一个包含字母，符号或数字中至少两项且长度超过6位的密码。</p>
          </div>
          <div className={style['opeartion']}>
            <span className={style['green']}>
              <Icon type="safety-certificate" theme="filled" className="m5"/>已设置
            </span> | <span className="cur purple-color ml10" onClick={() => this.modifyEvent('pwd')}>修改</span>
          </div>
          <Modify
            isVisible={isVisible}
            key={isVisible + Date.now()}
            modifyTitle={modifyTitle}
            modifyType={modifyType}
            closeEvent={this.closeEvent}
          />
        </li>
        <li>
          <div className={style['col']}>
            <h1>手机绑定</h1>
            <p>您已绑定了手机<em className="purple-color">{window.common.reaplceStar(userInfo.phone, 'phone')}</em>[您的手机为安全手机，可用于找回密码或账号登录]</p>
          </div>
          <div className={style['opeartion']}>
            <span className={style['green']}>
              <Icon type="safety-certificate" theme="filled" className="m5" />已设置 
            </span> | <span className="cur purple-color ml10"  onClick={() => this.modifyEvent('phone')}>修改</span>
          </div>
        </li>
      </ul>
    )
  }
}
export default PersonalSet