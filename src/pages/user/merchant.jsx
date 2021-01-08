import React, {Component} from 'react'
import {Avatar, Icon, Tabs, Upload, message, Button} from 'antd'
import PersonalSet from '@/components/personalSet'
import MerchantCenter from '@/components/MerchantCenter'
import {upload, getByMerchantCodeInfo, updateMerchant} from '@/api/api';
import style from './style.less'
import router from 'umi/router'
import Link from 'umi/link'
import EventBus from '@/untils/eventbus'
const {TabPane} = Tabs
class PersonalSetting extends Component {
  constructor(props) {
    super(props)
    this.state = {
      userInfo: null,
      merchantInfo: {},
      form: {}
    }
  }
  async componentDidMount() {
    await this.getMerchantIno()
  }
  tabEvent = (cur) => {
    router.push({
      pathname: '/merchant',
      state: {current: cur}
    })
  }
  getMerchantIno = () => {
    const merchantCode = JSON.parse(window.localStorage.getItem('login_info')).data.merchantCode
    getByMerchantCodeInfo({merchantCode}).then(rs => {
      this.setState({
        merchantInfo: rs.data
      })
    })
  }
  updateMerchant = (params) => {
    let merchantInfo  = this.state.merchantInfo
    merchantInfo = Object.assign(merchantInfo, params)
    updateMerchant(params).then(res => {
      if (res.success) {
        this.setState({merchantInfo})
        message.success('头像上传成功！')
      }
    })
  }
  //更换头像
  beforeUpload = (type, img) => {
    const reader = new FileReader();
    reader.readAsDataURL(img);
    const flag = window.common.beforeUpload(img, message); //上传之前判断图片大小 小于2M
    if (flag) {
      reader.onload = e => {
        //img.thumbUrl = e.target.result;
        upload({img}).then(rs => {
          if (rs.success) {
            //this.setState({userAvatar: rs.data.url})
            this.updateMerchant({headImg: rs.data.url})
            EventBus.emit('ChangeAvatar', rs.data.url)
          }
        })
      }
    }
  }
  render() {
    const {merchantInfo} = this.state
    let  curr = this.props.location.state.current
    return(
      <div className={style['user']}>
        <header className="header-style">账号管理</header>
        <div className={style['user-avatra']}>
          <div className="g-tc">
            <Avatar shape="square" size={100} icon="user" src={merchantInfo.headImg} />
            <div>
              <Upload 
                name="file"
                beforeUpload={(img) => this.beforeUpload('front',img)}
                showUploadList={false}
              ><h1 className={style['img']}>更换头像</h1></Upload>
            </div>
          </div>
          <div className={style['account']}>
            {/*<p>登录账号：{merchantInfo.phone}</p>*/}
            <p>登录账号：<em >{merchantInfo.phone}</em>
              {
                Number(merchantInfo.merchantType) === 0 ? null : 
                Number(merchantInfo.isCrossAuth) !== 1 ? 
                <label className="ml10">
                  (<em className={style['certi']}>已认证</em>)
                </label> :
                <span  className="m5">
                  (<em>未认证</em>,<Link to={{pathname: '/authentication', state: {merchantType: 1}}}>立即认证</Link>)
                </span>
              }
            </p>
            <p>注册时间：{merchantInfo.createDate}</p>
          </div>
        </div>
        <div className={style['user-tabs']}>
          <Tabs activeKey={String(curr)}  onChange={(cur) => this.tabEvent(cur)}>
            <TabPane tab="账号设置" key="1">
              <PersonalSet  merchantInfo={merchantInfo} key={Date.now()} />
            </TabPane>
            <TabPane tab="商户中心" key="2">
              <MerchantCenter merchantInfo={merchantInfo} />
            </TabPane>
          </Tabs>
        </div>
      </div>
    )
  }
}
export default PersonalSetting