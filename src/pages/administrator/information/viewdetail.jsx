import React, { Component } from 'react'
import { Button, Pagination, Input, message, Table, Popover ,Tooltip } from 'antd'
import style from '../style.less'
import {
  audit,
  getById,
  missionList,
  getDictByType,
  listReadCnt
} from '@/api/api'
const { TextArea } = Input
class ViewDetail extends Component {
  constructor(props) {
    super(props)
    this.state = {
      activeIndex: 1,
      form: {
        targetMediaCategory: [], //行业标签
        targetArea: [], //地域
      },
      campaignId: null,
      params: {
        auditStatus: null,
        auditRemark: '',
        id: ''
      },
      type: 0,//判断是查看活动页面[0]还是审核接单页面[1]
      missionData: [],
      pagination: {
        size: 'small',
        showSizeChanger: true,
        total: 0,
        currentPage: 1,
        limit: 10,
        pageSize: 10,
        onChange: this.changePage,
        onShowSizeChange: this.onShowSizeChange
      },
      provinceData: [],
      mediaData: [],
      hovered: '',
      readData: []
    }
  }
  async componentDidMount() {
    const state = this.props.location.state
    if (!state.id) return false
    const loginInfo = JSON.parse(window.localStorage.getItem('login_info'))
    const params = Object.assign(this.state.params, { loginName: loginInfo.data.loginName, id: state.id })
    await this.setState({
      params,
      type: state.type,
      campaignId: state.campaignId,
      activeIndex: state.type
    })
    await this.initDictionary('provinceType')
    await this.initDictionary('parent_mediatype')
    await this.initForm(state.id)
    await this.loadList()
  }
  initDictionary = (type) => {
    getDictByType({type}).then(rs => {
      let obj = type === 'provinceType' ? { provinceData: rs.data } : { mediaData: rs.data }
      this.setState({ ...obj })
    })
  }
  //初始化数据详情
  initForm = async (id) => {
    await getById({id}).then(rs => {
      if (rs.success) {
        const form = Object.assign(this.state.form, rs.data)
        const params = Object.assign(this.state.params, { auditRemark: form.auditRemark })
        this.setState({ form, params })
      }
    })
  }
  loadList = () => {
    const { pagination, campaignId} = this.state
    const param = {
      limit: pagination.limit,
      currentPage: pagination.currentPage,
      campaignId
    }
    //console.log(param)
    missionList(param).then(rs => {
      if (rs.success) {
        const p = Object.assign(pagination, { total: rs.data.totalNum })
        this.setState({ missionData: rs.data.items, pagination: p })
      }
    })
  }
  changePage = (page) => {
    page = page === 0 ? 1 : page
    const pagination = Object.assign(this.state.pagination, { currentPage: page })
    this.setState({ pagination })
    this.loadList()
  }
  //改变每页条数事件
  onShowSizeChange = (current, size) => {
    let p = this.state.pagination
    p = Object.assign(p, { currentPage: current, limit: size, pageSize: size })
    this.setState({ pagination: p })
    this.loadList()
  }
  changeFormEvent = (type, e) => {
    const params = Object.assign(this.state.params, { [type]: e.target.value })
    this.setState({ params })
  }
  changeTypeEvent = (index) => {
    this.setState({
      activeIndex: index
    })
  }
  checkEvent = (status) => {
    const {params } = this.state
    if (!params.auditRemark) {
      message.error('请填写审核意见')
      return false
    }
    const form = Object.assign(params, {auditStatus: status })
    audit(form).then(rs => {
      message.success(rs.message)
      window.history.go(-1)
    })
  }
  goBackEvent = () => {
    window.history.go(-1)
  }
  viewDataEvent = (item) => {
    const params = {
      missionId: item.missionId
    }
    listReadCnt(params).then(rs => {
      if (rs.success) {
        this.setState({ readData: rs.data.items })
      }
    })
  }
  handleHoverChange = (item, visible) => {
    let hovered
    if (visible === true) {
      this.viewDataEvent(item)
      hovered = item.id
    }
    this.setState({
      hovered
    });
  }
  render() {
    const {
      form,
      missionData,
      pagination,
      provinceData,
      mediaData,
      activeIndex,
      params,
      hovered,
      readData
    } = this.state
    const props = this.props.location.state
    const getDict = (type) => {
      switch (type) {
        case 'provinceType':
          let arr = []
          if (form.targetAreaArray !== undefined && provinceData !== undefined) {
            form.targetAreaArray.map(item => {
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
          if (form.targetMediaCategoryArray !== undefined && mediaData !== undefined) {
            form.targetMediaCategoryArray.map(item => {
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
    const content = (
      <dl className={style['drawer']}>
        <dt>
          <span>日期</span>
          <span>阅读量</span>
        </dt>
        {
          readData.map((item, index) => (
            <dd key={index}><span>{item.statDate}</span><span>{item.intPageReadUser}</span></dd>
          ))
        }
      </dl>
    );
    const columns = [
      {
        title: (
          <div className="col-header">
            <span>接单号</span>
            <span>广告标题</span>
            <span>粉丝量</span>
            <span>实际发文时间</span>
            <span>阅读单价(元)</span>
            <span>预估支出(元)</span>
            <span>实际阅读</span>
            <span>实际支出</span>
            <span>状态</span>
          </div>
        ),
        key: 'td',
        render: (record) => (
          <div className="table-row">
            <ul>
              <li>订单号: {record.missionId}</li>
              <li>接单时间: {window.common.getDate(record.createDate, true)}</li>
              <li>活动编号: {record.campaignId}</li>
            </ul>
            <div className="tab-col">
              <div><img src={record.headImg} /><br />{record.appNickName}</div>
              <div className="txthide">{record.campaignName}</div>
              <div style={{cursor: 'pointer'}}>
                <Tooltip placement="top" title={'由于微信限制，未认证号请到微信后台查看粉丝数'}>
                  {record.appTotalUserCnt ? record.appTotalUserCnt : '--'}
                </Tooltip>
              </div>
              <div>{record.realPostArticleTime === undefined ? '--' : record.realPostArticleTime}</div>
              <div>{record.adUnitPrice === undefined ? '--' : record.adUnitPrice}</div>
              <div>{record.estimateMin === undefined ? '--' : record.estimateMin}~{record.estimateMax === undefined ? '--' : record.estimateMax}</div>
              <div>
                {
                  record.missionRealReadCnt === undefined ? '--' :
                    <Popover
                      placement="bottom"
                      title='每日订单阅读量'
                      content={content}
                      trigger="hover"
                      visible={hovered === record.id ? true : false}
                      onVisibleChange={this.handleHoverChange.bind(this, record)}
                    >
                      <span className="blue-color cur">{record.missionRealReadCnt}</span>
                    </Popover>
                }
              </div>
              <div>{record.adRealCost === undefined ? '--' : record.adRealCost}</div>
              <div>
                {Number(record.missionStatus) === 19 ? '取消' : null}
                {Number(record.missionStatus) === 18 ? '审核失败' : window.common.missionStatus[Number(record.missionStatus) - 10]}
              </div>
            </div>
          </div>
        )
      }
    ]
    return (
      <div className={style.administrator}>
        <header className="header-style">活动详情</header>
        <div className={style.activityNav}>
          <a className={activeIndex === 1 ? `${style.active} cur` : ''} onClick={this.changeTypeEvent.bind(this, 1)}>接单媒体</a>
          <a  className={activeIndex === 0 ? `${style.active} cur` : ''} onClick={this.changeTypeEvent.bind(this, 0)}>活动详情</a>
        </div>
        <div className={activeIndex === 1 ? '' : 'hide'}>
          <Table
            className="table"
            size="middle"
            rowKey={record => record.id}
            columns={columns}
            dataSource={missionData}
            pagination={false}
          />
          <div className="g-tr mt10">
            <Pagination
              showSizeChanger
              size={pagination.size}
              onChange={this.changePage}
              onShowSizeChange={this.onShowSizeChange}
              current={pagination.currentPage}
              pageSize={pagination.pageSize}
              total={pagination.total}
            />
          </div>
          <div className="g-tc">
            <Button
              onClick={this.goBackEvent.bind(this)}
              style={{ padding: '0 25px' }}
            >返回</Button>
          </div>
        </div>
        <div className={`${style.createBlocks} ${activeIndex === 0 ? '' : 'hide'}`}>
          <div className={style.form} style={{ borderTop: 'none', paddingTop: 0 }}>
            <div>
              <div className={`${style.items} mb24`}>
                <label className={style.labName}>活动状态：</label>
                <div>{window.common.activityStatus(form.postStatus)}</div>
              </div>
              <div className={`${style.items} mb24`}>
                <label className={style.labName}>审核状态：</label>
                <div>{form.auditStatus === undefined ? '待审核' : window.common.activityStatusData[Number(form.auditStatus) - 1]}</div>
              </div>
              <div className={`${style.items} mb24`}>
                <label className={style.labName}>审核备注：</label>
                <div>
                  {
                    props.type === 1 ? form.auditRemark
                      :
                      <TextArea
                        rows={3}
                        className={style.txtA}
                        placeholder="请输入备注信息"
                        value={params.auditRemark}
                        style={{ width: '300px' }}
                        onChange={this.changeFormEvent.bind(this, 'auditRemark')}
                      />
                  }
                </div>
              </div>
              <div className={`${style.items} mb24`}>
                <label className={style.labName}>广告主名称：</label>
                <div>{form.advertiserName}</div>
              </div>
              <div className={`${style.items} mb24`}>
                <label className={style.labName}>商户编号：</label>
                <div>{form.merchantCode}</div>
              </div>
              <div className={`${style.items} mb24`}>
                <label className={style.labName}>剩余可接单数量：</label>
                <div>{form.availableCnt}</div>
              </div>
              {
                props.type === 1 ? null :
                  <div className="mb24" style={{ marginLeft: '125px' }}>
                    <div>
                      <Button
                        type="primary"
                        className="btn-orange"
                        onClick={this.checkEvent.bind(this, 1)}
                      >审核驳回</Button>
                      <Button type="primary" className="ml30" onClick={this.checkEvent.bind(this, 2)}>审核通过</Button>
                    </div>
                  </div>
              }
              <div className={`${style.items} mb24`}>
                <label className={style.labName} style={{ verticalAlign: 'top', marginTop: '10px' }}>素材：</label>
                <div>
                  <a href={`${window.common.articleUrl}/fshstatic/view.html?id=${form.postContent}`} target="_blank">
                    <img src={form.impImage} />
                  </a>
                </div>
              </div>
              <div className={`${style.items} mb24`}>
                <label className={style.labName}>活动名称：</label>
                <div>{form.campaignName}</div>
              </div>
              <div className={`mb24 ${style.items}`}>
                <label className={style.labName} style={{ verticalAlign: 'top', marginTop: '10px' }}>定向设定：</label>
                <ul className={style.target}>
                  <li>
                    <div className={style.cell}>
                      <em>男女：</em>
                      <div className={style.item}>
                        {Number(form.targetGender) !== 0 ? '设置比例' : '不限制'}
                      </div>
                      {
                        Number(form.targetGender) !== 0 ?
                          <div className={`${style.col} `}>
                            <div>{Number(form.targetGender) === 1 ? '男粉' : '女粉'}</div>
                            <em>></em>
                            <div className="ml10 bold">{form.targetGenderScale === undefined ? 0 : parseInt(form.targetGenderScale * 100)}%</div>
                          </div> : null
                      }
                    </div>
                  </li>
                  <li>
                    <div className={style.cell}>
                      <em>地域：</em>
                      <div className={style.item}>
                        {form.targetArea !== '[]' ? '已选推广地域' : '不限制'}
                      </div>
                      <div className={`${style.selDicTarget} bold`}>
                        {
                          form.targetAreaArray !== undefined ? getDict('provinceType').join(',') : null
                        }
                      </div>
                    </div>
                  </li>
                  <li className={style.last}>
                    <div className={style.cell}>
                      <em>类别：</em>
                      <div className={style.item}>
                        {form.targetMediaCategory !== '[]' ? '已选推广类别' : '不限制'}
                      </div>
                      <div className={`${style.selDicTarget} bold`}>
                        {
                          form.targetMediaCategoryArray !== undefined ? getDict('parent_mediatype').join(',') : null
                        }
                      </div>
                    </div>
                  </li>
                </ul>
              </div>
              <div className={`mb24 ${style.items}`}>
                <label className={style.labName} style={{ verticalAlign: 'top', marginTop: '10px' }}>公众号设定：</label>
                <ul className={`${style.setWx} clearfix`}>
                  {
                    form.missionLimit === 1 ?
                      <li>
                        每个公众号接过我的相似文案后
                      <div className={style.col}>
                          <div><span className="bold">{form.missionLimitDay}</span>天内不能再接我的广告</div>
                        </div>
                      </li> :
                      <li>每个公众号只可接本文案一次</li>
                  }
                </ul>
              </div>
              <div className={`mb24 ${style.items}`}>
                <label className={style.labName} style={{ verticalAlign: 'top', marginTop: '10px' }}>投放时间：</label>
                <ul className={`${style.setDate} clearfix`}>
                  <li>
                    <em>推广日期：</em>
                    <div>{window.common.getDate(form.dateStart)}~{window.common.getDate(form.dateEnd)}</div>
                  </li>
                  <li className={style.last}>
                    <em>发文时段：</em>
                    <div className="inlineb">
                      {form.hourStart === undefined ? '不限制' : `${form.hourStart}点~${form.hourEnd}点`}
                    </div>
                  </li>
                </ul>
              </div>
              <div className={`mb24 ${style.items}`}>
                <label className={style.labName} style={{ verticalAlign: 'top', marginTop: '10px' }}>预算：</label>
                <div className={style.setPrice}>
                  <ul className="clearfix">
                    <li>
                      <em>单价：</em>
                      <div><span className="bold">{form.unitPrice}</span>元 / 阅读</div>
                    </li>
                    <li>
                      <em>总预算：</em>
                      <div><span className="bold">{form.postAmtTotal}</span>元</div>
                    </li>
                  </ul>
                  <div className="mt30">预算阅读量：<em className="bold">{form.finalAvailableCnt}</em></div>
                </div>
              </div>
              <div className={`mb24 ${style.items}`}>
                <label className={style.labName}>投放位置：</label>
                <div className={style.adLocal}>
                  <div>
                    {form.appArticlePosition === 9 ? '不限' : window.common.advertLocal[form.appArticlePosition - 1]}
                  </div>
                  <em>广告最少保留时间：</em>
                  <div>{form.retentionTime}</div>
                </div>
              </div>
              {
                form.postAmtTotal < 5000 ? null :
                  <div>
                    <div className={`mb24 ${style.items}`}>
                      <label className={style.labName}>公众号类型：</label>
                      <ul className={style.pubType}>
                        <li>
                          {window.common.wxAccountType(form.appType)}
                        </li>
                      </ul>
                    </div>
                    <div className={`mb24 ${style.items}`}>
                      <label className={style.labName} style={{ verticalAlign: 'top'}}>粉丝数：</label>
                      <div className={style.fansNum}>
                        <div>
                          大于{form.fansNumLimit}
                        </div>
                        {form.userAppNumLimit === 0 ? null : <p>只允许同一用户下{form.userAppNumLimit}个公众号接单</p>}
                        {form.appMissionNumLimit === 0 ? null : <p>只允许接过{form.appMissionNumLimit}单以内的公众号接单</p>}
                      </div>
                    </div>
                  </div>
              }
              <div className={`mb24 ${style.items}`}>
                <label className={style.labName}>备注要求：</label>
                <div className={style.describe}>{form.remarks}</div>
              </div>
            </div>
          </div>
          {
            props.type === 1 ?
              <div className="g-tc">
                <Button
                  onClick={this.goBackEvent.bind(this)}
                  style={{ padding: '0 25px' }}
                >返回</Button>
              </div> : null
          }
        </div>

      </div>
    )
  }
}
export default ViewDetail