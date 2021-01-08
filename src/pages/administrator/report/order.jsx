import React, {Component} from 'react'
import {Select, Input, Table, DatePicker, Avatar, message, Dropdown, Menu, Button, Icon} from 'antd'
import style from '../style.less'
import moment from 'moment'
import {
  settleOrderList
} from '@/api/api'
const {RangePicker} = DatePicker
const Option = Select.Option
const { Search } = Input
class OrderReportList extends Component{
  constructor(props) {
    super(props)
    this.state = {
      loginName: null,  
      search: {
        dateStart: null,
        dateEnd: null,
        missionCampaignApp: null,
        missionStatus: null
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
      activityData: [],
      selectedRowKeys: [],
      allchk: false,
      ischecked: [],
      isDisabled: false,
      isSubmit: false,
      placement: 'right',
      isVisible: false,
      missionTotal: 0,
      missionNotRelease: 0,
      readData: [],
      hovered: '',
      isChartsVisible: false,
      loading: true,
      selectedRowKeys: [],
      exportName: null
    }
  }
  async componentDidMount() {
    this.loadList()
  }
  loadList = async () => {
    let {pagination, search} = this.state
    const params = {
      currentPage: pagination.currentPage,
      limit: pagination.limit,
      ...search
    }
    await settleOrderList(params).then(rs => {
      this.setState({loading: false})
      if (rs.success) {
        const p = Object.assign(pagination, {total: rs.data.totalNum})
        this.setState({topupData: rs.data.items, pagination: p})
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
    let search = this.state.search, obj = {}
    switch(type) {
      case 'date':
        obj = {dateStart: value[0], dateEnd: value[1]}
      break
      default:
        obj = {[type]: e}
      break
    }
    search = Object.assign(search, obj)
    this.setState({search, loading: true}, () => {
      this.loadList()
    })
  }
  searchEvent = (value) => {
    let search = this.state.search
    search = Object.assign(search, {missionCampaignApp: value})
    this.setState({search, loading: true}, () => {
      this.loadList()
    })
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
  onSelectChange = (selectedRowKeys) => {
    //console.log(selectedRowKeys)
    this.setState({ selectedRowKeys })
  }
  downLoadEvent = (e) => {
    const hostName = window.location.hostname === 'localhost' ? `/base/` : '/'
    const token = window.localStorage.getItem('token')
    const {search} = this.state
    if (Number(e.key) === 1 && this.state.selectedRowKeys.length === 0) {
      message.warning('请选择要导出的订单')
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
    let url = `${hostName}download/api/admin/settleOrderList`
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
      inputElement6 = document.createElement('input')
    inputElement1.type = 'hidden'
    inputElement2.type = 'hidden'
    inputElement3.type = 'hidden'
    inputElement4.type = 'hidden'
    inputElement5.type = 'hidden'
    inputElement1.name = "token"
    inputElement1.value = token
    inputElement2.name = "missionCampaignApp"
    inputElement2.value = search.missionCampaignApp
    inputElement3.name = "dateStart"
    inputElement3.value = search.dateStart
    inputElement4.name = "dateEnd"
    inputElement4.value = search.dateEnd
    inputElement5.name = "missionStatus"
    inputElement5.value = search.missionStatus
    inputElement6.name = "missionIdListStr"
    inputElement6.value = this.state.selectedRowKeys
    formElement.appendChild(inputElement1)
    formElement.appendChild(inputElement2)
    formElement.appendChild(inputElement3)
    formElement.appendChild(inputElement4)
    formElement.appendChild(inputElement5)
    formElement.appendChild(inputElement6)
    document.body.appendChild(formElement)
    formElement.submit()
    document.body.removeChild(formElement)
  }
  render() {
    const {
      search,
      topupData,
      pagination,
      loading,
      selectedRowKeys
    } = this.state
    const columns =[
      {
        title: '订单号',
        key: 'missionId',
        dataIndex: 'missionId',
        fixed: 'left',
        width: 150
      },
      {
        title: '活动编号',
        key: 'campaignId',
        dataIndex: 'campaignId',
        width: 150,
        fixed: 'left'
      },
      {
        title: '订单状态',
        width: 150,
        fixed: 'left',
        render: (record) => (
          <div>
            {Number(record.missionStatus) === 19 ? '取消' : null}
            {Number(record.missionStatus) === 18 ? '结算失败' : window.common.missionStatus[Number(record.missionStatus) - 10]}
          </div>
        )
      },
      {
        title: '接单公众号',
        render: (record) => (
          <div>
            <Avatar src={record.headImg} size="small" icon="user" />
            <span className="ml10">{record.appNickName}</span>
          </div>
        )
      },
      {
        title: '接单时间',
        key: 'createDate',
        dataIndex: 'createDate',
        render: (record) => (
          <div>{window.common.getDate(record, true)}</div>
        )
      },
      {
        title: '广告主编号',
        key: 'adMerchantCode',
        dataIndex: 'adMerchantCode',
        render: (record) => (
          <div>{record}</div>
        )
      },
      {
        title: '流量主编号',
        key: 'flowMerchantCode',
        dataIndex: 'flowMerchantCode',
        render: (record) => (
          <div>{record}</div>
        )
      },
      {
        title: '计划投放日期',
        key: 'planPostArticleTime',
        dataIndex: 'planPostArticleTime',
        render: (record) => (
          <div>{record}</div>
        )
      },
      {
        title: '实际发文时间',
        key: 'realPostArticleTime',
        dataIndex: 'realPostArticleTime',
        render: (record) => (
          <div>{record === undefined ? '--' : record}</div>
        )
      },
      
      {
        title: '最小预估阅读',
        key: 'missionReadCntMin',
        dataIndex: 'missionReadCntMin',
        width: 150,
        render: (record) => (
          <div>{record}</div>
        )
      },
      {
        title: '最大预估阅读',
        key: 'missionReadCnt',
        dataIndex: 'missionReadCnt',
        width: 150,
        render: (record) => (
          <div>{record}</div>
        )
      },
      {
        title: '实际阅读',
        key: 'missionRealReadCnt',
        dataIndex: 'missionRealReadCnt',
        width: 150,
        render: (record) => (
          <div>{record}</div>
        )
      },
      {
        title: '广告主结算阅读',
        key: 'adSettleReadCnt',
        dataIndex: 'adSettleReadCnt',
        width: 150,
        render: (record) => (
          <div>{record}</div>
        )
      },
      {
        title: '流量主结算阅读',
        key: 'settleReadCnt',
        dataIndex: 'settleReadCnt',
        width: 150,
        render: (record) => (
          <div>{record}</div>
        )
      },
      {
        title: '阅读单价(元/阅读)',
        key: 'adUnitPrice',
        dataIndex: 'adUnitPrice',
        width: 150,
        align: 'right',
        render: (record) => (
          <div>{record}</div>
        )
      },
      {
        title: '广告主结算金额(元)',
        key: 'adRealCost',
        dataIndex: 'adRealCost',
        width: 150,
        align: 'right',
        render: (record) => (
          <div>{record}</div>
        )
      },
      {
        title: '流量主结算金额(元)',
        key: 'flowRealIncome',
        dataIndex: 'flowRealIncome',
        width: 150,
        align: 'right',
        render: (record) => (
          <div>{record}</div>
        )
      },
      {
        title: '平台收益(元)',
        key: 'benefit',
        dataIndex: 'benefit',
        width: 150,
        align: 'right',
        render: (record) => (
          <div>{record}</div>
        )
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
    const height = document.body.offsetHeight - 130 - 280
    return(
      <div className={style['administrator']}>
        <header className="header-style">订单报表</header>
        <ul className={style['search2']}>
          <li>
            <label className="mr10">订单状态</label>
            <Select
              className="w180"
              value={search.missionStatus}
              placeholder="请选择充值状态"
              onChange={(e) => this.changeFormEvent(e, 'missionStatus')}
            >
              <Option value={null}>全部</Option>
              {
                window.common.missionStatus.map((item, index) => (
                  <Option className={index === 0 || index === 6 ? 'hide' : ''} key={index} value={index + 10}>{item}</Option>
                ))
              }
            </Select>
            <label className="ml10 mr10">接单日期</label>
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
              placeholder="搜索订单号/活动编号/公众号"
              style={{width: '260px', verticalAlign: 'middle'}}
              onSearch={value => this.searchEvent(value)}
              enterButton
            />
          </li>
        </ul>
        <div className="mt20 g-tr">
          <Dropdown overlay={menu}>
            <Button>
              导出列表 <Icon type="down" />
            </Button>
          </Dropdown>
        </div>
        <Table
          className="mt20"
          loading={loading}
          columns={columns}
          dataSource={topupData}
          rowKey={record => record.missionId}
          pagination={pagination}
          rowSelection={rowSelection}
          scroll={{ x: 3000, y: height}}
        />
      </div>
    )
  }
}
export default OrderReportList