import React, {Component} from 'react'
import {Tooltip, Icon, Tabs, DatePicker, Input, Table, Popover} from 'antd'
import moment from 'moment'
import style from '../style.less'
const { TabPane } = Tabs
const { Search } = Input
const {RangePicker} = DatePicker
class CashReport extends Component{
  constructor(props) {
    super(props)
    this.state = {
      panes: ['提现中', '提现成功', '提现失败'],
      search: {
        type: null,
        dateStart: null,
        dateEnd: null
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
      selectedRowKeys: [],
      loading: false,
      cashData: [],
      detailForm: {}
    }
  }
  loadList = () => {
    
  }
  changePage = (page) => {
    let p = this.state.pagination
    page = page === 0 ? 1 : page
    p = Object.assign(p, {currentPage: page, current: page})
    this.setState({pagination: p}, () => {
      this.loadList()
    })
  }
  //改变每页条数事件
  onShowSizeChange = (current, size) => {
    let p = this.state.pagination
    p = Object.assign(p, {currentPage: current, current, limit: size})
    this.setState({pagination: p}, () => {
      this.loadList()
    })
  }
  changeTabEvent = (key) => {
    
  }
  diffTimeSearch = (number) => {
    const arr = window.common.getStartAndEndDate(number)
    let search = this.state.search
    search = Object.assign(search, {
      dateStart: arr[0],
      dateEnd: arr[1]
    })
    this.setState({search}, () => {
      //this.loadList()
    })
  }
  onSelectChange = (selectedRowKeys) => {
    this.setState({ selectedRowKeys })
  }
  render() {
    const {
      search,
      panes,
      pagination,
      selectedRowKeys,
      cashData,
      loading,
      detailForm,
      hovered
    } = this.state
    const title = (<div className={style['dtitle']}>提现详情</div>)
    const content = (
      <ul className={style['detailBox']}>
        <li><i>开户人</i>{window.common.reaplceStar(detailForm.bankCardOwnerName, 'accountHolder')}</li>
        <li><i>开户银行</i>{detailForm.bankName}</li>
        <li><i>开户网点</i>{detailForm.subbranchCityName}</li>
        <li><i>银行卡号</i>{window.common.reaplceStar(detailForm.bankCardNo, 'bankCardNumber')}</li>
        <li><i>银行预留手机号</i>{window.common.reaplceStar(detailForm.bankOwnerPhone, 'phone')}</li>
        <li><i>汇款单号</i>{detailForm.thirdOrderNo}</li>
        <li><i>汇款凭证</i><img src={detailForm.thirdRemitReceiptUrl} style={{width: '150px', height: '80px'}}/></li>
        <li><i>付款备注</i>{detailForm.thirdRemitRemarks}</li>
        <li><i>审核备注</i>{detailForm.auditRemark}</li>
      </ul>
    )
    const columns = [
      {
        title: '提现批次号',
        key: 'successTime',
        dataIndex: 'successTime'
      },
      {
        title: "客商编号",
        key: 'merchantCode',
        dataIndex: 'merchantCode'
      },
      {
        title: '提现账户姓名',
        key: 'accountHolder',
        dataIndex: 'accountHolder'
      },
      {
        title: '提现金额(元)',
        key: 'type',
        dataIndex: 'type',
        align: 'right',
        render: (record) => (
        <div>11</div>
        )
      },
      {
        title: '到账金额(元)',
        key: 'orderNo',
        align: 'right',
        dataIndex: 'orderNo'
      },
      {
        title: '手续费(元)',
        align: 'right',
        key: 'orderAmt',
        dataIndex: 'orderAmt'
      },
      {
        title: '付款时间',
        key: 'actualAmt',
        dataIndex: 'actualAmt'
      },
      {
        title: '提现状态',
        key: 'feeAmt',
        dataIndex: 'feeAmt'
      },
      {
        title: '操作',
        render: (record) => (
          <div>
            <Popover
              placement="bottomLeft"
              title={title}
              content={content}
              trigger="hover"
              visible={hovered === record.id ? true : false}
              onVisibleChange={() => this.handleHoverChange(record)}
            >
              <span className="g-tc blue-color cur">详情</span>
            </Popover>
          </div>
        )
      }
    ]
    const rowSelection = {
      selectedRowKeys,
      onChange: this.onSelectChange
    };
    return(
      <div className={style['administrator']}>
        <header className="header-style">
          提现报表
        </header>
        <Tabs activeKey={String(search.type)} onChange={(activeKey) => this.changeTabEvent(activeKey)}>
          <TabPane tab="全部提现" key={null}></TabPane>
          {
            panes.map((item, index) => (
              <TabPane tab={item} key={index + 1}></TabPane>
            ))
          }  
        </Tabs>
        <ul className={style['search2']}>
          <li>
            <label className="ml10 mr10">付款日期</label>
            <RangePicker
              value={search.dateStart === '' || search.dateStart === null ? null : [moment(search.dateStart, 'YYYY-MM-DD'), moment(search.dateEnd, 'YYYY-MM-DD')]}
              className="w2600 ml10"
              onChange={(e, value) => this.changeFormEvent(e, 'date', value)}
            />
            <span className="purple-color ml10 f12 cur" onClick={() => this.diffTimeSearch(6)}>最近7天</span>
            <span className="purple-color ml10 f12 cur" onClick={() => this.diffTimeSearch(29)}>最近30天</span>
            <span className="purple-color ml10 f12 cur" onClick={() => this.diffTimeSearch(59)}>最近60天</span>
          </li>
          <li>
            <Search
              placeholder={`搜索${this.props.merchantType === 1 ? '广告主' : '流量主'}编号`}
              style={{width: '260px', verticalAlign: 'middle'}}
              onSearch={value => this.searchEvent(value)}
              value={search.merchantCode}
              onChange={(e, value) => this.changeFormEvent(e, 'merchantCode', value)}
              enterButton
            />
          </li>
        </ul>
        <Table
          className="mt20"
          loading={loading}
          columns={columns}
          dataSource={cashData}
          rowKey={record => record.id}
          //rowKey={(record, index) => `complete${record.merchantCode}${index}`}
          pagination={pagination}
          rowSelection={rowSelection}
        />
      </div>
    )
  }
}
export default CashReport