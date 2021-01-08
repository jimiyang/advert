import React, { Component } from 'react'
import { Table, Input, Button, message, Tooltip, Icon, Dropdown, Menu} from 'antd'
import style from '../style.less'
import Link from 'umi/link'
import {
  merchantList
} from '@/api/api'
const {Search} = Input
class MerchantList extends Component {
  constructor(props) {
    super(props)
    this.state = {
      pagination: {
        size: 'small',
        showQuickJumper: true,
        showSizeChanger: true,
        total: 0,
        currentPage: 1,
        current: 1,
        limit: 10,
        onChange: this.changePage,
        onShowSizeChange: this.onShowSizeChange
      },
      search: {
        phone: null,
        merchantCode: null,
        userName: null,
        status: null,
        codeNamePhone: null
      },
      merchantData: [],
      loading: false,
      selectedRowKeys: []
    }
  }
  async componentDidMount() {
    await this.loadList()
  }
  loadList = () => {
    let { search, pagination } = this.state
    const params = {
      ...search,
      currentPage: pagination.currentPage,
      limit: pagination.limit,
      type: this.props.type //1广告主 2流量主
    }
    this.setState({ loading: true })
    merchantList(params).then(rs => {
      if (rs.success) {
        const p = Object.assign(pagination, { total: rs.total })
        this.setState({ pagination: p, merchantData: rs.data })
      }
      this.setState({ loading: false })
    })
  }
  changePage = (page) => {
    page = page === 0 ? 1 : page
    const pagination = Object.assign(this.state.pagination, { currentPage: page, current: page })
    this.setState({ pagination }, () => {
      this.loadList()
    })
  }
  //改变每页条数事件
  onShowSizeChange = (current, size) => {
    let p = this.state.pagination
    p = Object.assign(p, { currentPage: current, current, limit: size })
    this.setState({ pagination: p }, () => {
      this.loadList()
    })
  }
  changeFormEvent = (e, type) => {
    let { search } = this.state, obj = {}
    if (e === null) {
      obj = { [type]: null }
      search = Object.assign(search, obj)
      this.setState({ search })
      return
    }
    switch (typeof e) {
      case 'object':
        obj = { [type]: e.target.value }
        break
      case 'number':
        obj = { [type]: e ? e : null }
        break
      default:
        obj = { [type]: e.target.value }
        break
    }
    search = Object.assign(search, obj)
    this.setState({ search })
  }
  searchEvent = () => {
    const pagination = Object.assign(this.state.pagination, { currentPage: 1, current: 1 })
    this.setState({ pagination }, () => {
      this.loadList()
    })
  }
  clearEvent = () => {
    let search = this.state.search
    search = Object.assign(
      search,
      {
        phone: null,
        merchantCode: null,
        userName: null,
        status: null
      }
    )
    const pagination = Object.assign(this.state.pagination, { currentPage: 1, current: 1 })
    this.setState({ search, pagination }, () => {
      this.loadList()
    })
  }
  searchMerchantEvent = (value) => {
    let search = this.state.search
    search = Object.assign(search, {codeNamePhone: value})
    this.setState({search}, () => {
      this.loadList()
    })
  }
  onSelectChange = (selectedRowKeys) => {
    this.setState({selectedRowKeys})
  }
  downLoadEvent = (e) => {
    const hostName = window.location.hostname === 'localhost' ? `/base/` : '/'
    const token = window.localStorage.getItem('token')
    const {search} = this.state
    if (Number(e.key) === 1 && this.state.selectedRowKeys.length === 0) {
      message.warning('请选择要导出的商户')
      return false
    }
    if (Number(e.key)=== 1 && this.state.selectedRowKeys.length > 0) {
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
    let url = `${hostName}download/api/admin/merchantList`
    let formElement = document.createElement('form')
    formElement.style.display = "display:none;"
    formElement.method = 'post'
    formElement.action = url
    //formElement.target = 'callBackTarget'
    let inputElement1 = document.createElement('input'),
      inputElement2 = document.createElement('input'),
      inputElement4 = document.createElement('input'),
      inputElement5 = document.createElement('input'),
      inputElement6 = document.createElement('input'),
      inputElement7 = document.createElement('input'),
      inputElement8 = document.createElement('input'),
      inputElement9 = document.createElement('input')
    inputElement1.type = 'hidden'
    inputElement2.type = 'hidden'
    inputElement4.type = 'hidden'
    inputElement5.type = 'hidden'
    inputElement6.type = 'hidden'
    inputElement7.type = 'hidden'
    inputElement8.type = 'hidden'
    inputElement9.type = 'hidden'
    inputElement1.name = "token"
    inputElement1.value = token
    inputElement2.name = "codeNamePhone"
    inputElement2.value = search.codeNamePhone
    inputElement4.name = "merchantCode"
    inputElement4.value = search.merchantCode
    inputElement5.name = "phone"
    inputElement5.value = search.phone
    inputElement6.name = "status"
    inputElement6.value = search.status
    inputElement7.name = "userName"
    inputElement7.value = search.userName
    inputElement8.name = "merchantIdListStr"
    inputElement8.value = this.state.selectedRowKeys
    inputElement9.name = "type"
    inputElement9.value = this.props.type
    formElement.appendChild(inputElement1)
    formElement.appendChild(inputElement2)
    formElement.appendChild(inputElement4)
    formElement.appendChild(inputElement5)
    formElement.appendChild(inputElement6)
    formElement.appendChild(inputElement7)
    formElement.appendChild(inputElement8)
    formElement.appendChild(inputElement9)
    document.body.appendChild(formElement)
    formElement.submit()
    document.body.removeChild(formElement)
  }
  render() {
    const {
      pagination,
      merchantData,
      loading,
      selectedRowKeys
    } = this.state
    const rowSelection = {
      selectedRowKeys,
      onChange: this.onSelectChange
    }
    const url = this.props.type === 1 ? '/ggzMerchantTrade' : '/llzMerchantTrade'
    const x = this.props.type === 1 ? 1800 : null
    const merchantColunms = this.props.type === 1 ? [
      {
        title: (<div>
          <Tooltip placement="topRight" title="即账户中的资金额度总和，账户余额=可用余额+冻结金额+提现中金额">
            账户余额(元)<Icon type="question-circle" className="cur" />
          </Tooltip>
        </div>),
        width: '100px',
        align: 'right',
        key: 'totalBalance',
        dataIndex: 'totalBalance'
      },
      {
        title: (<div>
          <Tooltip placement="topRight" title="账户中可用于活动支出或提现的金额，等于账户余额减去冻结金额">
            可用余额(元)<Icon type="question-circle" className="cur" />
          </Tooltip>
        </div>),
        align: 'right',
        key: 'merchantCaVal',
        dataIndex: 'merchantCaVal'
      },
      {
        title: (<div>
          <Tooltip placement="topRight" title="即暂时不可使用的金额。冻结金额等于当前账户下所有未完成结算的活动或订单的冻结金额总和">
            冻结金额(元)<Icon type="question-circle" className="cur" />
          </Tooltip>
        </div>),
        align: 'right',
        key: 'settleCaVal',
        dataIndex: 'settleCaVal'
      },
      {
        title: (<div>
          <Tooltip placement="topRight" title="已经申请提现，处于待审核和待支付状态的金额总和">
            提现中金额(元)<Icon type="question-circle" className="cur" />
          </Tooltip>
        </div>),
        align: 'right',
        key: 'withdrawCaVal',
        dataIndex: 'withdrawCaVal'
      },
      {
        title: (<div>
          <Tooltip placement="topRight" title="截止到当前时间为止，广告主充值成功且已到账的金额总和">
            已充值金额(元)<Icon type="question-circle" className="cur" />
          </Tooltip>
        </div>),
        align: 'right',
        key: 'merchantFinishVal',
        dataIndex: 'merchantFinishVal'
      },
      {
        title: (<div>
          <Tooltip placement="topRight" title="截止到当前时间为止，已成功申请提现并完成付款的金额总和，广告主手续费为零">
            已提现金额(元)<Icon type="question-circle" className="cur" />
          </Tooltip>
        </div>),
        align: 'right',
        key: 'withdrawFinishVal',
        dataIndex: 'withdrawFinishVal'
      },
      {
        title: (<div>
          <Tooltip placement="topRight" title="截止到当前时间为止，针对每笔订单、对广告主结算的金额总和">
            已消耗金额(元)<Icon type="question-circle" className="cur" />
          </Tooltip>
        </div>),
        align: 'right',
        key: 'settleFinishVal',
        dataIndex: 'settleFinishVal'
      }
    ] : [
      {
        title: (<div>
          <Tooltip placement="topRight" title=" 即账户中的资金额度总和，账户余额=可提现金额+提现中金额">
            账户余额(元)<Icon type="question-circle" className="cur" />
          </Tooltip>
        </div>),
        width: '100px',
        align: 'right',
        key: 'totalBalance',
        dataIndex: 'totalBalance'
      },
      {
        title: (<div>
          <Tooltip placement="topRight" title="账户中可用于提现的金额总和，可提现金额=账户余额-提现中金额">
            可提现金额(元)<Icon type="question-circle" className="cur" />
          </Tooltip>
        </div>),
        key: 'merchantCaVal',
        dataIndex: 'merchantCaVal',
        align: 'right'
      },
      {
        title: (<div>
          <Tooltip placement="topRight" title="已经申请提现，处于待审核和待支付状态的金额总和">
            提现中金额(元)<Icon type="question-circle" className="cur" />
          </Tooltip>
        </div>),
        key: 'withdrawCaVal',
        dataIndex: 'withdrawCaVal',
        align: 'right'
      },
      {
        title: (<div>
          <Tooltip placement="topRight" title="截止到当前时间为止，已成功申请提现并完成付款的金额总和，包含3%的提现手续费">
            已提现金额(元)<Icon type="question-circle" className="cur" />
          </Tooltip>
        </div>),
        align: 'right',
        key: 'withdrawFinishVal',
        dataIndex: 'withdrawFinishVal'
      },
      {
        title: (<div>
          <Tooltip placement="topRight" title="截止到当前时间为止，流量主所有已结算订单的金额总和，已收益金额=账户余额+已提现金额">
            已收益金额(元)<Icon type="question-circle" className="cur" />
          </Tooltip>
        </div>),
        align: 'right',
        key: 'settleFinishVal',
        dataIndex: 'settleFinishVal'
      }
    ]
    const fixed = this.props.type === 1 ? 'left' : false
    const columns = [
      {
        title: (<span>{this.props.type === 1 ? '广告主编号' : '流量主编号'}</span>),
        key: 'merchantCode',
        dataIndex: 'merchantCode',
        fixed,
        width: '180px'
      },
      {
        title: '认证姓名',
        key: 'accountHolder',
        dataIndex: 'accountHolder',
        fixed,
        width: '100px',
        render: (record) => (
          <div>
            {
              record === '--' ?
              <Tooltip placement="topRight" title="账号未认证">
                <span>{record}</span>
              </Tooltip> : <span>{record}</span>
            }
          </div>
        )
      },
      merchantColunms,
      {
        title: '手机号',
        key: 'phone',
        dataIndex: 'phone'
      },
      {
        title: '注册时间',
        key: 'createDate',
        dataIndex: 'createDate'
      },
      {
        title: '操作',
        fixed: 'right',
        width: '100px',
        render: (record) => (
          <div className="g-tc">
            <Link to={{pathname: url, state: {merchantCode: record.merchantCode}}} className="purple-color">收支明细</Link>
          </div>
        )
      }
    ].flat()
    // 10 + 44 + 47 + 20
    const height = document.body.offsetHeight - 130 - 220
    //console.log(height)
    const menu = (
      <Menu onClick={(e) => this.downLoadEvent(e)}>
        <Menu.Item key={0}>导出全部</Menu.Item>
        <Menu.Item key={1}>导出选中</Menu.Item>
      </Menu>
    );
    return (
      <div>
        <ul className={style.search} style={{justifyContent: 'space-between'}}>
          <li>
            <Search
              placeholder={this.props.type ===1 ? "搜索广告主编号/姓名/手机号" : "搜索流量主编号/姓名/手机号"}
              style={{width: '260px', verticalAlign: 'middle'}}
              onSearch={value => this.searchMerchantEvent(value)}
              enterButton
            />
          </li>
          <li style={{marginRight: 0}}>
            <Dropdown overlay={menu}>
              <Button>
                导出列表 <Icon type="down" />
              </Button>
            </Dropdown>
          </li>
        </ul>
        <Table
          dataSource={merchantData}
          columns={columns}
          pagination={pagination}
          rowKey={record => record.id}
          loading={loading}
          rowSelection={rowSelection}
          //className="tabList"
          scroll={{ x, y: height}}
        />
      </div>
    )
  }
}
export default MerchantList