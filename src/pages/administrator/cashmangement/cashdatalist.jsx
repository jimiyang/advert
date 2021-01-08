
import React, {Component} from 'react';
import {Button, DatePicker, Select, Table, Input, message, Icon} from 'antd';
import Link from 'umi/link';
import moment from 'moment';
import style from '../style.less';
import {
  queryWithdrawManager,
  querySettlementAmount
} from '@/api/api';
import Pay from './pay'
const Option = Select.Option;
const { RangePicker } = DatePicker;
const { Search } = Input
class CashList extends Component{
  constructor(props) {
    super(props);
    this.state = {
      loginName: null,
      flowOfMainData: [],
      isVisible: false,
      isPayVisible: false,
      search: {
        orderStatus: '',
        dateStart: '',
        dateEnd: '',
        merchantCode: '',
        payType: ''
      },
      pagination: {
        size: 'small',
        showSizeChanger: true,
        total: 0,
        currentPage: 1,
        limit: 10,
        current: 1,
        onChange: this.changePage,
        onShowSizeChange: this.onShowSizeChange
      },
      loading: false,
      SettlementAmount: 0,
      cashstatusData: [
        {id: 1, status: '待审核'},
        {id: 2, status: '驳回'},
        {id: 3, status: '待支付'},
        {id: 6, status: '处理中'},
        {id: 4, status: '成功(自动分账)', payType: 1},
        {id: 4, status: '成功(手动分账)', payType: 2},
        {id: 5, status: '付款失败'}
      ],
      selectedRowKeys: [],
      isDisabled: true,
      statusName: null
    };
  }
  async componentDidMount() {
    const loginInfo = JSON.parse(window.localStorage.getItem('login_info'));
    await this.setState({loginName: loginInfo.data.loginName});
    await this.queryAmount()
    await this.loadList();
  }
  queryAmount = () => {
    querySettlementAmount().then(rs => {
      if(rs.success) {
        this.setState({SettlementAmount: rs.data.settlementAmount})
      }
    })
  }
  loadList = () => {
    const {search, pagination} = this.state;
    const params = {
      currentPage: pagination.currentPage,
      limit: pagination.limit,
      ...search
    };
    this.setState({loading: true});
    queryWithdrawManager(params).then(rs => {
      this.setState({loading: false});
      if (rs.success) {
        const p = Object.assign(pagination, {total: rs.total});
        this.setState({flowOfMainData: rs.data, pagination: p});
      }
    });
  }
  changePage = (page) => {
    page = page === 0 ? 1 : page;
    const pagination = Object.assign(this.state.pagination, {currentPage: page, current: page});
    this.setState({pagination}, () => {
      this.loadList();
    });
  }
  //改变每页条数事件
  onShowSizeChange = (current, size) => {
    let p = this.state.pagination;
    p = Object.assign(p, {currentPage: current, current, limit: size});
    this.setState({pagination: p}, () => {
      this.loadList();
    });
  }
  changeFormEvent = (e, type, value) => {
    let {search} = this.state, obj = {}, prop = value.props, obj2 = {}
    switch(type) {
      case 'orderStatus':
        //console.log(value.key)
        obj = {[type]: value.key !== null ? Number(value.key) : value.key , payType: prop.label !== undefined ? prop.label : null};
        obj2 = {statusName: e}
        break;
      case 'date':
        obj = {dateStart: value[0], dateEnd: value[1]};
        break; 
      default:
        obj = {[type]: e.target.value};
      break;
    }
    search = Object.assign(search, obj);
    this.setState({search, ...obj2}, () => {
      this.loadList()
    });
  }
  searchEvent = (value) => {
    let {search} = this.state
    search = Object.assign(search, {merchantCode: value});
    this.setState({search}, () => {
      this.loadList()
    });
  } 
  //导出excel
  exportExcel = () => {
    const token = window.localStorage.getItem('token')
    const hostName = window.location.hostname === 'localhost' ? `/base/` : '/'
    const search = this.state.search
    const params = `&dateStart=${search.dateStart}&dateEnd=${search.dateEnd}&orderStatus=${search.orderStatus}&merchantCode=${search.merchantCode}`
    let url = `${hostName}download/api/admin/withdrawList?token=${token}${params}`,
      canvas = document.createElement('canvas')
      canvas.toBlob((blob)=>{
        let link = document.createElement('a');
        link.href = url;
        //link.download = '测试'; 
        link.click();
        message.success('下载成功！')
      }, "xlsx");
  }
  onSelectChange = selectedRowKeys => {
    //console.log('selectedRowKeys changed: ', selectedRowKeys);
    this.setState({ selectedRowKeys, isDisabled: selectedRowKeys.length === 0 ? true : false});
  };
  //自动分账
  autoPayEvent = (item) => {
    this.setState({isVisible: true, orderNo: item.orderNo})
  }
  allPayEvent = () => {
    this.setState({isVisible: true})
  }
  handleCancel = () => {
    this.setState({isVisible: false})
    //this.loadList()
  }
  reload = () => {
    this.setState({isVisible: false}, () => {
      this.loadList()
    })
  }
  render() {
    const {
      flowOfMainData,
      pagination,
      search,
      loading,
      SettlementAmount,
      cashstatusData,
      selectedRowKeys,
      isDisabled,
      statusName, //状态名称
      isVisible, //控制是否自动付款的弹层
      orderNo
    } = this.state;
    const columns = [
      {
        title: '提现单号',
        key: 'orderNo',
        dataIndex: 'orderNo'
      },
      {
        title: '商户编号',
        key: 'merchantCode',
        dataIndex: 'merchantCode'
      },
      {
        title: '客商编号',
        key: 'accountNo',
        dataIndex: 'accountNo',
        render: (record) => (
          <span>{record === undefined ? '--' : record}</span>
        )
      },
      {
        title: '申请提现时间',
        key: 'applyTime',
        dataIndex: 'applyTime'
      },
      {
        title: '申请提现金额(元)',
        key: 'orderAmtShow',
        dataIndex: 'orderAmtShow',
        align: 'right'
      },
      {
        title: '收款人账户名',
        key: 'bankCardOwnerName',
        dataIndex: 'bankCardOwnerName'
      },
      {
        title: '付款时间',
        key: 'financeWithdrawTime',
        dataIndex: 'financeWithdrawTime',
        render: (record) => (
          <div>{
            record === undefined ? '--' : 
            window.common.getDate(record, true)}</div>
        )
      },
      {
        title: '状态',
        render: (record) => (
          <div>
            {window.common.cashstatusData[Number(record.orderStatus) - 1 ]}
            {
              record.orderStatus === 4 ? 
                record.payType === 1 ? '(自动分账)' : '(手动分账)' : null
            }
          </div>
        )
      },
      {
        title: '操作',
        render: (record) => (
          <div>
            <div className="opeartion-items">
              {record.orderStatus === 1 ? <Link to={{pathname: '/cashdetail', state: {type: 'audit', orderNo: record.orderNo}}} className="block">审核</Link> : null}
              {record.orderStatus === 3 ? 
                <div>
                  <Link to={{pathname: '/cashdetail', state: {type: 'pay', orderNo: record.orderNo}}} className="block">付款(手动)</Link>
                  <span className="block purple-color cur" onClick={() => this.autoPayEvent(record)}>付款(自动)</span>
                </div>
                : null
              }
              <Link to={{pathname: '/cashdetail', state: {type: 'detail', orderNo: record.orderNo}}}>查看</Link>
            </div>
          </div>
        )
      }
    ];
    const height = document.body.offsetHeight - 130 - 220
    const rowSelection = {
      selectedRowKeys,
      onChange: this.onSelectChange,
      getCheckboxProps: record => ({
        disabled: record.orderStatus !== 3
      }),
    };
    return (
      <div className={style.administrator}>
        <header className="header-style">提现列表</header>
        <div className={style.cash}>
          <h1 className={style['amt']}>
            客商账户余额：<span className="red-color">{SettlementAmount}</span>
          </h1>
          <ul className={style.search}>
            <li>
              <label>提现日期</label>
              <RangePicker
                value={search.dateStart === null || search.dateStart === '' ? null : [moment(search.dateStart, 'YYYY-MM-DD'), moment(search.dateEnd, 'YYYY-MM-DD')]}
                className="w2600 ml10"
                onChange={(e, value) => this.changeFormEvent(e, 'date', value)}
              />
            </li>
            <li>
              <label>状态</label>
              <Select
                className="w180 ml10"
                value={statusName}
                onChange={(e, value) => this.changeFormEvent(e, 'orderStatus', value)}
              >
                <Option value={null}>请选择</Option>
                {
                  cashstatusData.map((item, index) => (
                    <Option key={item.id} label={item.payType} value={item.status}>
                      {item.status}
                    </Option>
                  ))
                }
              </Select>
            </li>
            <li>
              <label>商户编号</label>
              <Search
                placeholder="请输入商户编号"
                style={{width: '260px', verticalAlign: 'middle'}}
                onSearch={value => this.searchEvent(value)}
                enterButton
              />
            </li>
            <li>
              {/*<Button type="primary" disabled={isDisabled ? true : false} onClick={() => this.allPayEvent()}>
                批量付款
              </Button>*/}
              <Button className="ml10" onClick={() => this.exportExcel()}>导出已筛选报表</Button>
            </li>
          </ul>
          <Table
            dataSource={flowOfMainData}
            columns={columns}
            pagination={pagination}
            rowKey={record => record.id}
            loading={loading}
            scroll={{y: height}}
            rowSelection={rowSelection}
            id="table2"
          />
          <Pay isVisible={isVisible} orderNo={orderNo} reload={this.reload} handleCancel={this.handleCancel} key={Date.now()}/>
        </div>
      </div>
    );
  }
}
export default CashList;