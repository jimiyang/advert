import React, {Component} from 'react';
import {DatePicker, Select, Input, Button, Table, message, Popconfirm, Tooltip} from 'antd';
import style from '../style.less';
import Link from 'umi/link';
import moment from 'moment';
import {
  checkAdCampaignList,
  updatePostStatusById
} from '@/api/api';
const Option = Select.Option;
const {RangePicker} = DatePicker;
class ActivityList extends Component{
  constructor(props) {
    super(props);
    this.state = {
      loginName: null,  
      search: {
        dateStart: null,
        dateEnd: null,
        postStatus: null,
        campaignName: null,
        campaignId: null,
        merchantCode: null,
        extrend_json: null
      },
      pagination: {
        size: 'small',
        limit: 10, //每页显示多少条
        currentPage: 1,
        current: 1,
        total: 0,
        showQuickJumper: true,
        showSizeChanger: true,
        onChange: this.changePage,
        onShowSizeChange: this.onShowSizeChange
      },
      activityData: [],
      loading: false
    }
  }
  async componentDidMount() {
    const loginInfo = JSON.parse(window.localStorage.getItem('login_info'));
    //let search = this.state.search
    //search = Object.assign(search, {merchantCode: loginInfo.data.merchantCode})
    await this.setState({loginName: loginInfo.data.loginName});
    this.loadList();
  }
  loadList = async () => {
    let {pagination, search} = this.state;
    const params = {
      currentPage: pagination.currentPage,
      limit: pagination.limit,
      ...search
    };
    this.setState({loading: true})
    await checkAdCampaignList(params).then(rs => {
      this.setState({loading: false})
      if (rs.success) {
        const p = Object.assign(pagination, {total: rs.total});
        this.setState({activityData: rs.data, pagination: p});
      }
    })
  }
  changePage = (page) => {
    page = page === 0 ? 1 : page;
    const pagination = Object.assign(this.state.pagination, {currentPage: page, current: page});
    this.setState({pagination});
    this.loadList();
  }
  //改变每页条数事件
  onShowSizeChange = (current, size) => {
    let p = this.state.pagination;
    p = Object.assign(p, {currentPage: current, current, limit: size});
    this.setState({pagination: p});
    this.loadList();
  }
  changeFormEvent = (e, type, value) => {
    let search = this.state.search;
    let obj = {};
    switch(type) {
      case 'date':
        obj = {'dateStart': value[0], dateEnd: value[0]};
        break;
      case 'postStatus':
        obj = {[type]: e};
        break;
      case 'extrend_json':
        obj = {[type]: e.target.value};
        break;
        case 'campaignId':
      obj = {[type]: e.target.value};
      break;
      case 'merchantCode':
        obj = {[type]: e.target.value};
        break;
      default:
        obj = {[type]: e};
        break;
    }
    search = Object.assign(search, obj);
    this.setState({search});
  }
  searchEvent = () => {
    const pagination = Object.assign(this.state.pagination, {currentPage: 1, current: 1});
    this.setState({pagination});
    this.loadList();
  }
  clearEvent = () => {
    let search = this.state.search;
    search = Object.assign(
      search,
      {
        dateStart: null,
        dateEnd: null,
        postStatus: null,
        campaignName: null
      }
    );
    const pagination = Object.assign(this.state.pagination, {currentPage: 1, current: 1});
    this.setState({search, pagination});
    this.loadList();
  }
  //取消
  //修改活动状态
  cancelActivityEvent = (item, type) => {
    let postStatus;
    //停止活动
    if (type === 'stop') {
      postStatus = 29;
    } else if (type === 'pause'){
      postStatus = item.postStatus === 27 ? 28 : 27;
    } else {
      postStatus = 25
    }
    const params = {
      id: item.id,
      postStatus
    };
    //console.log(params);
    updatePostStatusById(params).then(rs => {
      if (rs.success) {
        message.success(rs.message);
        this.loadList();
      }
    });
  }
  render() {
    const {
      search,
      activityData,
      pagination,
      loading
    } = this.state
    const columns = [
      {
        title: (
          <div className="col-header">
            <span>推广文章</span>
            <span>推广时间</span>
            <span>单价(阅读/元)</span>
            <span>预算(元)</span>
            <span>预估阅读量</span>
            <span>接单媒体数</span>
            <span>实际阅读</span>
            <span>实际支出</span>
            <span>状态</span>
            <span>操作</span>
          </div>
        ),
        key: 'td',
        render: (record) => (
          <div className="table-row">
            <ul>
              <li>活动编号: {record.campaignId}</li>
              <li>{window.common.getDate(record.createDate, true)}</li>
              <li className="txthide tmid">活动名称: 
                <Tooltip placement="topLeft" title={record.campaignName}>
                  <span>{record.campaignName}</span>
                </Tooltip>
              </li>
              <li>商户编号: {record.merchantCode}</li>
            </ul>
            <div className="tab-col">
              <div><a target="_blank" href={`${window.common.articleUrl}/fshstatic/view.html?id=${record.postContent}`}><img src={record.impImage}/></a></div>
              <div><p>{window.common.getDate(record.dateStart)}</p>~<p>{window.common.getDate(record.dateEnd)}</p></div>
              <div>{record.unitPrice}</div>
              <div>{record.postAmtTotal}</div>
              <div>{record.finalAvailableCnt === undefined ? '--' : record.finalAvailableCnt}</div>
              <div>{record.missionNum === undefined ? '--' : record.missionNum}</div>
              <div>{record.missionRealReadCnt === undefined ? '--' : record.missionRealReadCnt}</div>
              <div>{record.realCost === undefined ? '--' : record.realCost}</div>
              <div>{window.common.activityStatus(record.postStatus)}</div>
              <div>
                <div className="opeartion g-tc">
                  <div className="opeartion-items">
                    {
                      record.postStatus === 21 ? null : 
                      <div>
                        <Link
                          to={{
                            pathname: '/viewdetail', 
                            state: {id: record.id, campaignId: record.campaignId, type: 1}}
                          }
                        >查看</Link>
                      </div>
                    }
                    {record.postStatus === 21 ? 
                      <div>
                        <Link
                        to={{
                          pathname: '/viewdetail',
                          state: {id: record.id, campaignId: record.campaignId, type: 0}}
                        }
                        >审核</Link>
                      </div> : null
                    }
                    {
                      (record.postStatus === 27 || record.postStatus === 28) ? 
                        <div>
                          <Popconfirm
                            title={`是否要${record.postStatus === 27 ? '暂停' : '启动'}此活动?`}
                            onConfirm={() => this.cancelActivityEvent(record, 'pause')}
                            okText="是"
                            cancelText="否"
                          >
                            <a className="option mt10">{record.postStatus === 27 ? '暂停' : '启动'}</a>
                          </Popconfirm>
                        </div>
                        : null
                    }
                    {
                      (record.postStatus === 21 || record.postStatus === 27 || record.postStatus === 28) ? 
                        <div>
                          <Popconfirm
                            title="是否要停止此活动?"
                            onConfirm={() => this.cancelActivityEvent(record, 'stop')}
                            okText="是"
                            cancelText="否"
                          >
                            <a className="option mt10">停止</a>
                          </Popconfirm>
                        </div> : null
                    }
                    {record.postStatus === 23 ? 
                      <div>
                        <Popconfirm
                          title="是否要取消此活动?"
                          onConfirm={() => this.cancelActivityEvent(record, 'check')}
                          okText="是"
                          cancelText="否"
                        >
                          <a className="ml10">取消</a>
                        </Popconfirm>
                      </div> : null}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )
      }
    ];
    const height = document.body.offsetHeight - 130 - 260
    //console.log(height)
    return(
      <div className={style.administrator}>
        <header className="header-style">活动列表</header>
        <ul className={style.search}>
          <li>
            <label>推广时间</label>
            <RangePicker
              value={search.dateStart === null || search.dateStart === '' ? null : [moment(search.dateStart, 'YYYY-MM-DD'), moment(search.dateEnd, 'YYYY-MM-DD')]}
              className="w2600"
              onChange={(e, value) => this.changeFormEvent(e, 'date', value)}
            />
          </li>
          <li>
            <label>状态</label>
            <Select  className="w180" value={search.postStatus} onChange={e => this.changeFormEvent(e, 'postStatus')}>
              <Option value={null}>请选择</Option>
              {
                window.common.postStatus.map((item, index) => (
                  <Option key={index} value={item.id}>{item.name}</Option>
                ))
              }
            </Select>
          </li>
          <li>
            <label>文章标题</label>
            <Input className="w180" value={search.extrend_json} onChange={e => this.changeFormEvent(e, 'extrend_json')} />
          </li>
          <li>
            <label>活动编号</label>
            <Input className="w180" value={search.campaignId} onChange={e => this.changeFormEvent(e, 'campaignId')} />
          </li>
          <li>
            <label>商户编码</label>
            <Input className="w180" value={search.merchantCode} onChange={e => this.changeFormEvent(e, 'merchantCode')} />
          </li>
          <li>
            <Button type="primary" onClick={() => this.searchEvent()}>查询</Button>
            <Button className="ml10" onClick={() => this.clearEvent()}>重置</Button>
          </li>
        </ul>
        <Table
          dataSource={activityData}
          columns={columns}
          pagination={pagination}
          rowKey={record => record.id}
          loading={loading}
          scroll={{y: height}}
          className="table"
          size="middle"
        />
      </div>
    );
  }
}
export default ActivityList;
