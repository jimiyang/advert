import React, {Component} from 'react'
import {Input, Table, DatePicker, Tooltip, message, Tabs, Icon, Dropdown, Menu, Button} from 'antd'
import style from '../../style.less'
import moment from 'moment'
import {
  transactionMerchantList
} from '@/api/api'
const {RangePicker} = DatePicker
const { Search } = Input
const { TabPane } = Tabs
class TradeList extends Component{
  constructor(props) {
    super(props)
    this.state = {
      search: {
        dateStart: null,
        dateEnd: null,
        type: null,
        merchantCode: null
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
      loading: true,
      tradeData: [],
      selectedRowKeys: [],
      panes: ['充值', '提现', '活动支出']
    }
  }
  async componentDidMount() {
    let search = Object.assign(this.state.search, {merchantCode: this.props.merchantCode})
    await this.setState({search}, () => {
      this.loadList()
    })
  }
  loadList = () => {
    let {search, pagination} = this.state
    const params = {
      ...search,
      currentPage: pagination.currentPage,
      limit: pagination.limit,
      merchantType: this.props.merchantType //1广告主2流量主
    }
    transactionMerchantList(params).then(rs => {
      this.setState({loading: false})
      if (rs.success) {
        const p = Object.assign(pagination, {total: rs.data.totalNum})
        this.setState({tradeData: rs.data.items, pagination: p})
      }
    })
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
  changeFormEvent = (e, type, value) => {
    //console.log(e.target.value)
    let search = this.state.search, obj = {}
    switch(type) {
      case 'date':
        obj = {dateStart: value[0], dateEnd: value[1]}
      break
      default:
        obj = {[type]: e.target.value}
      break
    }
    search = Object.assign(search, obj)
    this.setState({search})
    if (type === 'date') {
      this.setState({loading: true})
      this.loadList()
    }
  }
  searchEvent = (value) => {
    let search = this.state.search
    search = Object.assign(search, {merchantCode: value})
    this.setState({search, loading: true}, () => {
      this.loadList()
    })
  }
  changeTabEvent = (key) => {
    let search = this.state.search
    search = Object.assign(search, {type: key === 'null' ? null : Number(key)})
    this.setState({search}, () => {
      this.loadList()
    })
  }
  onSelectChange = (selectedRowKeys) => {
    this.setState({ selectedRowKeys })
  }
  diffTimeSearch = (number) => {
    const arr = window.common.getStartAndEndDate(number)
    let search = this.state.search
    search = Object.assign(search, {
      dateStart: arr[0],
      dateEnd: arr[1]
    })
    this.setState({search}, () => {
      this.loadList()
    })
  }
  downLoadEvent = (e) => {
    const hostName = window.location.hostname === 'localhost' ? `/base/` : '/'
    const token = window.localStorage.getItem('token')
    const {search} = this.state
    if (Number(e.key) === 1 && this.state.selectedRowKeys.length === 0) {
      message.warning('请选择要导出的收支报表')
      return false
    }
    if (Number(e.key) === 1 && this.state.selectedRowKeys.length > 0) {
      this.setState({
        selectedRowKeys: this.state.selectedRowKeys
      })
    }
    else {
      this.state.selectedRowKeys.length = 0
      this.setState({
        selectedRowKeys: []
      })
    }
    let url = `${hostName}download/api/admin/transactionMerchantList`
    let formElement = document.createElement('form')
    formElement.style.display = "display:none;"
    formElement.method = 'post'
    formElement.action = url
    //formElement.target = 'callBackTarget'
    let inputElement1 = document.createElement('input'),
      inputElement2 = document.createElement('input'),
      inputElement3 = document.createElement('input'),
      inputElement4 = document.createElement('input'),
      inputElement5 = document.createElement('input'),
      inputElement6 = document.createElement('input'),
      inputElement7 = document.createElement('input')
    inputElement1.type = 'hidden'
    inputElement2.type = 'hidden'
    inputElement3.type = 'hidden'
    inputElement4.type = 'hidden'
    inputElement5.type = 'hidden'
    inputElement6.type = 'hidden'
    inputElement7.type = 'hidden'
    inputElement1.name = "token"
    inputElement1.value = token
    inputElement2.name = "type"
    inputElement2.value = search.type
    inputElement3.name = "dateStart"
    inputElement3.value = search.dateStart
    inputElement4.name = "dateEnd"
    inputElement4.value = search.dateEnd
    inputElement5.name = "merchantType"
    inputElement5.value = this.props.merchantType
    inputElement6.name = "orderNoListStr"
    inputElement6.value = this.state.selectedRowKeys
    inputElement7.name = "merchantCode"
    inputElement7.value = search.merchantCode
    formElement.appendChild(inputElement1)
    formElement.appendChild(inputElement2)
    formElement.appendChild(inputElement3)
    formElement.appendChild(inputElement4)
    formElement.appendChild(inputElement5)
    formElement.appendChild(inputElement6)
    formElement.appendChild(inputElement7)
    document.body.appendChild(formElement)
    formElement.submit()
    document.body.removeChild(formElement)
  }
  render() {
    const {
      search,
      tradeData,
      loading,
      pagination,
      selectedRowKeys,
      panes
    } = this.state
    const tipsData = this.props.merchantType === 1 ? 
    [
      "活动支出的交易编号为活动中已完成结算的订单号；充值交易编号为充值成功的充值单号；提现交易编号即为提现成功的提现单号",
      "充值交易金额等于不包含平台代付手续费的广告主实际充值金额；提现交易金额等于包含手续费的申请提现金额；活动支出的交易金额等于当前订单对广告主结算金额",
      "到账金额=交易金额-手续费",
      "充值手续费=交易金额*0.25%，为平台代付，广告主实付金额为零；提现手续费为零;活动支出手续费为零",
      "广告主编号"
    ] :
    [
      "接单收入的交易编号为已完成结算的订单号；提现的交易编号为流量主提现单号",
      "接单收入的交易金额等于当前订单对流量主的结算金额；提现交易金额等于提现申请金额，包含手续费",
      "到账金额=交易金额-手续费",
      "接单收入的手续费为零；提现手续费=交易金额*3%",
      "流量主编号"
    ]
    const columns = [
      {
        title: '到账时间',
        key: 'successTime',
        dataIndex: 'successTime'
      },
      {
        title: tipsData[4],
        key: 'merchantCode',
        dataIndex: 'merchantCode',
        width: 200
      },
      {
        title: '认证姓名',
        key: 'accountHolder',
        dataIndex: 'accountHolder'
      },
      {
        title: '交易类型',
        key: 'type',
        dataIndex: 'type',
        render: (record) => (
          <div>{record === 4 ? '接单收入' : panes[record - 1]}</div>
        )
      },
      {
        title: (<div>
          交易编号
          <Tooltip placement="topLeft" title={tipsData[0]}>
            <Icon type="question-circle" className="f12 cur m5" />
          </Tooltip>
        </div>),
        key: 'orderNo',
        dataIndex: 'orderNo'
      },
      {
        title: (<div>
          交易金额(元)
          <Tooltip placement="topLeft" title={tipsData[1]}>
            <Icon type="question-circle" className="f12 cur m5" />
          </Tooltip>
        </div>),
        align: 'right',
        key: 'orderAmt',
        dataIndex: 'orderAmt'
      },
      {
        title: (<div>
          到账金额(元)
          <Tooltip placement="topLeft" title={tipsData[2]}>
            <Icon type="question-circle" className="f12 cur m5" />
          </Tooltip>
        </div>),
        align: 'right',
        key: 'actualAmt',
        dataIndex: 'actualAmt'
      },
      {
        title: (<div>
          手续费(元)
          <Tooltip placement="topLeft" title={tipsData[3]}>
            <Icon type="question-circle" className="f12 cur m5" />
          </Tooltip>
        </div>),
        align: 'right',
        key: 'feeAmt',
        dataIndex: 'feeAmt'
      }
    ]
    const rowSelection = {
      selectedRowKeys,
      onChange: this.onSelectChange
    };
    const menu = (
      <Menu onClick={(e) => this.downLoadEvent(e)}>
        <Menu.Item key={0}>导出全部</Menu.Item>
        <Menu.Item key={1}>导出选中</Menu.Item>
      </Menu>
    );
    const height = document.body.offsetHeight - 130 - 300
    return(
      <div>
        {
          this.props.merchantType === 1 ? 
          <Tabs activeKey={String(search.type)} onChange={(activeKey) => this.changeTabEvent(activeKey)}>
            <TabPane tab="全部" key={null}></TabPane>  
            {
              panes.map((item, index) => (
                  <TabPane tab={item} key={index + 1}></TabPane>
              ))
            }
          </Tabs> :
          <Tabs activeKey={String(search.type)} onChange={(activeKey) => this.changeTabEvent(activeKey)}>
            <TabPane tab="全部" key={null}></TabPane>
            <TabPane tab="接单收入" key={4}></TabPane>  
            <TabPane tab="提现" key={2}></TabPane>  
          </Tabs>
        } 
        <ul className={style['search2']}>
          <li>
            <label className="ml10 mr10">到账日期</label>
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
        <div className="mt20 g-tr">
          <Dropdown overlay={menu} >
            <Button>
              导出列表 <Icon type="down" />
            </Button>
          </Dropdown>
        </div>
        <Table
          className="mt20"
          loading={loading}
          columns={columns}
          dataSource={tradeData}
          rowKey={record => record.orderNo}
          //rowKey={(record, index) => `complete${record.merchantCode}${index}`}
          pagination={pagination}
          rowSelection={rowSelection}
          scroll={{y: height}}
        />
      </div>
    )
  }
}
export default TradeList