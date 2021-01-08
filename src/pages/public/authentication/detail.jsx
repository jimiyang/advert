import React, { Component} from 'react'
import { Button, Tag, message} from 'antd'
import {authGetDetail, adAuthDetail} from '@/api/api'
import style from './index.less'
import router from 'umi/router'
import ViewPic from '@/pages/components/viewpic'
class authDetail extends Component {
  state = {
    form: {}
  }
  async componentDidMount() {
    const token = this.props.location.state.token
    const phone = this.props.location.state.phone
    //商户类型
    const merchantType = this.props.location.state.merchantType
    await this.setState({
      phone,
      token,
      merchantType
    }, () => {
      this.initForm()
    })
  }
  initForm = async () => {
    const {merchantType, token} = this.state
    const Fun = Number(merchantType) === 1 ? adAuthDetail() : authGetDetail({token}) //1是广告主认证，2是流量主认证
    await Fun.then(rs => {
      let form = this.state.form
      if (rs.success) {
        form = Object.assign(form, rs.data)
        this.setState({form})
      }
    })
  }
  updateEvent = () => {
    const {token, phone, merchantType, form} = this.state
    if (form.isUpdate === 0) {
      message.warning('提现中无法更新认证信息')
    } else {
      router.push({pathname: '/authentication', state: {type: 'edit', token, phone, merchantType}})
    }
    
  }
  viewPicEvent = (url) => {
    this.setState({
      isImgVisible: true,
      imgUrl: url
    })
  }
  render() {
    const {
      form,
      phone,
      isImgVisible,
      imgUrl
    } = this.state
    return (
      <div className={style['authenticationForm']}>
        <h1 className={`${style['title']} mt30`}>认证状态</h1>
        <div style={{paddingBottom: '20px'}}>
          <Tag color={form.status === 1 ? "#f50" : null} className="mr20">待审核</Tag>
          <Tag color={form.status === 2 ? "#87d068" : null} className="mr20">审核通过</Tag>
          <Tag color={form.status === 3 ? "#f50" : null}>审核驳回</Tag>
          {
            form.auditInfo === undefined ? null :
              <div className={style['auditinfo']}><em>审核备注：</em>{form.auditInfo}</div>
          }
        </div>
        <h1 className={style['title']}>个人资料</h1>
        <ViewPic isImgVisible={isImgVisible} imgUrl={imgUrl} key={Date.now()} />
        <ul className={style['form']}>
          <li>
            <label>姓名：</label>
            <div className={style['content']}>{form.certificateName}</div>
          </li>
          <li>
            <label>提现人身份证号码：</label>
            <div className={style['content']}>
              {form.certificateNumber !== undefined ? window.common.reaplceStar(form.certificateNumber, 'certificateNumber') : '--'}
            </div>
          </li>
          <li>
            <label>证件有效期：</label>
            <div className={style['content']}>
              {window.common.getDate(form.certificateStartDate)}-{window.common.getDate(form.certificateEndDate)}
            </div>
          </li>
          <li className={style['h150']}>
            <label>身份证正面照：</label>
            <div className={style['content']}>
              <div className="uploader cur" onClick={() => this.viewPicEvent(form.certificatePhotoFrontUrl)}>
                <img src={form.certificatePhotoFrontUrl} alt="avatar" style={{width: '100%', maxHeight: '100%'}} />
                <div className={style['mask']}></div>
              </div>     
            </div>
          </li>
          <li className={style['h150']}>
            <label>身份证背面照：</label>
            <div className={style['content']}>
              <div className="uploader cur" onClick={() => this.viewPicEvent(form.certificatePhotoBackUrl)}>
                <img src={form.certificatePhotoBackUrl} alt="avatar" style={{width: '100%', maxHeight: '100%'}} />
                <div className={style['mask']}></div>
              </div>     
            </div>
          </li>
        </ul>
        <h1 className={style['title']}>提现账号</h1>
        <ul className={style['form']}>
          <li>
            <label>开户姓名：</label>
            <div className={style['content']}>
              {form.accountHolder !== undefined ? window.common.reaplceStar(form.accountHolder, 'accountHolder') : '--'}
            </div>
          </li>
          <li>
            <label>选择银行：</label>
            <div className={style['content']}>{form.bankName}</div>
          </li>
          <li>
            <label>开户行所在城市：</label>
            <div className={style['content']}>{form.subbranchProvinceName}</div>
            <div className={style['content']}>{form.subbranchCityName}</div>
          </li>
          <li>
            <label>开户银行支行名称：</label>
            <div className={style['content']}>{form.subbranchName}</div>
          </li>
          <li>
            <label>银行卡号：</label>
            <div className={style['content']}>
              {form.bankCardNumber !== undefined ? window.common.reaplceStar(form.bankCardNumber, 'bankCardNumber') : '--'}
            </div>
          </li>
          <li>
            <label>银行预留手机号：</label>
            <div className={style['content']}>{form.phoneNumber}</div>
          </li>
        </ul>
        <div style={{paddingLeft: '100px'}}>
          <Button type="primary" className="mr10"  onClick={() => this.updateEvent()}>更新认证</Button>
          <Button onClick={() => {window.history.go(-1)}}>返回</Button>
        </div>
      </div>
    )
  }
}
export default authDetail; 