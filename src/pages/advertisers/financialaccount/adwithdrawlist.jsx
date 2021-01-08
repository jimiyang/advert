import React, { Component } from "react"
import { Input, Select, DatePicker, Button, Table, Popover} from 'antd'
import moment from 'moment'
import style from './style.less'
import { getAdWithdrawList, getAdWithdrawDetail} from '@/api/api'
import router from "umi/router"
//import ArningList from './arningslist'
const Option = Select.Option
const {RangePicker} = DatePicker
class AdWithDrawList extends Component {
  constructor(props) {
    super(props)
    this.state = {
      withDrawData: [],
      statusData: ['待审核', '驳回审核', '待支付', '成功'],
      isActive: 0,
      search: {
        dateStart: null,
        dateEnd: null,
        orderNo: null,
        orderStatus: null
      },
      pagination: {
        size: 'small',
        showSizeChanger: true,
        total: 0,
        currentPage: 1,
        current: 1,
        limit: 10,
        pageSize: 10,
        onChange: this.changePage,
        onShowSizeChange: this.onShowSizeChange
      },
      availableBalance: '.',
      settlecaBalance: '.',
      token:'',
      hovered: false,
      detailForm: {
        bankCardOwnerName: null,
        orderAmtShow: null,
        thirdOrderNo: null,
        bankName: null,
        subbranchName: null,
        bankCardNo: null,
        auditRemark: null
      }
    }
  }
 componentDidMount() {
    //遍历路由  获取参数
    this.setState({
      token:this.props.token
    }, async () => {
      //const loginInfo = JSON.parse(window.localStorage.getItem('login_info'))
      //await this.setState({ loginName: loginInfo.data.loginName })
      await this.loadList()
      //this.getCaQuery()
    })
  }

  loadList = () => {
    const {search, pagination ,token} = this.state
    const params = {
      token,
      ...search,
      currentPage: pagination.currentPage,
      limit: pagination.limit
    }
    getAdWithdrawList(params).then(rs => {
      if (rs.success) {
        const p = Object.assign(pagination, { total: rs.total })
        this.setState({ withDrawData: rs.data, pagination: p })
      }
    })
  }
  changePage = (page) => {
    page = page === 0 ? 1 : page
    const pagination = Object.assign(this.state.pagination, { currentPage: page, current: page })
    this.setState({ pagination })
    this.loadList()
  }
  //改变每页条数事件
  onShowSizeChange = (current, size) => {
    let p = this.state.pagination
    p = Object.assign(p, { currentPage: current, current, limit: size, pageSize: size })
    this.setState({ pagination: p })
    this.loadList()
  }
  changeFormEvent = (e, type, value) => {
    let search = this.state.search
    let obj = {}
    switch (type) {
      case 'date':
        obj = { dateStart: value[0], dateEnd: value[1] }
        break
      case 'orderNo':
        obj = { [type]: e.target.value }
        break
      default:
      obj = { [type]: e }
        break
    }
    search = Object.assign(search, obj)
    this.setState({ search }, () => {
      this.loadList()
    })
  }
  searchEvent = () => {
    let p = this.state.pagination
    p = Object.assign(p, { currentPage: 1, current: 1 })
    this.setState({ pagination: p })
    this.loadList()
  }
  clearEvent = () => {
    let search = this.state.search
    search = Object.assign(
      search,
      {
        dateStart: null,
        dateEnd: null,
        orderNo: null,
        orderStatus: null
      }
    )
    let p = this.state.pagination
    p = Object.assign(p, { currentPage: 1, current: 1 })
    this.setState({ pagination: p, search })
    this.loadList()
  }
  widthdrawEvent = () => {
    router.push('/getcash')
  }
  tapEvent = (index) => {
    //this.setState({isActive: index})
    const url = index === 0 ? '/putlist' : '/arningslist'
    router.push(url)
  }
  viewDataEvent = (item) => {
    getAdWithdrawDetail({orderNo: item.orderNo, token: this.state.token}).then(rs => {
      if (rs.success) {
        this.setState({detailForm: rs.data})
      }
    })
  }
  handleHoverChange = (item, visible) => {
    let hovered
    if (visible === true) {
      hovered = item.id
      this.viewDataEvent(item)
    }
    this.setState({
      hovered
    });
  };
  render() {
    const {
      withDrawData,
      search,
      pagination,
      hovered,
      detailForm,
    } = this.state
    const content = (
      <ul className={style['detailBox']}>
        <li className="g-tc bold">提现详情</li>
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
        title: '提现单号',
        key: 'orderNo',
        dataIndex: 'orderNo'
      },
      {
        title: '提现账户名',
        key: 'bankCardOwnerName',
        dataIndex: 'bankCardOwnerName'
      },
      {
        title: '申请金额(元)',
        key: 'orderAmtShow',
        dataIndex: 'orderAmtShow',
        align: 'right'
      },
      {
        title: '申请时间',
        key: 'applyTime',
        dataIndex: 'applyTime'
      },
      {
        title: '付款时间',
        key: 'financeWithdrawTime',
        dataIndex: 'financeWithdrawTime',
        render: (record) => (
          <div>{record === undefined ? '--' : record}</div>
        )
      },
      {
        title: '付款方式',
        render: (record) => (
          <div>线下打款</div>
        )
      },
      {
        title: '提现状态',
        key: 'orderStatus',
        dataIndex: 'orderStatus',
        render: (record) => (
          <div>{window.common.cashstatusData[Number(record) - 1]}</div>
        )
      },
      {
        title: '操作',
        render: (record) => (
          <div>
            <Popover
              placement="bottomLeft"
              content={content}
              trigger="hover"
              visible={hovered === record.id ? true : false}
              onVisibleChange={(vi) => this.handleHoverChange(record, vi)}
            >
              <span className="g-tc blue-color cur">详情</span>
            </Popover>
          </div>
        )
      }
    ]
    return (
      <div className={style.arnings}>
        <ul className={style.search}>
          <li>
            <label >申请时间：</label>
            <RangePicker 
              className={`w2600`}
              value={search.dateStart === null || search.dateStart === '' ? null : [moment(search.dateStart, 'YYYY-MM-DD'), moment(search.dateEnd, 'YYYY-MM-DD')]}
              onChange={(e, value) => this.changeFormEvent(e, 'date', value)}
            />
          </li>
          <li>
            <label className="ml10">提现状态：</label>
            <Select value={search.orderStatus} className="w180 ml10" onChange={e => this.changeFormEvent(e, 'orderStatus')}>
              <Option value={null}>请选择</Option>
              <Option value={1}>待审核</Option>
              <Option value={2}>驳回审核</Option>
              <Option value={3}>待支付</Option>
              <Option value={4}>成功</Option>
            </Select>
          </li>
        </ul>
        <Table
          dataSource={withDrawData}
          columns={columns}
          rowKey={record => record.id}
          pagination={pagination}
          className="table"
        />
      </div>
    )
  }
}
export default AdWithDrawList