import React, { Component } from 'react'
import {Radio, Input, List, Icon, Tooltip, Button} from 'antd'
import router from 'umi/router';
import {
  activityMonitorList
} from '@/api/api'
import style from './style.less'
const { Search } = Input
class MonitorList extends Component {
  constructor(props) {
    super(props)
    this.state = {
      activityMonitorData: [],
      loading: false,
      search: {
        monitorStatus: '',
        name: null
      },
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
        onShowSizeChange: this.onShowSizeChange
      }
    }
  }
  async componentDidMount() {
    await this.loadList()
  }
  loadList = async () => {
    const {pagination, search} = this.state
    const params = {
      ...search,
      currentPage: pagination.currentPage,
      pageSize: pagination.pageSize
    }
    this.setState({loading: true})
    await activityMonitorList(params).then(rs => {
      this.setState({loading: false})
      if (rs.success) {
        const data = rs.data
        const p = Object.assign(pagination, {total: data.pageData.totalNum})
        this.setState({
          monitorFinish: data.monitorFinish,
          monitorWait: data.monitorWait,
          monitoring: data.monitoring,
          activityMonitorData: data.pageData.items,
          pagination: p,
          loading: false
        })
      }
    })
  }
  changePage = (page) => {
    page = page === 0 ? 1 : page;
    const pagination = Object.assign(this.state.pagination, { currentPage: page, current: page });
    this.setState({ pagination}, () => {
      this.loadList();
    });
  }
  //改变每页条数事件
  onShowSizeChange = (current, size) => {
    let p = this.state.pagination;
    p = Object.assign(p, { currentPage: current, current, pageSize: size });
    this.setState({ pagination: p}, () => {
      this.loadList();
    });
  }
  changeFormEvent = (e, type) => {
    let search = this.state.search
    search = Object.assign(search, {[type]: e.target.value})
    if (type === 'monitorStatus') {
      this.setState({search}, () => {
        this.loadList()
      })
    }
  }
  searchEvent = (value) => {
    const search = Object.assign(this.state.search, {name: value})
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
    router.push({
      pathname: '/missionmonitor',
      state: {
        campaignId: item.campaignId,
        appArticlePosition: item.appArticlePosition
      }
    })
  } 
  componentWillUnmount() {
    this.setState = (state, callback) => {
      return
    }
  }
  render() {
    const {
      id,
      search,
      pagination,
      monitorFinish,
      monitorWait,
      monitoring,
      activityMonitorData,
      loading
    } = this.state
    const grid = {
      gutter: 16,
      xs: 1, //<576px 展示的列数
      sm: 2, //≥576px 展示的列数
      md: 3, //≥768px 展示的列数
      lg: 4, //≥992px 展示的列数
      xl: 4, //≥1200px 展示的列数
      xxl: 5 //≥1600px 展示的列数
    };
    return(
      <div className={style['monitor']}>
        <div>
          <header className="header-style">
            阅读数监控
            <Tooltip placement="rightTop" title="实时监控文案订单生成后的实际阅读数据，监控时长为发文后24小时">
              <Icon type="question-circle" className={style['notice']}/>
            </Tooltip>
            <span className={style['header-title']}>
              当前共有<i>{pagination.total}</i>个活动已开启监控，
              包括<i>{monitorWait}</i>个待监控，
              <i>{monitoring}</i>个监控中，
              <i>{monitorFinish}</i>个监控完成。
            </span>
          </header>
        </div>
        <div className={style['search']}>
          <Radio.Group value={search.monitorStatus} onChange={e => this.changeFormEvent(e, 'monitorStatus')}>
            <Radio value="">全部</Radio>
            <Radio value={2}>待监控</Radio>
            <Radio value={3}>监控中</Radio>
            <Radio value={4}>监控完成</Radio>
          </Radio.Group>
          <div className="inlineb w260">
            <Search
              placeholder="搜索活动名称/文章标题"
              //value={search.name}
              //onChange={e => this.changeFormEvent(e, 'name')}
              onSearch={e => this.searchEvent(e)}
            />
          </div>
        </div>
        <List
          grid={grid}
          dataSource={activityMonitorData}
          className="list-tab"
          loading={loading}
          pagination={pagination}
          renderItem={(item, index) => (
            <List.Item>
              <div key={index} className={style['activity']}>
                <div className={style['activity-name']}>
                  <b>{item.appArticlePosition === 9 ? '不限' : window.common.advertLocal[Number(item.appArticlePosition) - 1]}</b>
                  <img src={item.impImage} style={{width: '66px', height: '66px', borderRadius: '2px'}}/>
                  <div className={`${style['title']} ml10`}>
                    <Tooltip placement="topLeft" title={item.campaignName}>
                      <h1>{item.campaignName}</h1>
                    </Tooltip>
                    <div className={style['mtitle']}>
                      <Tooltip placement="topLeft" title={item.title}>
                        <a href={`${window.common.articleUrl}/fshstatic/view.html?id=${item.postContent}`} target="_blank">
                          {item.title}
                        </a>
                      </Tooltip>
                    </div>
                  </div>
                </div>
                <div>
                  <p className={style['activity-status']}>
                    阅读增量趋势
                    {window.common.monitorReadNum(style, item.monitorStatus)}
                  </p>
                  <div className={style['activity-pic']} onMouseEnter={() => this.mouseEnterEvent(item.id)} onMouseLeave={() => this.mouseLeaveEvent()}>
                    <img src={require('@/assets/images/monitor-pic.png')} />
                    <div className={id === item.id ? null : 'hide'}>
                      <div className={style['layer']}></div>
                      <div className={style['content']}>
                        {
                          item.monitorStatus === 3 || item.monitorStatus === 4 ?
                            <Button type="primary" onClick={() => {this.viewMonitorEvent(item)}}>查看监控订单</Button>
                            :
                            <Tooltip title='监控未开始，无法查看监控账号'>
                              <Icon type="eye-invisible" className={style['ico']} theme="filled" /> 
                            </Tooltip>
                        }
                      </div>
                    </div>
                  </div>
                  <div className={style['activity-count']}>
                    {item.createDateStr}
                    <div>
                      <Icon type="eye" className={style['ico']} />
                      总阅读数：{window.common.reaplceFansNum(String(item.readUserTotal))}
                    </div>
                  </div>
                </div>
              </div>
            </List.Item>
          )}
        />   
      </div>
    )
  }
}
export default MonitorList