import React, {Component} from 'react'
import {Radio, Select, List, Icon, Tooltip, Button, Modal} from 'antd'
import style from './style.less'
import '@/assets/css/common.css'
import {
  missionOrderAppIdList,
  monitorOrderList,
  missionMonitorList
} from '@/api/api'
import Echart from '@/pages/components/echart'
const Option = Select.Option
class MissionMonitor extends Component {
  constructor(props) {
    super(props)
    this.state = {
      monitorOrderData: [],
      loading: false,
      pagination: {
        size: 'small',
        showQuickJumper: true,
        showSizeChanger: true,
        total: 0,
        currentPage: 1,
        current: 1,
        pageSize: 10,
        pageSize: 10,
        onChange: this.changePage,
        onShowSizeChange: this.onShowSizeChange,
      },
      search: {
        monitorStatus: '',
        appId: null
      },
      appData: [],
      isChartsVisible: false
    }
  }
  async componentDidMount() {
    await this.setState({
      campaignId: this.props.location.state.campaignId,
      appArticlePosition: this.props.location.state.appArticlePosition
    }, async () => {
      await this.loadList()
      await this.AppIdList()
    })
  }
  loadList = () => {
    const {campaignId, pagination, search} = this.state
    this.setState({loading: true})
    const params = {
      campaignId,
      currentPage: pagination.currentPage,
      limit: pagination.pageSize,
      ...search
    }
    monitorOrderList(params).then(rs => {
      this.setState({loading: false})
      //console.log(rs.data.appArticlePosition)
      if (rs.success) {
        const data = rs.data
        const p = Object.assign(pagination, {total: data.pageData.totalNum})
        this.setState({
          monitorOrderData: data.pageData.items,
          monitorFinish: data.monitorFinish,
          monitorWait: data.monitorWait,
          monitoring: data.monitoring,
          campaignId: data.campaignId,
          campaignName: data.campaignName,
          impImage: data.impImage,
          pagination: p,
          title: data.title,
          postContent: data.postContent
        })
      }
    })
  }
  AppIdList = async () => {
    missionOrderAppIdList({campaignId: this.state.campaignId}).then(rs => {
      if (rs.success) {
        this.setState({
          appData: rs.data
        })
      }
    })
  }
  changeFormEvent = (e, type) => {
    let search = this.state.search
    const value = e !== null ?  typeof e === 'object' ? e.target.value : e : null
    search = Object.assign(search, {[type]: value})
    this.setState({search}, () => {
      this.loadList()
    })
  }
  mouseEnterEvent = (id) => {
    this.setState({id})
  }
  mouseLeaveEvent = () => {
    this.setState({id: null})
  }
  viewMonitorEvent = (item) => {
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
      id,
      monitorOrderData,
      loading,
      pagination,
      monitorFinish,
      monitorWait,
      monitoring,
      campaignName,
      impImage,
      appArticlePosition,
      title,
      postContent,
      search,
      appData,
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
    const grid = {
      gutter: 16,
      xs: 1, //<576px 展示的列数
      sm: 2, //≥576px 展示的列数
      md: 3, //≥768px 展示的列数
      lg: 4, //≥992px 展示的列数
      xl: 4, //≥1200px 展示的列数
      xxl: 5 //≥1600px 展示的列数
    }
    return(
      <div className={style['monitor']}>
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
        <div>
          <header className="header-style">
            订单监控
            <Tooltip placement="rightTop" title="仅能查询已接单且启动阅读监控的公众号">
              <Icon type="question-circle" className={style['notice']}/>
            </Tooltip>
            <span className={style['header-title']}>
              当前活动共有<i>{pagination.total}</i>个接单账号已开启监控，
              包括<i>{monitorWait}</i>个待监控，
              <i>{monitoring}</i>个监控中，
              <i>{monitorFinish}</i>个监控完成。
            </span>
          </header>
        </div>
        <div className={style['activity-name']}>
          <b>{appArticlePosition === 9 ? '不限' : window.common.advertLocal[appArticlePosition - 1]}</b>
          <img src={impImage} style={{width: '66px', height: '66px', borderRadius: '2px'}}/>
          <div className={`${style['title']} ml10 mr10`}>
            <Tooltip placement="topLeft" title={campaignName}>
              <h1 style={{width: '300px'}}>{campaignName}</h1>
            </Tooltip>
            <div className={style['mtitle']}>
              <Tooltip placement="topLeft" title={title}>
                <a href={`${window.common.articleUrl}/fshstatic/view.html?id=${postContent}`} target="_blank">{title}</a>
              </Tooltip>
            </div>
          </div>
        </div>
        <div className={`${style['search']} mt30`}>
          <div className="inlineb">
            选择监控账号
            <Select
              showSearch
              className={`w260 ${style['ml10']}`}
              optionFilterProp="children"
              placeholder="请选择或搜索监控账号"
              filterOption={(input, option) =>
                //console.log(option.props.children)
                option.props.children[1].indexOf(input) >= 0
              }
              onChange={e => this.changeFormEvent(e, 'appId')}
            >  
              <Option value={null}><i></i>全部账号</Option>
              {
                appData.map((item, index) => (
                  <Option key={index} value={item.appId}>
                    <img src={item.headImg} className={style['head-img']}/>
                    {item.appNickName}
                  </Option>   
                ))
              }
            </Select>
          </div>
          <div>
            排序：
            <Radio.Group value={search.monitorStatus} onChange={e => this.changeFormEvent(e, 'monitorStatus')}>
              <Radio value="">默认</Radio>
              <Radio value={2}>待监控</Radio>
              <Radio value={4}>监控完成</Radio>
              <Radio value={3}>监控中</Radio>
            </Radio.Group>
          </div>
        </div>
        <div>
          <List
            grid={grid}
            dataSource={monitorOrderData}
            loading={loading}
            pagination={pagination}
            renderItem={(item, index) => (
            <List.Item>
                <div key={index} className={style['activity']}>
                    <div className={style['activity-name']}>
                    <img src={item.headImg} />
                    <div className={`${style['title']} ml10 mr10`}>
                        <h1>{item.appNickName}</h1>
                        <p>{item.alias}</p>
                    </div>
                    </div>
                    <div>
                    <p className={style['activity-status']}>
                      阅读增量趋势
                      {window.common.monitorReadNum(style, item.monitorStatus)}
                    </p>
                    <div className={style['activity-pic']} onMouseEnter={() => this.mouseEnterEvent(item.missionId)} onMouseLeave={() => this.mouseLeaveEvent()}>
                        <img src={require('@/assets/images/monitor-pic.png')} />
                        <div className={id === item.missionId ? null : 'hide'}>
                        <div className={style['layer']}></div>
                        <div className={style['content']}>
                          {
                          item.monitorStatus === 3 || item.monitorStatus === 4 ?
                            <Button type="primary" onClick={() => {this.viewMonitorEvent(item)}}>查看阅读数详情</Button>
                            :
                            <Tooltip title='监控未开始，无法查看监控账号'>
                              <Icon type="eye-invisible" className={style['ico']}/> 
                            </Tooltip>
                          }
                        </div>
                        </div>
                    </div>
                    <div className={style['activity-count']}>
                      <div>
                        <Icon type="eye" className={style['ico']} />
                        阅读数：{window.common.reaplceFansNum(String(item.readUserTotal))}
                      </div>
                    </div>
                  </div>
                </div>
             </List.Item>
            )}
          />
        </div>
      </div>
    )
  }
}
export default MissionMonitor