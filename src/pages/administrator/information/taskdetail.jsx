import React, {Component} from 'react'
import {Button, Form, Input, message, Popconfirm, notification, Modal} from 'antd'
import style from '../style.less'
import {
  settleCampaign,
  missionSettleDetail,
  getDictByType,
  updateMissionStatusById,
  missionMonitorList
} from '@/api/api'
import Echart from '../../components/echart'
const {TextArea} = Input
class TaskDetail extends Component {
  constructor(props) {
    super(props)
    this.state = {
      form: {
        campaign: {
          campaignName: '', //活动名称
          postStatus: '', //活动状态
          auditRemark: '', //活动审核意见
          dateStart: '', //活动开始时间
          dateEnd: '', //活动结束时间
          targetGender: '', //男女比例
          targetMediaCategory: '', //行业标签
          impImage: '', //货送素材
          targetArea: '', //地域
          adType: '', //活动形式
          unitPrice: '', //活动阅读单价
        },
      },
      params: {
        remarks: null,
      },
      provinceData: [],
      mediaData: [],
      isDisabled: false,
      type: 0//判断是查看活动页面[0]还是审核接单页面[1]
    }
  }
  async componentDidMount() {
    const state = this.props.location.state
    if (!state.id) return false
    const token = window.localStorage.getItem('token')
    await this.setState({
      type: state.type,
      token,
      id: state.id
    })
    this.initDictionary('provinceType')
    this.initDictionary('parent_mediatype')
    this.initForm()
  }
  initDictionary = (type) => {
    const {token, form} = this.state
    getDictByType({type, token}).then(rs => {
      let obj = type === 'provinceType' ? {provinceData: rs.data } : {mediaData: rs.data}
      this.setState({...obj})
    })
  }
  openNotification = (type, str)=>{
    //使用notification.success()弹出一个通知提醒框 
    notification[type]({
      message:"结算状态",
      description: (str),
      duration: 10, //1秒
    })
  }
  //初始化数据详情
  initForm = () => {
    const {token, id} = this.state
    missionSettleDetail({id, token}).then(rs => {
      if (!rs.data) return false
      const form = Object.assign(this.state.form, rs.data)
      this.setState({form})
    })
  }
  changeFormEvent = (e, type) => {
    const params = Object.assign(this.state.params, {[type]: e.target.value})
    this.setState({params})
  }
  settleEvent = (e) => {
    e.preventDefault();
    this.props.form.validateFields((err, values) => {
      if (!err) {
        let {params, token, form} = this.state
        //console.log(values.settleReadCnt, params.settleReadCnt)
        const settleReadCnt = params.settleReadCnt === undefined ? values.settleReadCnt : params.settleReadCnt
        const adSettleReadCnt = params.adSettleReadCnt === undefined ? values.adSettleReadCnt : params.adSettleReadCnt
        const par = {
          settleMissions:[
            {
              remarks: params.remarks,
              missionId: form.missionId,
              settleReadCnt: settleReadCnt,
              adSettleReadCnt: adSettleReadCnt
            }
          ],
          token
        }
        //Object.assign(params, values, {token, missionId: [form.missionId]})
        //console.log(par)
        //return false
        this.setState({isDisabled: true})
        settleCampaign(par).then(rs => {
          const node = rs.data[0]
          if (rs.success && node.data.length > 0) {
            let type = node.success ? 'success' : 'error'
            this.openNotification(
              type,
              <div>
                <p>{node.data[0].data}{Number(node.data[0].isSuc) === 1 ? <em className="green-color">成功</em> : <em className="red-color">失败</em>}</p>
                <p>{node.data[1].data}<em>{Number(node.data[1].isSuc) === 1 ? <em className="green-color">成功</em> : <em className="red-color">失败</em>}</em></p>
                <p>{node.data[2].data}<em>{Number(node.data[2].isSuc) === 1 ? <em className="green-color">成功</em> : <em className="red-color">失败</em>}</em></p>
              </div>
            )
            this.setState({isDisabled: false})
            window.history.go(-1)
          }
        })
      }
    })
  }
  //订单取消
  cancelMission = (item) => {
    updateMissionStatusById({id: this.props.location.state.id, missionStatus: 19}).then(rs => {
      if (rs.success) {
        message.success(rs.message)
        window.history.go(-1)
      }
    })
  }
  viewMonitorEvent = (item) => {
    //console.log(item)
    missionMonitorList({missionId: item.missionId}).then(rs => {
      if (rs.success) {
        const data = rs.data
        this.setState({
          xData: data.xData, //横坐标
          yReadUserVal: data.yReadUserVal, //阅读量
          yReadUserData: data.yReadUserData,
          yDifVal: data.yDifVal, //阅读人数增量
          yDifValData: data.yDifValData,
          alias: data.alias,
          realPostArticleTime: data.realPostArticleTime,
          monitorDateStart: data.monitorDateStart,
          monitorDateEnd: data.monitorDateEnd,
          isChartsVisible: true,
          monitorStatus: data.monitorStatus,
          missionItems: item
        })
        //this.initChart()
      }
    })
  }
  closeEvent = () => {
    this.setState({
      isChartsVisible: false
    })
  }
  render() {
    const {
      form,
      provinceData,
      mediaData,
      params,
      isDisabled,
      isChartsVisible,
      missionItems,
      xData, //横坐标
      yReadUserVal, //阅读量
      yReadUserData,
      yDifVal, //阅读人数增量
      yDifValData,
      alias,
      realPostArticleTime,
      monitorDateStart,
      monitorDateEnd,
      monitorStatus
    } = this.state
    const {getFieldDecorator} = this.props.form;
    const state = this.props.location.state
    const compareVal =  (rule, value, callback) => {
      if (value === '') {
        callback('请输入流量主结算阅读量')
        return
      }
      if (!/^[0-9]\d*$/.test(Number(value))) {
        callback('只能输入整数')
        return
      }
      if (Number(value) > Number(form.settleReadCnt)) {
        callback('不能超出最大可结算量');
      }
      //this.props.form.resetFields(['adSettleReadCnt']);
      this.props.form.validateFields(['adSettleReadCnt'], (values) => {
        //console.log(values)
      });
      callback();
    };
    const adcompareVal =  (rule, value, callback) => {
      if (value === '') {
        callback('请输入广告主结算阅读量')
        return
      }
      if (!/^[0-9]\d*$/.test(Number(value))) {
        callback('只能输入整数')
        return
      }
      if (Number(value) > Number(form.adSettleReadCnt)) {
        callback('不能超出最大可结算量');
        return
      }
      if (Number(value) < Number(params.settleReadCnt)) {
        callback('广告主计费阅读量不得小于流量主计费阅读量');
        return
      } else if (params.settleReadCnt === undefined && Number(value) < Number(form.settleReadCnt)) {
        callback('广告主计费阅读量不得小于流量主计费阅读量');
        return
      }
      callback(); 
    };
    const getDict = (type) => {
      switch (type) {
        case 'provinceType':
          let arr = []
          if (form.campaign.targetAreaArray !== undefined && provinceData !== undefined) {
            form.campaign.targetAreaArray.map(item => {
              provinceData.map(node => {
                if (item === node.value) {
                  arr.push(node.label)
                }
              })
            })
          }
          return arr 
        case 'parent_mediatype':
          let arr1 = []
          if (form.campaign.targetMediaCategoryArray !== undefined && mediaData !== undefined) {
          form.campaign.targetMediaCategoryArray.map(item => {
              mediaData.map(node => {
                node.dictChildList.map(child => {
                  if (item === child.value) {
                    arr1.push(child.label)
                  }
                })
                
              })
            })
          }
          return arr1
      }
    }
    return (
      <div className={style.administrator}>
        <header className="header-style">订单详情</header>
        <Modal
          visible={isChartsVisible}
          title="阅读数监控"
          width={800}
          onCancel={() => this.closeEvent()}
          footer={
            <div className="g-tr">
              <Button type="primary" onClick={() => this.closeEvent()}>关闭</Button>
            </div>
          }
        >
          <Echart
            missionItems={missionItems}
            activeIndex={0}
            xData={xData} //横坐标
            yReadUserVal={yReadUserVal} //阅读量
            yReadUserData={yReadUserData}
            yDifVal={yDifVal} //阅读人数增量
            yDifValData={yDifValData}
            alias={alias}
            realPostArticleTime={realPostArticleTime}
            monitorDateStart={monitorDateStart}
            monitorDateEnd={monitorDateEnd}
            monitorStatus={monitorStatus}
          />
        </Modal>
        <div className={style.createBlocks}>
        <Form onSubmit={this.settleEvent} className={style.form} name="form" style={{borderTop: 'none', paddingTop: 0, marginTop: 0}}>
          <div>
              <div className={`${style.items} mb24`}>
                <label className={style.labName}>接单公众号：</label>
                <div>
                  <img src={form.headImg} style={{width: '50px', height: '50px', marginRight: '10px'}}/>{form.appNickName}
                </div>
              </div>
              <div className={`${style.items} mb24`}>
                <label className={style.labName}>商户编号：</label>
                <div>{form.flowMerchantCode}</div>
              </div>
              <div className={`${style.items} mb24`}>
                <label className={style.labName}>订单状态：</label>
                <div>
                  {
                    Number(form.missionStatus) === 18 ? '结算失败' : null
                  }
                  {
                    Number(form.missionStatus) === 19 ? '取消' : window.common.missionStatus[Number(form.missionStatus) - 10]
                  }
                </div>
              </div>
              <div className={`${style.items} mb24`}>
                <label className={style.labName}>接单时间：</label>
                <div>{form.createDate === undefined ? null : window.common.getDate(form.createDate, true)}</div>
              </div>
              <div className={`${style.items} mb24`}>
                <label className={style.labName}>接单位置：</label>
                <div>{window.common.advertLocal[form.appArticlePosition - 1]}</div>
              </div>
              <div className={`${style.items} mb24`}>
                <label className={style.labName}>发文时间：</label>
                <div>{form.realPostArticleTime === undefined ? '--' : form.realPostArticleTime}</div>
              </div>
              <div className={`${style.items} mb24`}>
                <label className={style.labName}>未结算订单预估总阅读：</label>
                <div>{form.readUserTotalMin}~{form.readUserTotalMax}</div>
              </div>
              <div className={`${style.items} mb24`}>
                <label className={style.labName}>
                {form.campaign.postStatus === 30 ? '活动完成剩余阅读' : '活动剩余可结算阅读'}
                ：</label>
                <div>{form.residueSettleCnt}</div>
              </div>
              <div className={`${style.items} mb24`}>
                <label className={style.labName}>订单预估阅读：</label>
                <div>{form.readUserMin}~{form.readUserMax}</div>
              </div>
              <div className={`${style.items} mb24`}>
                <label className={style.labName}>订单实际阅读：</label>
                <div>
                  {form.missionRealReadCnt}
                  <span className="purple-color ml30 cur" onClick={() => this.viewMonitorEvent(form)}>阅读数监控详情</span>
                </div>
              </div>
              <div className={`${style.items} ${state.type === 0 ? 'mb24' : ''}`}>
                <label
                  className={style.labName}
                  style={state.type === 0 ? null : { verticalAlign: 'top', paddingTop: '10px'}}
                >流量主结算阅读量：</label>
                {
                form.missionStatus !== 13 ? 
                  <div>
                    {
                      form.missionStatus === 11 || form.missionStatus === 12 ? '--' : form.settleReadCnt
                    }
                  </div>
                  :
                  <div>
                    {
                      state.type === 0 ? 
                      form.settleReadCnt :
                      <Form.Item>
                        {getFieldDecorator(
                          'settleReadCnt',
                          {
                            initialValue: form.settleReadCnt,
                            rules: [
                              //{required: true, message: '请输入结算阅读量'},
                              {validator: compareVal}
                            ]
                          }
                        )(
                          <Input onChange={(e) => this.changeFormEvent(e, 'settleReadCnt')}/>
                        )}
                      </Form.Item>
                    }
                  </div>
                }
              </div>
              <div className={`${style.items} ${state.type === 0 ? 'mb24' : ''}`}>
                <label
                  className={style.labName}
                  style={state.type === 0 ? null : { verticalAlign: 'top', paddingTop: '10px'}}
                >广告主结算阅读量：</label>
                {
                form.missionStatus !== 13 ? 
                  <div>
                    {
                      form.missionStatus === 11 || form.missionStatus === 12 ? '--' : form.adSettleReadCnt
                    }
                  </div>
                  :
                  <div>
                    {
                      state.type === 0 ? 
                      form.adSettleReadCnt :
                      <Form.Item>
                        {getFieldDecorator(
                          'adSettleReadCnt',
                          {
                            initialValue: form.adSettleReadCnt,
                            rules: [
                              //{required: true, message: '请输入结算阅读量'},
                              {validator: adcompareVal}
                            ]
                          }
                        )(
                          <Input style={{width: '280px'}} onChange={e => this.changeFormEvent(e, 'adSettleReadCnt')}/>
                        )}
                      </Form.Item>
                    }
                  </div>
                }
              </div>
              <div className={`${style.items} mb24`}>
                <label className={style.labName}
                style={state.type === 0 ? null : { verticalAlign: 'top', paddingTop: '10px'}}
                >结算备注：</label>
                {
                  form.missionStatus !== 13 ? 
                  <div>{form.remarks === undefined ? '--' : form.remarks}</div>
                    :
                  <div>
                    {
                      state.type === 0 ? 
                        form.remarks === undefined ? '--' : form.remarks
                          :
                        <div>
                          <TextArea
                            row={4}
                            className={style['textarea']}
                            value={params.remarks}
                            onChange={e => this.changeFormEvent(e, 'remarks')}
                          />
                          <Popconfirm
                            title="确认要执行结算吗?"
                            onConfirm={e => this.settleEvent(e)}
                            okText="是"
                            cancelText="否"
                          >
                            <Button type="primary" disabled={isDisabled === false ? false : true} htmlType="submit" className="ml30">结算</Button>
                          </Popconfirm>
                        </div>
                    }
                  </div>
                }
              </div>
              <div className={`${style.items} mb24`}>
                <label className={style.labName}>活动状态：</label>
                <div>{window.common.activityStatus(Number(form.campaign.postStatus))}</div>
              </div>
              <div className={`${style.items} mb24`}>
                <label className={style.labName}>审核状态：</label>
                <div>{window.common.activityStatusData[Number(form.campaign.auditStatus) - 1]}</div>
              </div>
              <div className={`${style.items} mb24`}>
                <label className={style.labName}>审核备注：</label>
                <div>{form.campaign.auditRemark}</div>
              </div>
              <div className={`${style.items} mb24`}>
                <label className={style.labName} style={{verticalAlign: 'top', marginTop: '10px'}}>素材：</label>
                <div>
                  <a href={`${window.common.articleUrl}/fshstatic/view.html?id=${form.campaign.postContent}`} target="_blank">
                    <img src={form.campaign.impImage} />
                  </a>
                </div>
              </div>
              <div className={`${style.items} mb24`}>
                <label className={style.labName}>活动名称：</label>
                <div>{form.campaign.campaignName}</div>
              </div>
              <div className={`mb24 ${style.items}`}>
                <label className={style.labName} style={{verticalAlign: 'top', marginTop: '10px'}}>定向设定：</label>
                <ul className={style.target}>
                  <li>
                    <div className={style.cell}>
                      <em>男女：</em>
                      <div className={style.item}>
                        {Number(form.campaign.targetGender) !== 0 ? '设置比例' : '不限制'}
                      </div>
                      {
                        Number(form.campaign.targetGender) !== 0 ? 
                        <div className={`${style.col}`}>
                          <div>{Number(form.campaign.targetGender) === 1 ? '男粉' : '女粉'}</div>
                          <em>></em>
                          <div className="ml10 bold">
                            {form.campaign.targetGenderScale === undefined ? 0 : form.campaign.targetGenderScale * 100}%
                          </div>
                        </div> : null
                      }
                    </div>
                  </li>
                  <li>
                    <div className={style.cell}>
                      <em>地域：</em>
                      <div className={style.item}>
                        {form.campaign.targetArea !== '[]'  ? '已选推广地域' : '不限制'}
                      </div>
                      <div className={`${style.selDicTarget} bold`}>
                        {
                          form.campaign.targetAreaArray !== undefined ? getDict('provinceType').join(',') : null
                        }
                      </div>
                    </div>
                  </li>
                  <li className={style.last}>
                    <div className={style.cell}>
                      <em>类别：</em>
                      <div className={style.item}>
                        {form.campaign.targetMediaCategory !== '[]'  ? '已选推广类别' : '不限制'}
                      </div>
                      <div className={`${style.selDicTarget} bold`}>
                        {
                          form.campaign.targetMediaCategoryArray !== undefined  ? getDict('parent_mediatype').join(',') : null
                        }
                      </div>
                    </div>
                  </li>
                </ul>
              </div>
              <div className={`mb24 ${style.items}`}>
                <label className={style.labName} style={{verticalAlign: 'top', marginTop: '10px'}}>公众号设定：</label>
                <ul className={`${style.setWx} clearfix`}>
                  {
                    form.missionLimit === 1 ? 
                    <li>
                      每个公众号接过我的相似文案后
                      <div className={style.col}>
                        <div><span className="bold">{form.campaign.missionLimitDay}</span>天内不能再接我的广告</div>
                      </div>
                    </li> : 
                    <li>每个公众号只可接本文案一次</li>
                  }
                </ul>
              </div>
              <div className={`mb24 ${style.items}`}>
                <label className={style.labName} style={{verticalAlign: 'top', marginTop: '10px'}}>投放时间：</label>
                <ul className={`${style.setDate} clearfix`}>
                  <li>
                    <em>推广日期：</em>
                    <div>{window.common.getDate(form.campaign.dateStart)}~{window.common.getDate(form.campaign.dateEnd)}</div>  
                  </li>
                  <li className={style.last}>
                    <em>发文时段：</em>
                    <div className="inlineb">
                      {form.campaign.hourStart === undefined ? '不限制' : `${form.campaign.hourStart}点~${form.campaign.hourEnd}点`}
                    </div>
                  </li>
                </ul>
              </div>
              <div className={`mb24 ${style.items}`}>
                <label className={style.labName} style={{verticalAlign: 'top', marginTop: '10px'}}>预算：</label>
                <div className={style.setPrice}>
                  <ul className="clearfix">
                    <li>
                      <em>单价：</em>
                      <div><span className="bold">{form.campaign.unitPrice}</span>元 / 阅读</div>
                    </li>
                    <li>
                      <em>总预算：</em>
                      <div><span className="bold">{form.campaign.postAmtTotal}</span>元</div>
                    </li>
                  </ul>
                  <div className="mt30">预算阅读量：<em className="bold">{form.campaign.finalAvailableCnt}</em></div>
                </div>
              </div>
              <div className={`mb24 ${style.items}`}>
                <label className={style.labName}>投放位置：</label>         
                <div className={style.adLocal}>
                  <div>
                    {form.campaign.appArticlePosition === 9 ? '不限' : window.common.advertLocal[form.campaign.appArticlePosition - 1]}  
                  </div>
                  <em>广告最少保留时间：</em>
                  <div>{form.campaign.retentionTime}小时</div>
                </div>         
              </div>
                {
                  form.postAmtTotal < 5000 ? null :
                  <div>
                      <div className={`mb24 ${style.items}`}>
                        <label className={style.labName}>公众号类型：</label>  
                        <ul className={style.pubType}>
                          <li>
                            {window.common.wxAccountType(form.campaign.appType)}
                          </li>
                        </ul>
                      </div>
                      <div className={`mb24 ${style.items}`}>
                        <label className={style.labName} style={{verticalAlign: 'top'}}>粉丝数：</label>   
                        <div className={style.fansNum}>
                          大于{form.campaign.fansNumLimit}
                          {form.campaign.userAppNumLimit === 0 ? null : <p>只允许同一用户下{form.campaign.userAppNumLimit}个公众号接单</p>}
                          {form.campaign.appMissionNumLimit === 0 ? null : <p>只允许接过{form.campaign.appMissionNumLimit}单以内的公众号接单</p>}
                        </div>
                    </div>
                  </div>
                }
                <div className={`mb24 ${style.items}`}>
                  <label className={style.labName}>备注要求：</label>         
                  <div className={style.describe}>{form.remarks === undefined ? '--' : form.remarks}</div>
                </div>
              </div>
          </Form>
        </div>
        <div className="mt30 g-tc">
          {
            Number(form.missionStatus) === 11 ? 
            <Popconfirm
              title="您确定要关闭这项业务吗?"
              onConfirm={() => this.cancelMission(form)}
              okText="是"
              cancelText="否"
            >
              <Button type="primary" >关闭</Button>
            </Popconfirm> : null
          }
           <Button onClick={() => {window.history.go(-1)}} className="ml30">返回</Button>
        </div>
      </div>
    ) 
  }
}
export default Form.create()(TaskDetail)