import React, {Component} from 'react'
import {DatePicker, Select, Input, Button} from 'antd'
import {
  missionList
} from '@/api/api'//接口地址
import style from './style.less'
import moment from 'moment'
const {Option} = Select
class HavedTask extends Component{
  constructor(props) {
    super(props)
    this.state = {
      loginName: '',
      orderData: [],
      search: {
        dateStart: null,
        dateEnd: null,
        missionStatus: null, //订单状态
        campaignName: null, //活动名称
        missionId: null, //订单号
        appArticlePosition: null //广告位置
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
      }
    }
  }
  async componentDidMount() {
    const loginInfo = JSON.parse(window.localStorage.getItem('login_info'))
    //因为setState是异步的，他会在render后才生效,加入一个回调函数
    await this.setState({loginName: loginInfo.data.loginName})
    this.loadList()
  }
  loadList = () => {
    const {pagination, search} = this.state
    const params = {
      loginName: this.state.loginName,
      currentPage: pagination.currentPage,
      limit: pagination.limit,
      ...search
    }
    missionList(params).then(rs => {
      if (rs.success) {
        const p = Object.assign(pagination, {total: rs.total})
        this.setState({orderData: rs.data, pagination: p})
      }
    })
  }
  changePage = (page) => {
    page = page === 0 ? 1 : page
    const pagination = Object.assign(this.state.pagination, {currentPage: page, current: page})
    this.setState({pagination})
    this.loadList()
  }
  //改变每页条数事件
  onShowSizeChange = (current, size) => {
    let p = this.state.pagination
    p = Object.assign(p, {currentPage: current, current, limit: size, pageSize: size})
    this.setState({pagination: p})
    this.loadList()
  }
  changeFormEvent = (type, e, value2) => {
    let search = this.state.search
    let obj = {}
    switch(type) {
      case 'dateStart':
        obj = {[type]: value2}
        break
      case 'dateEnd':
        obj = {[type]: value2}
        break
      case 'missionStatus':
        obj = {[type]: e}
        break
      case 'appArticlePosition':
        obj = {[type]: e}
        break
      case 'campaignName':
        obj = {[type]: e.target.value}
        break
      case 'missionId':
        obj = {[type]: e.target.value}
        break
      default:
        break
    }
    search = Object.assign(search, obj)
    this.setState({search})
  }
  //搜索
  searchEvent = () => {
    const pagination = Object.assign(this.state.pagination, {currentPage: 1, current: 1})
    this.setState({pagination})
    this.loadList()
  }
  clearEvent = () => {
    let search = this.state.search
    search = Object.assign(
      search, {
        missionStatus: null,
        campaignName: null,
        missionId: null,
        appArticlePosition: null,
        dateStart: null,
        dateEnd: null
      }
    )
    const pagination = Object.assign(this.state.pagination, {currentPage: 1, current: 1})
    this.setState({pagination, search})
    this.loadList()
  }
  render() {
    const {
      search
    } = this.state
    return(
      <div className={style.task}>
        <h1 className="nav-title">已接订单</h1>
        <dl className={style.search}>
          <dt style={{width: '100%'}}>
            推广时间：
            <DatePicker className="ml10" value={search.dateStart === null || search.dateStart === '' ? null : moment(search.dateStart)} format="YYYY-MM-DD" onChange={this.changeFormEvent.bind(this, 'dateStart')} />
            <DatePicker className="ml10" value={search.dateEnd === null || search.dateEnd === '' ? null : moment(search.dateEnd)} format="YYYY-MM-DD" onChange={this.changeFormEvent.bind(this, 'dateEnd')} />   
          </dt>
          <dd>
            状态：
            <Select value={search.missionStatus} onChange={this.changeFormEvent.bind(this, 'missionStatus')} className="w180 ml10">
              <Option value={null}>全部</Option>
              {
                window.common.orderStatus.map((item, index) => (<Option key={index} value={index + 10}>{item}</Option>))
              }
            </Select>
          </dd>
          <dd>
            文章标题：<Input className="w180 ml10" value={search.campaignName} onChange={this.changeFormEvent.bind(this, 'campaignName')} />
          </dd>
          <dd>
            活动编号：<Input className="w180 ml10" value={search.missionId} onChange={this.changeFormEvent.bind(this, 'missionId')} />
          </dd>
          <dd>
            <Button type="primary" onClick={this.searchEvent.bind(this)}>查询</Button>
            <Button className="ml10" onClick={this.clearEvent.bind(this)}>重置</Button>
          </dd>
        </dl>
        <div className="table">
          <table>
            <thead>
              <tr>
                <th>推广文章</th>
                <th>推广时间</th>
                <th>单价(阅读/元)</th>
                <th>预估阅读量</th>
                <th>接单媒体数</th>
                <th>实际阅读</th>
                <th>实际支出(元)</th>
                <th>装填</th>
                <th>操作</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td><img /></td>
                <td>2019-05-05 - 2019-05-08</td>
                <td>1.5</td>
                <td>10000000</td>
                <td>20</td>
                <td>200000</td>
                <td>450000</td>
                <td>投放中</td>
                <td>
                  <div className="opeartion">
                    <a href="" className="option">查看</a>
                    <a href="" className="option">暂停</a>
                    <a href="" className="option">停止</a>
                  </div>
                </td>
              </tr>
              <tr className="title">
                <td colSpan="2">活动编号：00123478</td>
                <td colSpan="2">2019-05-05  12:23:55</td>
                <td colSpan="3">活动名称：夏季推广活动03</td>
                <td colSpan="2">备注：第一次夏季推广活动</td>
              </tr>
            </tbody>
          </table>        
        </div>
      </div>  
    )
  }
}
export default HavedTask