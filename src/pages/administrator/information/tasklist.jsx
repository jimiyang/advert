import React, {Component} from 'react'
import {Popover, Select, Input, Button, Table, message, notification, Modal} from 'antd'
import style from '../style.less'
import Link from 'umi/link'
import {
  missionList,
  settleCampaign,
  listReadCnt,
  missionMonitorList,
  updateMissionStatusById
} from '@/api/api'
import Echart from '@/pages/components/echart'
import ReactTooltip from 'react-tooltip'
const Option = Select.Option
let rowKeys = []
class TaskList extends Component{
  constructor(props) {
    super(props)
    this.state = {
      loginName: null,  
      search: {
        dateStart: null,
        dateEnd: null,
        missionStatus: null,
        campaignName: null,
        missionId: null
      },
      pagination: {
        size: 'small',
        pageSize: 10, //每页显示多少条
        currentPage: 1,
        current: 1,
        total: 0,
        showSizeChanger: true,
        onChange: this.changePage,
        onShowSizeChange: this.onShowSizeChange
      },
      activityData: [],
      selectedRowKeys: [],
      allchk: false,
      ischecked: [],
      isDisabled: false,
      isSubmit: false,
      placement: 'right',
      isVisible: false,
      missionTotal: 0,
      missionNotRelease: 0,
      readData: [],
      hovered: '',
      isChartsVisible: false,
      loading: false
    }
  }
  async componentDidMount() {
    this.loadList()
  }
  loadList = async () => {
    let {pagination, search} = this.state
    const params = {
      currentPage: pagination.currentPage,
      limit: pagination.pageSize,
      ...search
    }
    this.setState({loading: true})
    await missionList(params).then(rs => {
      this.setState({loading: false})
      if (rs.success) {
        const p = Object.assign(pagination, {total: rs.data.totalNum})
        //const rowKeys = this.getSettleData(data)
        this.setState({activityData: rs.data.items, pagination: p, ischecked: new Array(pagination.pageSize)})
      }
    })
  }
  getSettleData = (data) => {
    let arr = []
    if (data !== undefined || data.length !== 0) {
      data.map((item) => {
        if (item.missionStatus === 13) {
          arr.push(item)
        }
      })
    }
    return arr
  }
  changePage = (page) => {
    page = page === 0 ? 1 : page
    const pagination = Object.assign(this.state.pagination, {currentPage: page, current: page})
    this.setState({pagination, ischecked: false, allchk: false})
    this.loadList()
  }
  //改变每页条数事件
  onShowSizeChange = (current, size) => {
    let p = this.state.pagination
    p = Object.assign(p, {currentPage: current, current, pageSize: size})
    this.setState({pagination: p, ischecked: false, allchk: false})
    this.loadList()
  }
  changeFormEvent = (e, type) => {
    let search = this.state.search, obj = {}
    switch(type) {
      case 'missionStatus':
        obj = {[type]: e}
        break
      default:
        obj = {[type]: e.target.value}
        break
    }
    search = Object.assign(search, obj)
    this.setState({search})
  }
  searchEvent = () => {
    const pagination = Object.assign(this.state.pagination, {currentPage: 1, current: 1})
    this.setState({pagination})
    this.loadList()
  }
  clearEvent = () => {
    let search = this.state.search
    search = Object.assign(
      search,
      {
        flowMerchantCode: null,
        adMerchantCode: null,
        campaignId: null,
        appNickName: null,
        missionStatus: null,
        missionId: null
      }
    )
    const pagination = Object.assign(this.state.pagination, {currentPage: 1, current: 1})
    this.setState({search, pagination})
    this.loadList()
  }
  //全选反选
  onSelectChange = (e) => {
    let {activityData, ischecked} = this.state
    let rowKeys = []
    if (e.target.checked === true) {
      rowKeys =  this.getSettleData(activityData)
      activityData.map((item, index) => {
        ischecked[index] = true
      })
    } else {
      activityData.map((item, index) => {
        ischecked[index] = false
      })
      rowKeys = []
    }
    this.setState({allchk: e.target.checked, selectedRowKeys: rowKeys})
  }
  openNotification = (str)=>{
    //使用notification.success()弹出一个通知提醒框 
    notification.info({
      message:"结算状态",
      description: (str),
      duration: 10, //1秒
    }) 
  }
  //单条结算//appName: "好物指南针"campaignName
  settleEvent = (item) => {
    const loginName = this.state.loginName
    const params = {
      settleMissions: [
        {
          missionId: item.missionId,
          settleReadCnt: item.settleReadCnt
        }
      ],
      loginName
    }
    this.setState({isSubmit: true})
    if (this.state.isSubmit === true) {
      message.error('请勿重复结算!')
      return false
    }
    settleCampaign(params).then(rs => {
      let color=''
      let msg
      if(!rs.data[0].success) {
        color = 'red-color'
        msg = `${rs.data[0].data}`
      } else {
        color = 'green-color'
        msg = `${rs.data[0].data}`
      }
      this.openNotification(<div><p className={`${color}`}>{msg}</p></div>)
      const pagination = Object.assign(this.state.pagination, {currentPage: 1, current: 1})
      this.setState({pagination, isSubmit: false})
      this.loadList()
    })
  }
  singleEvent = (item, index, e) => {
    let ischecked = this.state.ischecked
    if (e.target.checked === true) {
      rowKeys[index] = item
      ischecked[index] = true
    } else {
      rowKeys.splice(index, 1)
      ischecked[index] = false
    }
    this.setState({ischecked, allchk: false, selectedRowKeys: rowKeys})
  }
  //批量结算
  batchSettleEvent = () => {
    let {selectedRowKeys, loginName} = this.state
    let settleMissions = []
    selectedRowKeys.map((item) => {
      settleMissions.push({missionId: item.missionId, settleReadCnt: item.settleReadCnt, title: item.adCampaign.advertiserName})
    })
    if (selectedRowKeys.length === 0) {
      message.error('请选择需要结算的数据')
      return false
    }
    this.setState({isDisabled: true})
    const params = {
      loginName,
      settleMissions
    }
    let arr = []
    settleCampaign(params).then(rs => {
      this.setState({isDisabled: false})
      if (rs.data.length > 0) {
        rs.data.map((item, index) => {
          if (!item.success) {
            arr.push(<p className="red-color">{item.data}</p>)
          } else {
            arr.push(<p key={index} className="green-color">{item.data}</p>)
          }
        })
        this.openNotification(<div>{arr}</div>)
        const pagination = Object.assign(this.state.pagination, {currentPage: 1, current: 1})
        this.setState({pagination})
        this.loadList()
      }
    })
  }
  viewDataEvent = (item) => {
    const params = {
      missionId: item.missionId
    }
    listReadCnt(params).then(rs => {
      if (rs.success) {
        this.setState({readData: rs.data.items})
      }
    })
  }
  closeEvent = () => {
    this.setState({isVisible: false})
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
  };
  //取消订单
  cancelMissionEvent = (id) => {
    let {search, pagination} = this.state
    search = Object.assign(
      search,
      {
        flowMerchantCode: null,
        adMerchantCode: null,
        campaignId: null,
        appNickName: null,
        missionStatus: null
      }
    )
    pagination = Object.assign(pagination, {currentPage: 1, current: 1})
    updateMissionStatusById({id, missionStatus: 19}).then(rs => {
      if (rs.success) {
        message.success(rs.message)
        this.setState({pagination, search}, () => {
          this.loadList()
        })
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
          missionItems: item,
          monitorStatus: data.monitorStatus
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
      search,
      activityData,
      pagination,
      allchk,
      ischecked,
      isDisabled,
      placement,
      isVisible,
      missionTotal,
      missionNotRelease,
      isChartsVisible,
      readData,
      hovered,
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
      monitorStatus,
      loading
    } = this.state
    /*const isShowCheckBox = this.getSettleData(activityData).length === 0 ? {} : {
      title: (<div>{<Checkbox checked={allchk} onChange={this.onSelectChange.bind(this)}/>}</div>),
      key: 'status',
      render: (text, record, index) => (
        <div>
          {record.missionStatus === 13 ? <Checkbox checked={ischecked[index]} key={record.id} onChange={this.singleEvent.bind(this, record, index)} /> : null}
        </div>
      )
    }*/
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
      //isShowCheckBox,
      {
        title: (
          <div className="col-header">
            <span>接单号</span>
            <span>广告标题</span>
            <span>粉丝量</span>
            <span>实际发文时间</span>
            <span>阅读单价(元)</span>
            <span>预估收入(元)</span>
            <span>实际收入(元)</span>
            <span>状态</span>
            <span>监控状态</span>
            <span>操作</span>
          </div>
        ),
        key: 'td',
        render: (record) => (
          <div className="table-row">
            <ul>
              <li>订单编号: {record.missionId}</li>
              <li>接单时间：{window.common.getDate(record.createDate, true)}</li>
              <li>活动编号: {record.campaignId}</li>
            </ul>
            <div className="tab-col">
              <div>
                <img className={style['headImg']} style={{height: '50px'}} src={record.headImg} />
                <br />
                {record.appNickName}
              </div>
              <div style={{width: '20%'}}>
                <label className={style['borl']}>{window.common.advertLocal[record.appArticlePosition - 1]}</label>
                <br/>
                <a
                  target="_blank"
                  href={`${record.articleVisitUrl === undefined ? `${window.common.articleUrl}/fshstatic/view.html?id=${record.missionArticleId}` : record.articleVisitUrl }`}
                  className="block txtHide"
                  data-tip={record.title}
                  data-html={true}
                >{record.title}</a>
                <ReactTooltip />
              </div>
              <div>{record.appTotalUserCnt}</div>
              <div>
                {record.realPostArticleTime === undefined ? '--' : record.realPostArticleTime}
              </div>
              <div>{record.adUnitPrice}</div>
              <div>{record.estimateMin}~{record.estimateMax}</div>
              <div>
                {
                  record.flowRealIncome === undefined ? '--' : 
                    <Popover
                      placement="bottom"
                      title='每日订单阅读量'
                      content={content}
                      trigger="hover"
                      visible={hovered === record.id ? true : false}
                      onVisibleChange={e => this.handleHoverChange(e, record)}
                    >
                      <span className="cur">{record.flowRealIncome}</span>
                    </Popover>
                }
              </div>
              <div>
                {Number(record.missionStatus) === 19 ? '取消' : null}
                {Number(record.missionStatus) === 18 ? '结算失败' : window.common.missionStatus[Number(record.missionStatus) - 10]}
              </div>
              <div>
                {window.common.monitorStatus[Number(record.monitorStatus) - 1]}
              </div>
              <div className="g-tc">
                <div className="opeartion-items">
                  {
                    record.missionStatus === 13 ?
                    <Link
                      to={{pathname: '/taskdetail', state: {id: record.id, type: 1}}}
                      className="block"
                    >结算</Link> : null
                  }
                  {
                    record.missionStatus === 11 ? <p className="cur purple-color" onClick={() => this.cancelMissionEvent(record.id)}>取消订单</p> : null
                  }
                  <Link to={{pathname: '/taskdetail', state: {id: record.id, type: 0}}}>查看</Link>
                  {
                    Number(record.monitorStatus) === 3 || Number(record.monitorStatus) === 4 ? 
                    <p className="cur purple-color" onClick={() => this.viewMonitorEvent(record)}>查看监控</p> : null
                  }
                </div>
              </div>
            </div>
          </div>
        )
      }
    ]
    const height = document.body.offsetHeight - 130 - 260
    return(
      <div className={style.administrator}>
        <header className="header-style">订单列表</header>
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
        <ul className={style.search}>
          <li>
            <label>公众号名称</label>
            <Input className="ml10" placeholder="请输入公众号名称" value={search.appNickName} onChange={e => this.changeFormEvent(e, 'appNickName')} />
          </li>
          <li>
            <label>活动编号</label>
            <Input className="ml10" placeholder="请输入活动编号" value={search.campaignId} onChange={e => this.changeFormEvent(e, 'campaignId')} />
          </li>
          <li>
            <label>状态</label>
            <Select
              className="ml10 w180"
              value={search.missionStatus}
              onChange={e => this.changeFormEvent(e, 'missionStatus')}
            >
              <Option value={null}>请选择</Option>
              {
                window.common.missionStatus.map((item, index) => (
                  <Option className={index === 0 || index === 6 ? 'hide' : ''} key={index} value={index + 10}>{item}</Option>
                ))
              }
              <Option value={19}>取消</Option>
            </Select>
          </li>
          <li>
            <label>广告主编号</label>
            <Input className="ml10" placeholder="请输入广告主编号" value={search.adMerchantCode} onChange={e => this.changeFormEvent(e, 'adMerchantCode')} />
          </li>
          <li>
            <label>流量主商户编号</label>
            <Input className="ml10" placeholder="请输入流量主商户编号" value={search.flowMerchantCode} onChange={e => this.changeFormEvent(e, 'flowMerchantCode')} />
          </li>
          <li className="w2600">
            <label>订单号</label>
            <Input className="ml10" placeholder="请输入订单号" value={search.missionId} onChange={e => this.changeFormEvent(e, 'missionId')} />
          </li>
          <li>
            <Button type="primary" onClick={() => this.searchEvent()}>查询</Button>
            <Button className="ml10" onClick={() => this.clearEvent()}>重置</Button>
          </li>
        </ul>
        {
          /*<div className={style.all}><Button type="primary" disabled={isDisabled} onClick={this.batchSettleEvent.bind(this)}>批量结算</Button></div>*/
        }
        <Table
          dataSource={activityData}
          columns={columns}
          pagination={pagination}
          //rowSelection={rowSelection}
          rowKey={record => record.id}
          loading={loading}
          scroll={{y: height}}
          className="table"
          size="middle"
        />
      </div>
    )
  }
}
export default TaskList