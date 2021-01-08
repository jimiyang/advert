import React, {Component} from 'react'
import {Input, Select, Button, DatePicker, Table, message} from 'antd'
import style from '../style.less'
import moment from 'moment'
import Link from 'umi/link'
import {
  tmList
} from '@/api/api'
const Option = Select.Option
const { RangePicker } = DatePicker
class TransferList extends Component{
  constructor(props) {
    super(props);
    this.state = {
      search: {
        dateStart: '',
        dateEnd: '',
        orderStatus: '',
        missionId: '',
        campaignId: '',
        adMmerchantCode: '',
        flowMerchantCode: ''
      },
      pagination: {
        pageSize: 10, //每页显示多少条
        currentPage: 1,
        current: 1,
        total: 0,
        showSizeChanger: true,
        onChange: this.changePage,
        onShowSizeChange: this.onShowSizeChange
      },
      settleData: [],
      loading: false
    }
  }
  componentDidMount() {
    this.loadList()
  }
  loadList = async () => {
    let {search, pagination} = this.state
    const params = {
      ...search,
      currentPage: pagination.currentPage,
      limit: pagination.pageSize
    }
    this.setState({loading: true})
    await tmList(params).then(rs => {
      this.setState({loading: false})
      if (rs.success) {
        const p = Object.assign(pagination, {total: rs.data.totalNum})
        this.setState({settleData: rs.data.items, pagination: p})
      }
    })
  }
  changePage = (page) => {
    page = page === 0 ? 1 : page
    const pagination = Object.assign(this.state.pagination, {currentPage: page, current: page})
    this.setState({pagination, ischecked: false, allchk: false})
    this.loadList()
  }
  //改变每页条数事件
  onShowSizeChange = (current, size) => {
    let p = this.state.pagination
    p = Object.assign(p, {currentPage: current, current, pageSize: size})
    this.setState({pagination: p, ischecked: false, allchk: false})
    this.loadList()
  }
  changeFormEvent = (e, type, value) => {
    let {search} = this.state, obj = {}
    switch(type) {
      case 'date':
        obj = {'dateStart': value[0], 'dateEnd': value[1]}
      break
      case 'orderStatus':
        obj = {[type]: e}
      break
      default:
        obj = {[type]: e.target.value}
      break
    }
    search = Object.assign(search, obj)
    this.setState({search})
  }
  searchEvent = () => {
    const pagination = Object.assign(this.state.pagination, {currentPage: 1, current: 1})
    this.setState({pagination})
    this.loadList()
  }
  clearEvent = () => {
    let {search, pagination} = this.state
    search = Object.assign(
      search,
      {
        dateStart: '',
        dateEnd: '',
        orderStatus: '',
        missionId: '',
        campaignId: '',
        adMmerchantCode: '',
        flowMerchantCode: ''
      }
    )
    pagination = Object.assign(pagination, {currentPage: 1, current: 1})
    this.setState({search, pagination})
    this.loadList()
  }
  //导出excel
  exportExcel = () => {
    const token = window.localStorage.getItem('token')
    const hostName = window.location.hostname === 'localhost' ? `/base/` : '/'
    const search = this.state.search
    const params = `&dateStart=${search.dateStart}&dateEnd=${search.dateEnd}&orderStatus=${search.orderStatus}&missionId=${search.missionId}&campaignId=${search.campaignId}&adMmerchantCode=${search.adMmerchantCode}&flowMerchantCode=${search.flowMerchantCode}`
    let url = `${hostName}download/api/admin/settleList?token=${token}${params}`,
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
      pagination,
      settleData,
      loading,
    } = this.state
    const columns = [
      {
        title: '订单号',
        key: 'missionId',
        dataIndex: 'missionId'
      },
      {
        title: '活动编号',
        key: 'campaignId',
        dataIndex: 'campaignId'
      },
      {
        title: '广告主商户编号',
        key: 'adMerchantCode',
        dataIndex: 'adMerchantCode'
      },
      {
        title: '流量主商户编号',
        key: 'flowMerchantCode',
        dataIndex: 'flowMerchantCode'
      },
      {
        title: '结算时间',
        key: 'settleDate',
        dataIndex: 'settleDate'
      },
      {
        title: '广告主支出(元)',
        key: 'adRealCost',
        dataIndex: 'adRealCost',
        align: 'right',
        render: (record) => (
          <div>
            {record === undefined ? '--' : record}
          </div>
        )
      },
      {
        title: '流量主收入(元)',
        key: 'flowRealIncome',
        dataIndex: 'flowRealIncome',
        align: 'right',
        render: (record) => (
          <div>
            {record === undefined ? '--' : record}
          </div>
        )
      },
      {
        title: '平台收益(元)',
        key: 'benefit',
        dataIndex: 'benefit',
        align: 'right',
        render: (record) => (
          <div>
            {record === undefined ? '--' : record}
          </div>
        )
      },
      {
        title: '状态',
        key: 'missionStatus',
        dataIndex: 'missionStatus',
        render: (record) => (
          <div>
            {Number(record) === 18 ? '结算失败' : window.common.missionStatus[Number(record) - 10]}
          </div>
        )
      }
    ]
    const height = document.body.offsetHeight - 130 - 260
    return (
      <div className={style.administrator}>
        <header className="header-style">结算列表</header>
        <ul className={style.search}>
          <li>
            <label>结算时间</label>
            <RangePicker
              value={search.dateStart === null || search.dateStart === '' ? null : [moment(search.dateStart, 'YYYY-MM-DD'), moment(search.dateEnd, 'YYYY-MM-DD')]}
              className="w2600 ml10"
              onChange={(e, value) => this.changeFormEvent(e, 'date', value)}
            />
          </li>
          <li>
            <label>状态</label>
            <Select
              className="ml10 w180"
              value={search.orderStatus}
              onChange={e => this.changeFormEvent(e, 'orderStatus')}
            >
              <Option value={null}>请选择</Option>
              {
                window.common.missionStatus.map((item, index) => (
                  <Option className={index === 0 || index === 6 ? 'hide' : ''} key={index} value={index + 10}>{item}</Option>
                ))
              }
            </Select>
          </li>
          <li>
            <label>订单号</label>
            <Input className="ml10" placeholder="请输入订单号" value={search.missionId} onChange={e => this.changeFormEvent(e, 'missionId')} />
          </li>
          <li>
            <label>活动编号</label>
            <Input className="ml10" placeholder="请输入活动编号" value={search.campaignId} onChange={e => this.changeFormEvent(e, 'campaignId')} />
          </li>
          <li>
            <label>广告主商户编号</label>
            <Input className="ml10" placeholder="请输入广告主编号" value={search.adMmerchantCode} onChange={e => this.changeFormEvent(e, 'adMmerchantCode')} />
          </li>
          <li>
            <label>流量主商户编号</label>
            <Input className="ml10" placeholder="请输入流量主商户编号" value={search.flowMerchantCode} onChange={e => this.changeFormEvent(e, 'flowMerchantCode')} />
          </li>
          <li>
            <Button type="primary" onClick={() => this.searchEvent()}>查询</Button>
            <Button className="ml10" onClick={() => this.clearEvent()}>重置</Button>
            <Button className="ml10" onClick={() => this.exportExcel()}>导出已筛选报表</Button>
          </li>
        </ul>
        <Table
          dataSource={settleData}
          columns={columns}
          rowKey={record => record.missionId}
          pagination={pagination}
          loading={loading}
          scroll={{y: height}}
          //className="tabList"
          size="middle"
        />
      </div>
    );
  }
}
export default TransferList;