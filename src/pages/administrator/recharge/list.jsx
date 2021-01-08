import React, {Component} from 'react'
import {Table, DatePicker, Input, Select, Icon, Tooltip, Button, message} from 'antd'
import moment from 'moment'
import style from '../style.less'
import {
  topupList
} from '@/api/api'
const {RangePicker} = DatePicker
const Option = Select.Option
const { Search } = Input
class RechargeList extends Component {
  constructor(props) {
    super(props)
    this.state = {
      search: {
        dateStart: '',
        dateEnd: '',
        orderNoOrMerchantCode: '',
        orderStatus: ''
      },
      pagination: {
        showSizeChanger: true,
        showQuickJumper: true,
        size: 'small',
        limit: 10, //每页显示多少条
        currentPage: 1,
        current: 1,
        total: 0,
        onChange: current => this.changePage(current),
        onShowSizeChange: this.onShowSizeChange
      },
      topupData: [],
      status: ['待支付', '充值成功', '充值失败']
    }
  }
  async componentDidMount() {
    await this.loadList()
  }
  loadList = async () => {
    let {pagination, search} = this.state
    const params = {
      currentPage: pagination.currentPage,
      limit: pagination.limit,
      ...search
    }
    await topupList(params).then(rs => {
      if (rs.success) {
        const p = Object.assign(pagination, {total: rs.total})
        this.setState({topupData: rs.data, pagination: p})
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
    this.setState({search}, () => {
      this.loadList()
    })
  }
  searchEvent = (value) => {
    let search = this.state.search
    search = Object.assign(search, {orderNoOrMerchantCode: value})
    this.setState({search}, () => {
      this.loadList()
    })
  }
  //导出excel
  exportExcel = () => {
    const token = window.localStorage.getItem('token')
    const hostName = window.location.hostname === 'localhost' ? `/base/` : '/'
    const search = this.state.search
    const params = `&dateStart=${search.dateStart}&dateEnd=${search.dateEnd}&orderNoOrMerchantCode=${search.orderNoOrMerchantCode}&orderStatus=${search.orderStatus}`
    let url = `${hostName}download/api/admin/topUpList?token=${token}${params}`,
      canvas = document.createElement('canvas')
      canvas.toBlob((blob)=>{
        let link = document.createElement('a');
        link.href = url;
        //link.download = '测试'; 
        link.click();
        message.success('下载成功！')
      }, "xlsx");
  }
  render() {
    const {
      search,
      topupData,
      pagination,
      status
    } = this.state
    const columns =[
      {
        title: '充值单号',
        key: 'orderNo',
        dataIndex: 'orderNo'
      },
      {
        title: '商户编号',
        key: 'merchantCode',
        dataIndex: 'merchantCode'
      },
      {
        title: '充值方式',
        key: 'topupType',
        dataIndex: 'topupType',
        render: (record) => (
          <div>{record ? record === 1 ? '微信' : '支付宝' : '--'}</div>
        )
      },
      {
        title: '充值时间',
        key: 'createDate',
        dataIndex: 'createDate',
        render: (record) => (
          <div>{window.common.getDate(record, true)}</div>
        )
      },
      {
        title: '到账时间',
        key: 'successTime',
        dataIndex: 'successTime',
        render: (record) => (
          <div>{record === undefined ? '--' : window.common.getDate(record)}</div>
        )
      },
      {
        title: (
          <div>
            充值金额(元)
            <Tooltip placement="rightTop" title="广告主在本平台实际充值金额">
              <Icon type="question-circle" className={`${style['ico']} cur`}/>
            </Tooltip>            
          </div>),
        key: 'orderAmt',
        dataIndex: 'orderAmt',
        align: 'right',
        render: (record) => (
          <div>{record}</div>
        )
      },
      {
        title: (
          <div>
            到账金额(元)
            <Tooltip placement="rightTop" title="到账金额=充值金额 - 手续费，广告主实付手续费为零">
              <Icon type="question-circle" className={`${style['ico']} cur`}/>
            </Tooltip>            
          </div>),
        key: 'orderAmtShow',
        dataIndex: 'orderAmtShow',
        align: 'right',
        render: (record) => (
          <div>{record}</div>
        )
      },
      {
        title: (
          <div>
            手续费(元)
            <Tooltip placement="rightTop" title="平台代付通道手续费，广告主实付手续费为零。手续费=充值金额*0.25%">
              <Icon type="question-circle" className={`${style['ico']} cur`}/>
            </Tooltip>            
          </div>),
        key: 'orderFee',
        dataIndex: 'orderFee',
        align: 'right',
        render: (record) => (
          <div>{record === undefined ? '--' : record}</div>
        )
      },
      {
        title: '充值状态',
        key: 'orderStatus',
        dataIndex: 'orderStatus',
        render: (record) => (
          <div>{status[record]}</div>
        )
      }
    ]
    const height = document.body.offsetHeight - 130 - 240
    return(
      <div className={style['administrator']}>
        <header className="header-style">充值记录</header>
        <ul className={style['search2']}>
          <li>
            <label className="mr10">充值状态</label>
            <Select
              className="w180"
              value={search.orderStatus}
              placeholder="请选择充值状态"
              onChange={(e) => this.changeFormEvent(e, 'orderStatus')}
            >
              <Option value={null}>全部</Option>
              <Option value={0}>待支付</Option>
              <Option value={1}>充值成功</Option>
              <Option value={2}>充值失败</Option>
            </Select>
            <label className="ml10 mr10">充值时间</label>
            <RangePicker
              value={search.dateStart === '' ? '' : [moment(search.dateStart, 'YYYY-MM-DD'), moment(search.dateEnd, 'YYYY-MM-DD')]}
              className="w2600 ml10"
              onChange={(e, value) => this.changeFormEvent(e, 'date', value)}
            />
          </li>
          <li>
            <Search
              placeholder="搜索充值单号/商户编号"
              style={{width: '260px', verticalAlign: 'middle'}}
              onSearch={value => this.searchEvent(value)}
              enterButton
            />
          </li>
        </ul>
        <div className="mt20">
          <Button onClick={() => this.exportExcel()}>导出已筛选报表</Button>
        </div>
        <Table
          className="mt20"
          columns={columns}
          dataSource={topupData}
          rowKey={record => record.id}
          pagination={pagination}
          scroll={{y: height}}
        />
      </div>
    )
  }
}
export default RechargeList