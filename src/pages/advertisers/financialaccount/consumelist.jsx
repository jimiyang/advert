import React, {Component} from 'react';
import {DatePicker, Table, Icon, Input, Tooltip, Popover} from 'antd';
import style from './style.less';
import moment from 'moment';
import {
  expenditureList
} from '@/api/api';//接口地址
const { RangePicker} = DatePicker;
const { Search } = Input;
class ConsumeList extends Component{
  constructor(props) {
    super(props);
    this.state = {
      depositData: [],
      pagination: {
        size: 'small',
        limit: 10, //每页显示多少条
        currentPage: 1,
        current: 1,
        total: 0,
        showSizeChanger: true,
        onChange: this.changePage,
        onShowSizeChange: this.onShowSizeChange
      },
      search: {
        dateStart: null,
        dateEnd: null,
        nameOrCode: null
      },
      loading: false
    };
  }
  async componentDidMount() {
    const loginInfo = JSON.parse(window.localStorage.getItem('login_info'));
    await this.setState({loginName: loginInfo.data.loginName});
    if (this.props.isActive === 1) {
      this.loadList();
    }
  }
  loadList = async () => {
    const {search, pagination} = this.state;
    const params = {
      loginName: this.state.loginName,
      currentPage: pagination.currentPage,
      pageSize: pagination.limit,
      ...search
    };
    this.setState({loading: true})
    await expenditureList(params).then(rs => {
      if (rs.success) {
        const p = Object.assign(pagination, {total: rs.data.totalNum});
        this.setState({depositData: rs.data.items, pagination: p});
      }
      this.setState({loading: false})
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
  //改变每页条数事件
  onShowSizeChange = (current, size) => {
    let p = this.state.pagination;
    p = Object.assign(p, {currentPage: current, limit: size});
    this.setState({pagination: p});
    this.loadList();
  }
  changeFormEvent = (e, value) => {
    let search = this.state.search;
    let obj = {dateStart: value[0], dateEnd: value[1]};
    search = Object.assign(search, obj);
    this.setState({search}, () => {
      this.loadList()
    });
  }
  searchEvent = (value) => {
    const pagination = Object.assign(this.state.pagination, {currentPage: 1, current: 1});
    const search = Object.assign(this.state.search, {nameOrCode: value})
    this.setState({pagination, search});
    this.loadList();
  }
  componentWillUnmount() {
    this.setState = (state, callback) => {
      return;
    }
  }
  render(){
    const {
      depositData,
      pagination,
      search,
      loading
    } = this.state;
    const title = "推广活动停止后，根据各个订单消耗及结算情况，平台将活动预算金额中未能消耗的部分，分批次实时返回账户余额"
    function getChild(data) {
      //str = <ul className="f12" style={{marginBottom: 0}}></ul>
      let arr = [], typeArr = ['活动停止退还金额(元)', '订单完成退还金额(元)', '订单结算退还金额(元)', '活动结束退还金额(元)']
      data.map((item, index) => (
        arr.push(<li key={index}>{typeArr[item.type - 1]}：{item.refundAmountTypeTotal}</li>)
      ))
      return <ul className="f12">{arr}</ul>
    }
    const columns = [
      {
        title: '活动编号',
        key: 'campaignId',
        dataIndex: 'campaignId'
      },
      {
        title: '活动名称',
        key: 'campaignName',
        dataIndex: 'campaignName',
        width: 300
      },
      {
        title: '创建时间',
        key: 'createDate',
        dataIndex: 'createDate'
      },
      {
        title: '活动预算',
        key: 'postAmtTotal',
        dataIndex: 'postAmtTotal',
        align: 'right'
      },
      {
        title: (
          <div>退还金额（元）
            <Tooltip placement="rightTop" title={title}>
              <Icon type="question-circle" className="cur" />
            </Tooltip>
          </div>),
        align: 'right',
        render: (record) => (
          <div>
            <Popover placement="rightTop" title={null} content={getChild(record.refundDetailResponse)} trigger="hover">
              <span className="cur">{record.refundAmountTotal}</span>
            </Popover>
          </div>
        )
      },
      {
        title: '活动状态',
        key: 'postStatus',
        dataIndex: 'postStatus',
        render: (record) => (
          <div>{record === undefined ? '--' : window.common.activityStatus(record)}</div>
        )
      }
    ];
    return(
      <div>
        <ul className={style.search} style={{display: 'flex', justifyContent: 'space-between'}}>
          <li>
            <label>创建时间：</label>
            <RangePicker
              onChange={(e, value) => this.changeFormEvent(e, value)}
              className={`w2600`}
              value={search.dateStart === null || search.dateStart === '' ? null : [moment(search.dateStart, 'YYYY-MM-DD'), moment(search.dateEnd, 'YYYY-MM-DD')]}
            />
          </li>
          <li>
            <Search
              placeholder="搜索活动编号/活动名称"
              onSearch={value => this.searchEvent(value)}
              enterButton
              style={{width: '300px'}}
            />
          </li>
        </ul>
        <Table
          dataSource={depositData}
          columns={columns}
          rowKey={record => record.campaignId}
          pagination={pagination}
          className="table"
          loading={loading}
        />
      </div>
    );
  }
}
export default ConsumeList;