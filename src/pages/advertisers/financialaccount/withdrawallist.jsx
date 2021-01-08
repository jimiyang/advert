import React, {Component} from 'react';
import {DatePicker, Table, Input, Button} from 'antd';
import style from './style.less';
import moment from 'moment';
import {
  recordList
} from '@/api/api';
const {RangePicker} = DatePicker
class WithdrawList extends Component{
  constructor(props) {
    super(props);
    this.state = {
      loginName: null,
      withDrawData: [],
      search: {
        dateStart: null,
        dateEnd: null,
        campaignName: null
      },
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
      loading: false
    };
  }
  async componentDidMount() {
    const loginInfo = JSON.parse(window.localStorage.getItem('login_info'));
    await this.setState({loginName: loginInfo.data.loginName});
    if (this.props.isActive === 2) {
      this.loadList();
    }
  }
  loadList = async () => {
    const {search, pagination} = this.state;
    const params = {
      ...search,
      limit: pagination.limit,
      currentPage: pagination.currentPage
    };
    this.setState({loading: true})
    await recordList(params).then(rs => {
      if (rs.success) {
        const p = Object.assign(pagination, {total: rs.total})
        this.setState({withDrawData: rs.data, pagination: p});
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
  changeFormEvent = (e, type, value2) => {
    let search = this.state.search;
    let obj = {};
    switch(type) {
      case 'date':
        obj = {dateStart: value2[0], dateEnd: value2[1]};
        break;
      case 'campaignName':
        obj = {[type]: e.target.value};
        break;
      default:
        search = {[type]: e.target.value};
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
      search, {
        dateStart: null,
        dateEnd: null,
        campaignName: null
      }
    );
    const pagination = Object.assign(this.state.pagination, {currentPage: 1, current: 1});
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
      withDrawData,
      pagination,
      search,
      loading
    } = this.state;
    const columns = [
      {
        title: '结算时间',
        key: 'createDate',
        dataIndex: 'createDate',
        render: (record) => (
          <div className="g-tc">{window.common.getDate(record)}</div>
        )
      },
      {
        title: '活动',
        key: 'campaignName',
        dataIndex: 'campaignName',
        width: 400
      },
      {
        title: '公众号',
        key: 'appName',
        dataIndex: 'appName'
      },
      {
        title: '订单号',
        key: 'missionId',
        dataIndex: 'missionId'
      },
      {
        title: '金额(元)',
        key: 'settleTotalShow',
        dataIndex: 'settleTotalShow',
        align: 'right'
      }
    ];
    return(
      <div>
        <ul className={style.search}>
          <li>
            <label>创建时间：</label>
            <RangePicker 
              className={`w2600`}
              value={search.dateStart === null || search.dateStart === '' ? null : [moment(search.dateStart, 'YYYY-MM-DD'), moment(search.dateEnd, 'YYYY-MM-DD')]}
              onChange={(e, value) => this.changeFormEvent(e, 'date', value)}
            />
          </li>
          <li>
            <label className="ml10">活动：</label>
            <Input className={`${style['ipt']}`} value={search.campaignName} onChange={e => this.changeFormEvent(e, 'campaignName')} />
          </li>
          <li>
            <Button type="primary" onClick={() => this.searchEvent()} className="ml10">查询</Button>
          </li>
        </ul>
        <Table
          dataSource={withDrawData}
          columns={columns}
          rowKey={record => record.id}
          pagination={pagination}
          className="table"
          loading={loading}
        />
      </div>
    );
  }
}
export default WithdrawList;