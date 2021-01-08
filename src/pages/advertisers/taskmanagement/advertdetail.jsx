import React, {Component} from 'react'
import {Button, Radio, Input, message} from 'antd'
import style from './style.less'
import {
  missiongetById,
  checkMissionOrderById
} from '@/api/api'//接口地址
import Dictionary from  '@/components/dictionary' //字典标签
const {TextArea} = Input
class AdvertDetail extends Component{
  constructor(props) {
    super(props)
    this.state = {
      form: {},
      params: {
        missionStatus: 11,
        loginName: '',
        audit_remark: '',
        id: ''
      },
      type: '0'//判断是查看活动页面[0]还是审核接单页面[1]
    }
  }
  async componentDidMount() {
    const state = this.props.location.state
    if (state === undefined) return false
    const loginInfo = JSON.parse(window.localStorage.getItem('login_info'))
    const params = Object.assign(this.state.params, {loginName: loginInfo.data.loginName, id: state.id})
    await this.setState({
      params,
      type: state.type
    })
    this.initForm(state.id)
  }
  //初始化数据详情
  initForm = (id) => {
    missiongetById({id}).then(rs => {
      if (!rs.data) return false
      const form = Object.assign(this.state.form, rs.data.adCampaign, rs.data.adMissionOrder)
      const params = Object.assign(this.state.params, {audit_remark: form.auditRemark})
      this.setState({form, params})
    })
  }
  changeFormEvent = (type, e) => {
    const params = Object.assign(this.state.params, {[type]: e.target.value})
    this.setState({params})
  }
  //审核
  checkEvent = () => {
    const {params} = this.state
    if(!params.audit_remark) {
      message.error('请填写审核意见')
      return false
    }
    checkMissionOrderById(params).then(rs => {
      if (rs.success) {
        message.success(rs.message)
        window.history.go(-1)
      }
    })
  }
  //返回
  goBackEvent = () => {
    window.history.go(-1)
  }
  render() {
    const {
      form,
      type,
      params
    } = this.state
    return(
      <div className={style.task}>
        <h1 className="nav-title">已接订单 > 订单详情</h1>
        <div className={style.connentItems}>
          <ul className={style.detaillist}>
            <li>订单号：<div>{form.missionId}</div></li>
            <li>接单公众号：<div>{form.appNickName}</div></li>
            <li>公众号id：<div>{form.appId}</div></li>
            <li>发文位置：<div>{window.common.advertLocal[form.appArticlePosition]}</div></li>
            <li>计费方式：<div>{window.common.billingTypesData[form.billingType]}</div></li>
            <li>阅读单价：<div>{form.adUnitPrice}元/次阅读</div></li>
            <li>接单数量（阅读）：<div>{form.missionReadCnt}</div></li>
            <li>接单时间：<div>{window.common.getDate(form.createDate, true)}</div></li>
            <li>预计发文时间：<div>{form.planPostArticleTime}</div></li>
            <li>实际发文时间：<div>{form.realPostArticleTime}</div></li>
            {
              type === 1 ? <li>审核状态：<div>
                <Radio.Group onChange={this.changeFormEvent.bind(this, 'missionStatus')} value={params.missionStatus}>
                  <Radio value={11}>通过</Radio>
                  <Radio value={16}>不通过</Radio>
                </Radio.Group>
                </div>
              </li> : null
            }
            {
              type === 1 ? <li><TextArea rows={4} className={style.textarea} value={params.audit_remark} onChange={this.changeFormEvent.bind(this, 'audit_remark')} /></li> : null
            }  
          </ul>
          <ul className={style.detaillist}>
            <li>活动名称：<div>{form.campaignName}</div></li>
            <li>活动id：<div>{form.campaignId}</div></li>
            <li>
              <div>
                <div className={style.coverimg}>
                  <a href={`${window.common.articleUrl}fshstatic/view.html?id=${form.postContent}`} target="_blank">
                    <img src={form.impImage} />
                    <span>{form.extrendJson}</span>
                  </a>
                </div>
              </div>
            </li>
            <li>
              活动日期：
              <div>{window.common.getDate(form.dateStart, false)} 至 {window.common.getDate(form.dateEnd, false)}</div>
            </li>
            <li>
              活动形式：
              <div>{window.common.getAdType(form.adType)}</div>
            </li>
            <li>
              条件设置：
              <div>
                <ul>
                  <li>
                    <span className={style.stitle}>男女比例-{window.common.targetGender[Number(form.targetGender)]}</span>
                  </li>
                  <li>
                    <span className={style.stitle}>选择行业-{form.targetMediaCategory === '[]' ? '不限(默认)' : '自定义'}</span>
                    <div className={`mb10 ${form.targetMediaCategory === '[]' ? 'hide' : null}`}>
                      <Dictionary type="mediaType" readOlny={true} tagData={form.targetMediaCategory} />
                    </div>
                  </li>
                  <li>
                    <span className={style.stitle}>选择地域-{form.targetArea === '[]' ? '不限(默认)' : '自定义'}</span>
                    <div className={`mb10 ${form.targetArea === '[]' ? 'hide' : null}`}>
                      <Dictionary type="provinceType" readOlny={true} tagData={form.targetArea} />
                    </div>
                  </li>
                </ul>  
              </div>
            </li>
            <li>
              活动效果：
              <div>预计您的广告将实现<em className="red-color m5">{window.common.formatNumber(Math.round(form.postAmtTotal / form.unitPrice))}</em>次有效阅读</div>
            </li>
          </ul>
        </div>
        <div className="mt30">
          {
            type === 1 ?
              <Button type="primary"  className="mr10" onClick={this.checkEvent.bind(this)}>提交</Button>
            : null
          }
          <Button onClick={this.goBackEvent.bind(this)}>返回</Button>
        </div>
      </div>
    )
  }
}
export default AdvertDetail