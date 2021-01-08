import React, { Component } from 'react'
import { DatePicker, Input, Button, List, message, Popconfirm, Icon, Tooltip, Popover } from 'antd'
import router from 'umi/router'
import moment from 'moment'
import QRCode from 'qrcode.react'; //二维码
import {
  articleList,
  deleteArticleById,
  judgeArticleUseById
} from '@/api/api'//接口地址
import style from './style.less'
const { RangePicker } = DatePicker
class MaterialList extends Component {
  constructor(props) {
    super(props);
    this.state = {
      loginName: null,
      employeeId: null,
      articletypeData: ['电商', '广告', '小说', '知识付费', '其他'],
      materiaData: [],
      search: {
        dateStart: null,
        dateEnd: null,
        title: null
      },
      pagination: {
        size: 'small',
        showQuickJumper: true,
        showSizeChanger: true,
        total: 0,
        currentPage: 1,
        current: 1,
        limit: 10,
        pageSize: 10,
        onChange: this.changePage,
        onShowSizeChange: this.onShowSizeChange,
      },
      id: null,
      number: 0,
      serachType: true,
      loading: true
    };
  }
  async componentDidMount() {
    const loginInfo = JSON.parse(window.localStorage.getItem('login_info'));
    await this.setState({
      loginName: loginInfo.data.loginName,
      employeeId: loginInfo.data.employeeId
    });
    this.loadList();
  }
  loadList = async () => {
    let { loginName, search, pagination } = this.state;
    const params = {
      loginName,
      currentPage: pagination.currentPage,
      limit: pagination.limit,
      ...search
    };
    await articleList(params).then(rs => {
      this.setState({loading: false})
      if (rs.success) {
        const p = Object.assign(pagination, { total: rs.data.totalNum })
        this.setState({ materiaData: rs.data.items, pagination: p, number: rs.data.totalNum })
      }
    })
  }
  changePage = (page) => {
    page = page === 0 ? 1 : page
    const pagination = Object.assign(this.state.pagination, { currentPage: page, current: page })
    this.setState({ pagination })
    this.loadList();
  }
  //改变每页条数事件
  onShowSizeChange = (current, size) => {
    let p = this.state.pagination
    p = Object.assign(p, { currentPage: current, current, pageSize: size, limit: size })
    this.setState({ pagination: p })
    this.loadList();
  }
  changeFormEvent = (type, e, value) => {
    let search = this.state.search, obj = {}
    switch (type) {
      case 'date':
        obj = { dateStart: value[0], dateEnd: value[1] }
        break;
      case 'title':
        obj = { [type]: e.target.value }
        break;
      default:
        obj = { [type]: e.target.value }
        break;
    }
    search = Object.assign(search, obj)
    this.setState({ search });
  }
  searchEvent = () => {
    const pagination = Object.assign(this.state.pagination, { currentPage: 1, current: 1 })
    this.setState({ pagination, serachType: false })
    this.loadList()
  }
  clearEvent = () => {
    let search = this.state.search
    search = Object.assign(search, { title: null, dateStart: null, dateEnd: null });
    const pagination = Object.assign(this.state.pagination, { currentPage: 1, current: 1 })
    this.setState({ pagination, search })
    this.loadList();
  }
  //编辑和删除素材
  opeartionEvent = (type, id) => {
    if (type === 'edit') {
      judgeArticleUseById({ id }).then(rs => {
        if (rs.data) {
          message.error(rs.data)
        } else {
          router.push({ pathname: '/editor', state: { id, type: 'materiallist' } })
        }
      });
    } else {
      deleteArticleById({ id }).then(rs => {
        if (rs.success) {
          message.success(rs.message)
          this.loadList();
        }
      });
    }
  }
  //新建素材
  addEvent = () => {
    router.push({
      pathname: '/editor',
      state: {
        type: 'materiallist'
      }
    });
  }
  moveEvent = (item) => {
    this.setState({ id: item.id })
  }
  handleClickChange = (item) => {
    this.setState({
      selId: item.id
    })
  }
  render() {
    const {
      search,
      materiaData,
      pagination,
      id,
      selId,
      number,
      serachType,
      loading
    } = this.state;
    const grid = {
      gutter: 16,
      xs: 1, //<576px 展示的列数
      sm: 2, //≥576px 展示的列数
      md: 3, //≥768px 展示的列数
      lg: 4, //≥992px 展示的列数
      xl: 4, //≥1200px 展示的列数
      xxl: 5 //≥1600px 展示的列数
    };
    const content = (
      <div>
        <h2>微信扫码直接手机预览</h2>
        {
          //form.postContent ?     
          <QRCode
            style={{ marginTop: 10 }}
            value={`${window.common.articleUrl}/fshstatic/view.html?id=${selId}`} //value参数为生成二维码的链接
            size={135} //二维码的宽高尺寸
            fgColor="#000000" //二维码的颜色
          /> //: null
        }
      </div>
    )
    return (
      <div className={style.mypromotion}>
        <header className="header-style">
          我的文案
        </header>
        <ul className={`${style.search}`}>
          <li>
            <label>创建时间</label>
            <RangePicker
              value={search.dateStart === null || search.dateStart === '' ? null : [moment(search.dateStart, 'YYYY-MM-DD'), moment(search.dateEnd, 'YYYY-MM-DD')]}
              className="w2600"
              onChange={this.changeFormEvent.bind(this, 'date')}
            />
          </li>
          <li>
            <label>标题</label>
            <Input value={search.title} className={`${style['ipt']} ${style['mleft10']}`} onChange={this.changeFormEvent.bind(this, 'title')} />
          </li>
          <li>
            <Button type="primary" className="mr20" onClick={this.searchEvent.bind(this)}>查询</Button>
            {/* <Button className="mr20" onClick={this.clearEvent.bind(this)}>重置</Button> */}
          </li>
          <p className={style.numberShow}>{serachType ? <label>共有<b>{number}</b>篇文案</label> : <label>已搜索到<b>{number}</b>篇文案</label>}</p>
          <Button type="primary" className="ml30" onClick={this.addEvent.bind(this)}><Icon type="plus" />创作文案</Button>
        </ul>
        {
          materiaData.length > 0 ?
            <div className="content">
              <List
                grid={grid}
                dataSource={materiaData}
                className="list-tab"
                pagination={pagination}
                loading={loading}
                renderItem={(item, index) => (
                  <List.Item className={style.hoverList} >
                    <div className="wx-item" key={index}>
                      <div className={`item ${style['off']} ${style.itemHover}`} style={{ padding: 0 }} >
                        <div className="time">
                          创建时间：{window.common.getDate(item.createDate, true)}
                        </div>
                        <div className="pic" style={{ padding: '0 10px' }} onMouseEnter={this.moveEvent.bind(this, item)} onMouseLeave={() => this.setState({ id: null })}>
                          <img src={item.thumbMediaUrl} className="new-pic" />
                          <a className="title" target="_blank" href={`${window.common.articleUrl}/fshstatic/view.html?id=${item.id}`} style={{ margin: '0 10px', padding: 5 }}>{item.title}</a>
                          <div className={`privew ${item.id === id ? '' : 'hide'}`}>
                            <div className="mask" style={{ background: 'rgba(47, 47, 47, 0.8)' }}>
                              <div className="contents">
                                {/* <Tooltip title="浏览文案"> */}
                                {/* <a target="_blank" href={`${window.common.articleUrl}/fshstatic/view.html?id=${item.id}`} > */}
                                {/* <Icon type="eye" className={style['ico-eye']} style={{ fontSize: '14px' }} /> */}
                                {/* </a> */}
                                {/* </Tooltip> */}
                                <Button type="primary" onClick={() => window.open(`${window.common.articleUrl}/fshstatic/view.html?id=${item.id}`)}>浏览文案</Button>
                              </div>
                            </div>
                          </div>
                        </div>
                        <div className="opeartion">
                          <Tooltip placement="top" title={'编辑'}>
                            <Icon className="ico" type="edit" onClick={this.opeartionEvent.bind(this, 'edit', item.id)} style={{ fontSize: 17, width: '33%' }} />
                          </Tooltip>
                          <Popover placement="bottom" content={content} onVisibleChange={this.handleClickChange.bind(this, item)} trigger="hover">
                            <Icon className="ico" type="mobile" style={{ fontSize: 17, width: '33%' }} />
                          </Popover>
                          <Popconfirm
                            title="确定要删除素材吗？"
                            onConfirm={this.opeartionEvent.bind(this, 'del', item.id)}
                            okText="确定"
                            cancelText="取消"
                          >
                            <Tooltip placement="top" title={'删除'}>
                              <Icon className="ico" type="delete" style={{ fontSize: 17, width: '33%' }} />
                            </Tooltip>
                          </Popconfirm>
                        </div>
                      </div>
                    </div>
                  </List.Item>
                )}
              />
            </div> :
            <div className={style.noContent}>
              <img src={require('@/assets/images/nodata-ico.png')} />
              <p>您还没有自己的文案~</p>
              <p>
                请点击【创作文案】按钮新建个人文案
              </p>
            </div>
        }
      </div>
    );
  }
}
export default MaterialList;