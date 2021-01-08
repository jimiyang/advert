import React, { Component } from 'react';
import { DatePicker, Input, Table, Button} from 'antd';
import style from './style.less';
import moment from 'moment';
import router from "umi/router";
import {
  flowFinanceList,
} from '@/api/api';
const {RangePicker} = DatePicker
class ArningsList extends Component {
  constructor(props) {
    super(props);
    this.state = {
      earningsData: [],
      availableBalance: '.', //可用余额
      settlecaBalance: '.', //冻结余额
      search: {
        dateStart: null,
        dateEnd: null,
        missionId: null
      },
      pagination: {
        size: 'small',
        showSizeChanger: true,
        total: 0,
        currentPage: 1,
        current: 1,
        limit: 10,
        onChange: this.changePage,
        onShowSizeChange: this.onShowSizeChange
      },
      isActive: 1,
    };
  }
  componentDidMount() {
    this.setState({
      token:this.props.token
    }, async () => {
      //const loginInfo = JSON.parse(window.localStorage.getItem('login_info'));
      //await this.setState({ loginName: loginInfo.data.loginName});
      await this.loadList();
      //this.getCaQuery();
    })
  }
  loadList = () => {
    const {pagination, search, token} = this.state;
    const params = {
      currentPage: pagination.currentPage,
      limit: pagination.limit,
      ...search,
      token
    };
    flowFinanceList(params).then(rs => {
      if (rs.success) {
        const p = Object.assign(pagination, { total: rs.total });
        this.setState({ earningsData: rs.data, pagination: p });
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
    p = Object.assign(p, { currentPage: current, current, limit: size });
    this.setState({ pagination: p });
    this.loadList();
  }
  changeFormEvent = (e, type, value) => {
    let search = this.state.search,
        obj = {};
    switch (type) {
      case 'date':
        obj = { dateStart: value[0], dateEnd: value[1] };
        break;
      case 'missionId':
        obj = { [type]: e.target.value };
        break;
      default:
        break;
    }
    search = Object.assign(search, obj);
    this.setState({ search });
  }
  searchEvent = () => {
    const pagination = Object.assign(this.state.pagination, { currentPage: 1, current: 1 });
    this.setState({ pagination });
    this.loadList();
  }
  clearEvent = () => {
    let search = this.state.search;
    search = Object.assign(
      search,
      {
        dateStart: null,
        dateEnd: null,
        missionId: null
      }
    );
    const pagination = Object.assign(this.state.pagination, { currentPage: 1, current: 1 });
    this.setState({ pagination, search });
    this.loadList();
  }
  //提现弹窗
  widthdrawEvent = () => {
    router.push('/getcash');
  }
  render() {
    const {
      earningsData,
      pagination,
      search
    } = this.state;
    const columns = [
      {
        title: '结算时间',
        key: 'updateDate',
        dataIndex: 'updateDate',
        align: 'left',
        render:(e)=>(
          moment(e).format('YYYY-MM-DD')
        )
      },
      {
        title: '结算单号',
        key: 'orderNo',
        dataIndex: 'orderNo',
        align: 'center'
      },
      {
        title: '订单号',
        key: 'missionId',
        dataIndex: 'missionId',
        align: 'center'
      },
      {
        title: '活动',
        key: 'campaignName',
        dataIndex: 'campaignName',
        align: 'center'
      },
      {
        title: '公众号',
        key: 'appName',
        dataIndex: 'appName',
        align: 'center'
      },
      {
        title: '结算金额（元）',
        key: 'orderAmtShow',
        dataIndex: 'orderAmtShow',
        align: 'center'
      },


    ];
    return (
      <div className={style.arnings}>
        <ul className={style.search}>
          <li>
            <label className="mr10">结算时间</label>
            <RangePicker 
              className={`w2600`}
              value={search.dateStart === null || search.dateStart === '' ? null : [moment(search.dateStart, 'YYYY-MM-DD'), moment(search.dateEnd, 'YYYY-MM-DD')]}
              onChange={(e, value) => this.changeFormEvent(e, 'date', value)}
            />
          </li>
          <li>
            <label className="mr10">订单号</label>
            <Input className="w180" value={search.missionId} onChange={(e) => this.changeFormEvent(e, 'missionId')} />
          </li>
          <li>
            <Button type="primary" onClick={this.searchEvent.bind(this)}>查询</Button>
            <Button onClick={this.clearEvent.bind(this)} className="ml10">重置</Button>
          </li>
        </ul>
        <Table
          dataSource={earningsData}
          columns={columns}
          rowKey={record => record.id}
          pagination={pagination}
          className="table"
        />
      </div>
    );
  }
}
export default ArningsList;