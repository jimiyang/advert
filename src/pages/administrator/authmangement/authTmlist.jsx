import React, {Component} from 'react'
import {Select, Input, Button, Table, Tooltip} from 'antd'
import Link from 'umi/link'
import style from '../style.less'
import {
  getMerchanAuthList
} from '@/api/api'
const Option = Select.Option
class AuthList extends Component {
  constructor (props) {
    super(props)
    this.state = {
        search: {
            merchantCode: null,
            status: null,
            merchantPhone: null
        },
        authData: [],
        pagination: {
            size: 'small',
            pageSize: 10, //每页显示多少条
            currentPage: 1,
            current: 1,
            total: 0,
            showSizeChanger: true,
            onChange: this.changePage,
            onShowSizeChange: this.onShowSizeChange
        },
        loading: false
    }
  }
  async componentDidMount() {
    await this.loadList()
  }
  loadList = async () => {
    let {search, pagination} = this.state
    const params = {
        ...search,
        currentPage: pagination.currentPage,
        limit: pagination.pageSize
    }
    this.setState({loading: true})
    await getMerchanAuthList(params).then(rs => {
      this.setState({loading: false})
      if (rs.success) {
        const p = Object.assign(pagination, {total: rs.total})
        this.setState({authData: rs.data, pagination: p})
      }
    })
  }
  changePage = (page) => {
    page = page === 0 ? 1 : page
    const pagination = Object.assign(this.state.pagination, {currentPage: page, current: page})
    this.setState({pagination, ischecked: false, allchk: false}, () => {
        this.loadList()
    })
    
  }
  //改变每页条数事件
  onShowSizeChange = (current, size) => {
    let p = this.state.pagination
    p = Object.assign(p, {currentPage: current, current, pageSize: size})
    this.setState({pagination: p, ischecked: false, allchk: false}, () => {
        this.loadList()
    })
  }
  changeFormEvent = (e, type) => {
    let search = this.state.search, obj = {}
    switch(typeof e) {
        case 'object':
            obj = {[type]: e.target.value}
        break
        case 'number':
            obj = {[type]: e}
        break
    }
    search = Object.assign(search, obj)
    this.setState({search})
  }
  searchEvent = () => {
    this.loadList()
  }
  clearEvent = () => {
    let search = this.state.search
    search = Object.assign({
      merchantCode: null,
      status: null,
      merchantPhone: null
    })
    const pagination = Object.assign(this.state.pagination, {currentPage: 1, current: 1})
    this.setState({search, pagination}, () => {
      this.loadList()
    })
  }
  render() {
    const {
        search,
        pagination,
        authData,
        loading
    } = this.state
    const columns = [
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
            title: '手机号',
            key: 'merchantPhone',
            dataIndex: 'merchantPhone',
            render: (record) => (
                <div>{record === undefined ? '--' : record}</div>
            )
        },
        {
            title: '认证提交时间',
            key: 'createDate',
            dataIndex: 'createDate',
            render: (record) => (
                <div>{window.common.getDate(record, true)}</div>
            )
        },
        {
            title: '认证类型',
            key: 'certificateType',
            dataIndex: 'certificateType',
            render: (record) => (
                <div>{Number(record) === 1 ? '个人认证' : '企业认证'}</div>
            )
        },
        {
            title: '开户姓名',
            key: 'accountHolder',
            dataIndex: 'accountHolder'
        },
        {
            title: '状态',
            render: (record) => (
                <div>
                    <Tooltip placement="topLeft" title={record.auditInfo}>
                        <span>{window.common.authStatus[Number(record.status) - 1]}</span>
                    </Tooltip>
                </div>
            )
        },
        {
            title: '操作',
            render: (record) => (
                <div>
                    {
                        Number(record.status) === 1 ?
                            <Link to={{
                                pathname: '/viewinfo',
                                state: {
                                    id: record.id,
                                    type: 1
                                }
                            }} className="block">审核</Link> : null
                    }
                    <Link to={{
                        pathname: '/viewinfo',
                        state: {
                            id: record.id,
                            type: 2
                        }
                    }} className="block">查看</Link>
                </div>
            )
        }
    ]
    const height = document.body.offsetHeight - 130 - 220
    return (
        <div className={style.administrator}>
            <header className="header-style">认证列表</header>
            <ul className={style.search}>
                <li>
                    <label>商户编号</label>
                    <Input className="ml10" placeholder="请输入要查询的商户" value={search.merchantCode} onChange={e => this.changeFormEvent(e, 'merchantCode')} />
                </li>
                <li>
                    <label>商户手机号</label>
                    <Input className="ml10" placeholder="请输入活动编号" value={search.merchantPhone} onChange={e => this.changeFormEvent(e, 'merchantPhone')} />
                </li>
                <li>
                    <label>状态</label>
                    <Select
                        className="ml10 w180"
                        value={search.status}
                        onChange={e => this.changeFormEvent(e, 'status')}
                    >
                        <Option value={null}>请选择</Option>
                        <Option value={1}>待认证</Option>
                        <Option value={2}>认证成功</Option>
                        <Option value={3}>认证失败</Option>
                    </Select>
                </li>
                <li>
                    <Button type="primary" onClick={() => this.searchEvent()}>查询</Button>
                    <Button className="ml10" onClick={() => this.clearEvent()}>重置</Button>
                </li>
            </ul>
            <Table
                dataSource={authData}
                columns={columns}
                pagination={pagination}
                //rowSelection={rowSelection}
                rowKey={record => record.id}
                loading={loading}
                scroll={{y: height}}
                //className="tabList"
                size="middle"
            />
        </div>
    )
  }
}
export default AuthList