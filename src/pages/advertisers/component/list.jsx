import React, {Component} from 'react'
import {Pagination, DatePicker, Select, Button, Table, Tooltip, Popover, Icon, Modal} from 'antd'
import moment from 'moment'
import {
  missionList,
  listReadCnt,
  missionMonitorList
} from '@/api/api';//接口地址
import utils from '@/untils/common.js'
import style from '../mypromotion/style.less'
import Echart from '@/pages/components/echart'
const Option = Select.Option
const {RangePicker} = DatePicker
class ActivityMissionList extends Component {
  constructor(props) {
    super(props)
    this.state = {
      pagination: {
        size: 'small',
        showSizeChanger: true,
        showQuickJumper: true,
        total: 0,
        currentPage: 1,
        current: 1,
        limit: 10,
        pageSize: 10,
        onChange: current => this.changePage(current),
        onShowSizeChange: this.onShowSizeChange
      },
      search: {
        dateStart: null,
        dateEnd: null,
        missionStatus: null
      },
      hovered: '',
      readData: [],
      missionData: [],
      isChartsVisible: false
    }
  }
  componentWillReceiveProps(nprops) {
    if(this.props.campaignId != nprops.campaignId) {
        this.setState({
          campaignId:nprops.campaignId
        }, async () => {
          await this.loadList()
        })
    }
  }
  loadList = () => {
    const { pagination, campaignId, search } = this.state;
    const params = {
      currentPage: pagination.currentPage,
      limit: pagination.limit,
      campaignId,
      ...search
    };
    missionList(params).then(rs => {
      if (rs.success) {
        const p = Object.assign(pagination, { total: rs.data.totalNum });
        this.setState({ missionData: rs.data.items, pagination: p });
      }
    });
  }
  changePage = (page) => {
    page = page === 0 ? 1 : page;
    const pagination = Object.assign(this.state.pagination, { currentPage: page, current: page });
    this.setState({ pagination });
    this.loadList();
  }
  //改变每页条数事件
  onShowSizeChange = (current, size) => {
    let p = this.state.pagination;
    p = Object.assign(p, { currentPage: current, current, limit: size, pageSize: size });
    this.setState({ pagination: p });
    this.loadList();
  }
  changeFormEvent = (e, type, value) => {
    let search = this.state.search;
    let obj = {};
    switch (type) {
      case 'date':
        obj = { 'dateStart': value[0], 'dateEnd': value[1] };
        break;
      case 'missionStatus':
        obj = { [type]: e };
        break;
      default:
        obj = { [type]: e.target.value };
        break;
    }
    search = Object.assign(search, obj);
    this.setState({ search });
  }
  searchEvent = () => {
    let pagination = this.state.pagination;
    pagination = Object.assign(pagination, { currentPage: 1, current: 1 });
    this.setState({ pagination });
    this.loadList();
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
  };closeEvent = () => {
    this.setState({
      isChartsVisible: false
    })
  }
  closeEvent = () => {
    this.setState({
      isChartsVisible: false
    })
  }
  //查看阅读监控数
  viewEChartsEvent = (item) => {
    //console.log(item)
    missionMonitorList({ missionId: item.missionId }).then(rs => {
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
  render() {
    const {
      search,
      readData,
      hovered,
      missionData,
      pagination,
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
    const content = (
      <dl className={style.drawer}>
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
        title: '订单号',
        dataIndex: 'missionId',
        key: 'missionId',
        align: 'left',
      },
      {
        title: '接单账号',
        key: 'user',
        align: 'left',
        render: (e) => (
        <dl className={style['msgDl']}>
            <dt>
            <img src={e.headImg} alt="" style={{ width: '30px', height: '30px', borderRadius: '50%' }} />
            </dt>
            <dd style={{ width: 130 }}>{e.appNickName}</dd>
        </dl>
        )
      },
      {
        title: '粉丝量',
        dataIndex: 'appTotalUserCnt',
        key: 'appTotalUserCnt',
        align: 'center',
        render: (e) => (
        e ? <span>{e}</span> : <Tooltip placement="top" title={'由于微信限制，未认证号请到微信后台查看粉丝数'}>
            {e.appTotalUserCnt ? e.appTotalUserCnt : '--'}
        </Tooltip>
        )
      },
      {
        title: '文案内容',
        key: 'appArticlePosition',
        align: 'left',
        render: (e) => (
        <dl className={style['msgDl']}>
            <dt>
            <img src={e.impImage} alt="" width='60px' height='60px' />
            <p>{e.appArticlePosition == 9 ? '不限' : utils['advertLocal'][e.appArticlePosition - 1]}</p>
            </dt>
            <dd className={style['dd-hover']} onClick={() => {

            window.open(e.articleVisitUrl ? e.articleVisitUrl : `${utils.articleUrl}/fshstatic/view.html?id=${e.missionArticleId}`)
            }}>{e.title}</dd>
        </dl>
        )
      },
      {
        title: '接单时间',
        dataIndex: 'createDate',
        key: 'createDate',
        align: 'center',
        render: (e) => moment(e).format('YYYY-MM-DD HH:mm:ss')
      },
      {
        title: '发文时间',
        key: 'realPostArticleTime',
        align: 'center',
        render: (e) => (
        e ? <Tooltip placement="top" title={e.isNormalSend === 2 ? '未在时间要求段发文' : ''} >
            <span style={e.isNormalSend === 2 ? { color: 'red' } : {}}>{e.realPostArticleTime}</span>
        </Tooltip> : '--'
        )
      },
      {
        title: '预估阅读量',
        key: 'address',
        render: (e) => <span>{e.readUserMin}-{e.readUserMax}</span>,
        align: 'center',
      },
      {
        title: '实际阅读量',
        key: 'missionRealReadCnt',
        align: 'center',
        render: (e) => (
        <div>
            {
            e.missionRealReadCnt === undefined ? '--' :
                <Popover
                placement="bottom"
                title='每日订单阅读量'
                content={content}
                trigger="hover"
                visible={hovered === e.id ? true : false}
                onVisibleChange={this.handleHoverChange.bind(this, e)}
                >
                <span className="blue-color cur">{e.missionRealReadCnt}</span>
                </Popover>
            }
        </div>
        )
      },
      {
        title: '计费阅读量',
        dataIndex: 'settleReadCnt',
        key: 'settleReadCnt',
        render: (e) => e ? e : '--',
        align: 'center',
      },
      {
        title: '实际支出',
        dataIndex: 'adRealCost',
        key: 'adRealCost',
        render: (e) => e ? e : '--',
        align: 'center',
      },
      {
        title: '订单状态',
        dataIndex: 'missionStatus',
        key: 'missionStatus',
        align: 'center',
        render: (e) => {
          switch (e) {
            case 10:
            return '订单状态';
            case 11:
            return '待发文';
            case 12:
            return '已发文';
            case 13:
            return '待结算';
            case 14:
            return '结算完成';
            case 15:
            return '过期未发文';
            case 16:
            return '审核驳回';
            case 17 || 18:
            return '结算失败';
            case 19:
            return '订单取消'
          }
        }
      },
      {
        title: '阅读监控',
        render: (e) => (
        <div>
          {
            e.monitorStatus === 3 || e.monitorStatus === 4 ?
              <Tooltip title={window.common.monitorStatus[Number(e.monitorStatus) - 1]}>
                <span onClick={this.viewEChartsEvent.bind(this, e)}>
                  <Icon type="area-chart" style={{ cursor: 'pointer', color: '#64d', fontSize: '16px' }} />
                </span>
              </Tooltip>
                :
              <span>{e.monitorStatus === 1 ? '未监控' : '待监控'}</span>
          }
        </div>
        )
      },
    ];
    return(
        <div className={`table ${this.props.activeIndex === 0 ? '' : 'hide'}`}>
          <Modal
            visible={isChartsVisible}
            title="阅读数监控"
            width={800}
            onCancel={this.closeEvent.bind(this)}
            footer={
                <div className="g-tr">
                <Button type="primary" onClick={this.closeEvent.bind(this)}>关闭</Button>
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
            <ul className={`${style.search}`} style={{ margin: '20px 0' }}>
              <li>
                <label>发文时间</label>
                <RangePicker
                    value={search.dateStart === null || search.dateStart === '' ? null : [moment(search.dateStart, 'YYYY-MM-DD'), moment(search.dateEnd, 'YYYY-MM-DD')]}
                    className="w2600"
                    onChange={(e, value) => this.changeFormEvent(e, 'date', value)}
                />
              </li>
              <li>
                <label>订单状态</label>
                <Select
                  placeholder="全部"
                  value={search.missionStatus}
                  className="w120 select"
                  onChange={(e) => this.changeFormEvent(e, 'missionStatus')}
                >
                    <Option value={null}>全部</Option>
                    {
                    window.common.missionStatus.map((item, index) => (
                        <Option className={index === 0 || index === 6 ? 'hide' : ''} key={index} value={10 + index}>{item}</Option>
                    ))
                    }
                    <Option value={19}>取消</Option>
                </Select>
              </li>
              <li>
                <Button type="primary" className="ml10" onClick={this.searchEvent.bind(this)}>查询</Button>
              </li>
            </ul>
            <Table
                // className="table"
                // size="middle"
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
        </div>
    )
  }
}
export default ActivityMissionList