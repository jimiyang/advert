import React, { Component } from 'react';
import router from 'umi/router';
import style from './style.less';
import { Icon, Button, Pagination, List, Input} from 'antd';
import {
  articleList
} from '@/api/api';//接口地址
const { Search } = Input;
class SelectMateria extends Component {
  constructor(props) {
    super(props);
    this.state = {
      isActive: null,
      type: null,
      id: null, //活动id
      pagination: {
        size: 'small',
        total: 0,
        currentPage: 1,
        limit: 6,
        pageSize: 6,
        title: null
      },
      materiaData: [],
      flag: false
    };
  }
  componentDidMount() {
   this.loadList();
  }
  componentWillReceiveProps(nProps) {
    //console.log(nProps.num, nProps.state)
    if (nProps.num === 2 && nProps.state === 'save') {
      this.setState({
        id: null
      })
    }
  }
  loadList = async () => {
    let {  pagination } = this.state;
    const params = {
      currentPage: pagination.currentPage,
      limit: pagination.limit,
      title: pagination.title
    };
    const rs = await articleList(params)
    if (rs.success && rs.data) {
      const p = Object.assign(pagination, { total: rs.data.totalNum });
      this.setState({ materiaData: rs.data.items, pagination: p});
    }
  }
  changePage = (page) => {
    page = page === 0 ? 1 : page;
    const pagination = Object.assign(this.state.pagination, { currentPage: page });
    this.setState({ pagination });
    this.loadList();
  }
  searchEvent = (e) => {
    const pagination = Object.assign(this.state.pagination, {title: e.target.value})
    this.setState({pagination})
    this.loadList()
  }
  //选择素材
  selMarteriaEvent = (index) => {
    this.setState({ isActive: index});
  }
  MouseLeave = () => {
    this.setState({
      isActive: null
    })
  }
  selectEvent = () => {
    router.push({
      pathname: '/editor',
      state: {
        activityId: this.state.id,
        type: 'materiallist'
      }
    });
  }
  //浏览
  viewEvent = (item) => {
    this.setState({
      id: item.id
    })
    this.props.getMateriaInfoEvent(item)
  }
  render() {
    const {
      materiaData,
      pagination,
      id,
      isActive
    } = this.state;
    const grid = {
      gutter: 16,
      xs: 1, //<576px 展示的列数
      sm: 2, //≥576px 展示的列数
      md: 3, //≥768px 展示的列数
      lg: 3, //≥992px 展示的列数
      xl: 3, //≥1200px 展示的列数
      xxl: 3 //≥1600px 展示的列数
    };
    return (
      <div className={style.mypromotion}>
        <div className={style.selectmateriaitems} id="selectmateriaitems">
          <div className={style['searchM']}>
            <div className="w180 inlineb">
              <Search
                placeholder="搜索文章标题"
                onChange={this.searchEvent}
              />
            </div>
            <span className="purple-color f14 ml10">
              {
                (pagination.title !== null && pagination.title !== '') ? `搜索到${materiaData.length}篇文案` : `共有${this.props.count}篇文章`
              }
            </span>
            {
              materiaData.length > 0 ?
              <div className={style['btn']}>
                <Button type="primary" onClick={this.selectEvent.bind(this)}>+创建文案</Button>
              </div> : null
            }
          </div>
          {
            this.props.count > 0 ?
              materiaData.length > 0 ?
                <div>
                  <List
                    grid={grid}
                    dataSource={materiaData}
                    className="list-tab"
                    renderItem={(item, index) => (
                      <List.Item>
                        <div
                          className="wx-item"
                          key={index}
                          onMouseEnter={this.selMarteriaEvent.bind(this, index)}
                          onMouseLeave={this.MouseLeave.bind(this)}
                        >
                          <div className={`item ${style['off']}`}>
                            <div className="time">
                              创建时间：{window.common.getDate(item.createDate, true)}
                            </div>
                            <img onClick={this.selMarteriaEvent.bind(this, item)} src={item.thumbMediaUrl} className="new-pic" />
                            <a className="title" target="_blank" href={`${window.common.articleUrl}/fshstatic/view.html?id=${item.id}`}>
                              <p className="elis">{item.title}</p>
                            </a>
                          </div>
                          {
                            id === item.id ?
                              <div className={`mask`}>
                                <Icon
                                  type="check-circle"
                                  className={`icon active`}
                                  onClick={this.viewEvent.bind(this, item)}
                                />
                              </div>
                              :
                              <div onClick={this.viewEvent.bind(this, item)} className={`mask ${isActive === index ? '' : 'hide'}`}>
                                <Icon
                                  type="check-circle"
                                  className={`icon ${id === item.id ? 'active' : ''}`}
                                  onClick={this.viewEvent.bind(this, item)}
                                />
                              </div>
                          }
                        </div>
                      </List.Item>
                    )}
                  />
                  <div className="content">
                    <div className="g-tr">
                      <Pagination
                        showSizeChanger
                        simple
                        current={pagination.currentPage}
                        total={pagination.total}
                        size={pagination.size}
                        defaultPageSize={pagination.limit}
                        onChange={this.changePage.bind(this)}
                      ></Pagination>
                    </div>
                  </div>
                </div> :
                <div className={style.noContent}>
                  <p><Icon type="frown" theme="filled" style={{color: '#64d', fontSize: '16px', marginRight: '5px'}}/>启禀小主没有搜索到您要找的文案哦！</p>
                </div>
              :
              <div className={style.noContent}>
                <p><Icon type="exclamation-circle" theme="filled" style={{color: '#64d', fontSize: '16px', marginRight: '5px'}} />您的广告文库空空如也，快去创作推广文案吧！</p>
                <p className="f12">点击下方按钮立即创作推广文案</p>
                <div className={style['btn']}>
                  <Button type="primary" onClick={this.selectEvent.bind(this)}>+创建文案</Button>
                </div>
              </div>
          }
        </div>
      </div>
    );
  }
}
export default SelectMateria;