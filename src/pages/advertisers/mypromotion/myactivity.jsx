import React, { Component } from 'react';
import { DatePicker, Select, Input, Button, message, Popconfirm, Table, Icon } from 'antd';
import style from './style.less';
import router from 'umi/router';
import moment from 'moment';
import Link from 'umi/link'
import { withRouter } from 'react-router-dom'
import {
  list,
  updatePostStatusById
} from '@/api/api';//接口地址
import utils from '@/untils/common.js'
const { Option } = Select;
const { RangePicker } = DatePicker;
class MyActivity extends Component {
  constructor(props) {
    super(props);
    this.state = {
      loginName: '',
      activityData: [],
      pagination: {
        size: 'small',
        showSizeChanger: true,
        total: 0,
        currentPage: 1,
        current: 1,
        limit: 10,
        pageSize: 10
      },
      search: {
        campaignName: null,
        dateStart: null,
        dateEnd: null,
        postStatus: null,
        extrend_json: null
      },
      draftTotal: 0,
      total: 0,
      expandedKey: [],
      loading: true,
      expandedRows: []
    };
  }
  async componentDidMount() {
    const loginInfo = JSON.parse(window.localStorage.getItem('login_info'));
    let pagination = this.state.pagination
    //console.log(this.props.pageSize)
    let pageSize = this.props.pageSize === undefined ? 10 : this.props.pageSize
    pagination = Object.assign(pagination, { pageSize, limit: pageSize })
    //因为setState是异步的，他会在render后才生效,加入一个回调函数
    await this.setState({
      loginName: loginInfo.data.loginName,
      pagination
    });
    this.loadList('getExpandedRows');
  }
  loadList = async (type) => {
    const { pagination, search, loginName } = this.state;
    const params = {
      ...search,
      loginName,
      currentPage: pagination.currentPage,
      limit: pagination.limit
    };
    let arr = [];
    const rs = await list(params)
    if (rs.success) {
      const p = Object.assign(pagination, { total: rs.total });
      for (let i = 0; i < rs.data.length; i++) {
        arr.push(i);
      }
      if(Boolean(type)){
        this.setState({expandedRows:rs.data.length&&rs.data[0].id?[rs.data[0].id]:[]})
      }
      this.setState({ activityData: rs.data, pagination: p, expandedKey: arr, loading: false });
    }
  }
  changePage = (page) => {
    page = page === 0 ? 1 : page;
    const pagination = Object.assign(this.state.pagination, { currentPage: page, current: page });
    this.setState({ pagination, loading: true }, () => {
      this.loadList();
    });
  }
  //改变每页条数事件
  onShowSizeChange = (current, size) => {
    let p = this.state.pagination;
    p = Object.assign(p, { currentPage: current, current, limit: size, pageSize: size });
    this.setState({ pagination: p, loading: true }, () => {
      this.loadList();
    });
  }
  //修改活动状态
  cancelActivityEvent = (item, type) => {
    let postStatus;
    //停止活动
    if (type === 'stop') {
      postStatus = 29;
    } else {
      postStatus = item.postStatus === 27 ? 28 : 27;
    }
    const params = {
      id: item.id,
      postStatus
    };
    //.log(params);
    updatePostStatusById(params).then(rs => {
      if (rs.success) {
        message.success(rs.message);
        this.setState({
          loading: true
        }, () => {
          this.loadList();
        })
      }
    });
  }
  changeFormEvent = (type, e, value) => {
    let search = this.state.search;
    let obj = {};
    switch (type) {
      case 'date':
        obj = { 'dateStart': value[0], 'dateEnd': value[1] };
        break;
      case 'postStatus':
        obj = { [type]: e };
        break;
      case 'campaignName':
        obj = { [type]: e.target.value };
        break;
      case 'extrend_json':
      obj = { [type]: e.target.value };
      break;
      default:
        obj = { [type]: e.target.value };
        break;
    }
    search = Object.assign(search, obj);
    this.setState({ search });
  }
  searchEvent = () => {
    const pagination = Object.assign(this.state.pagination, { currentPage: 1, current: 1 });
    this.setState({ pagination, loading: true }, () => {
      this.loadList();
    });
  }
  //重置
  // clearEvent = () => {
  //   let search = this.state.search;
  //   search = Object.assign(
  //     search, {
  //     campaignName: null,
  //     dateStart: null,
  //     dateEnd: null,
  //     postStatus: null
  //   }
  //   );
  //   const pagination = Object.assign(this.state.pagination, { currentPage: 1, current: 1 });
  //   this.setState({ pagination, search, loading: true }, () => {
  //     this.loadList();
  //   });

  // }
  //创建活动
  createEvent = () => {
    router.push('/createactivity');
  }
  //二级表格
  expandedRowRender = e => {
    const columns = [
      {
        title: '推广文案',
        width:'200px',
        key:'text1',
        render: (e) => (
          <dl className={style['msgDl']}>
            <dt>
              <img src={e.impImage} alt="" width='60px' height='60px' />
              <p>{e.appArticlePosition == 9 ? '不限' : utils['advertLocal'][e.appArticlePosition - 1]}</p>
            </dt>
            <dd className={style['dd-hover']} onClick={() => {
              window.open(`${utils.articleUrl}/fshstatic/view.html?id=${e.postContent}`)
            }}>{e.extrendJson}</dd>
          </dl>
        )
      },
      {
        title: '阅读单价(元/阅读)',
        dataIndex: 'unitPrice',
        align: 'center',
        key:'text2',
      },
      {
        title: '预估阅读量',
        dataIndex: 'finalAvailableCnt',
        align: 'center',
        key:'text3',
      },
      {
        title: '实际阅读量',
        dataIndex: 'missionRealReadCnt',
        align: 'center',
        key:'text4',
      },
      {
        title: '实际支出',
        dataIndex: 'realCost',
        align: 'center',
        key:'text5',
        render: e => <div>{e ? e : 0.00}</div>
      },
    ]
    const data = []
    if (e.details) {
      for (let i = 0; i < e.details.length; i++) {
        e.details[i].key = i
        data.push(e.details[i])
      }
    }
    return <Table columns={columns} dataSource={data} pagination={false} />
  }
  //默认展开事件
  onExpandedRowsChange = (expandedRows) => {
    this.setState({
      expandedRows
    })
  }
  //点击查看
  clickLook = (data) => {
    this.props.history.push({ pathname: '/activitydetail', state: data })
  }
  render() {
    //新的
    const {
      activityData,
      pagination,
      search,
      loading,
      expandedRows
    } = this.state;
    const columns = [
      { title: '活动ID', dataIndex: 'campaignId', key: 'campaignId', align: 'center' },
      { title: '活动名称', dataIndex: 'campaignName', key: 'campaignName', align: 'center' },
      { title: '活动总预算', dataIndex: 'postAmtTotal', key: 'postAmtTotal', align: 'center' },
      { title: '接单媒体量', dataIndex: 'missionNum', key: 'missionNum', align: 'center' },
      { title: '创建时间', dataIndex: 'createDate', key: 'createDate', align: 'center', render: (e) => moment(e).format('YYYY-MM-DD HH:mm:ss') },
      { title: '活动推广时间', key: 'time', align: 'center', render: (e) => <span>{`${moment(e.dateStart).format('YYYY-MM-DD')}至${moment(e.dateEnd).format('YYYY-MM-DD')}`}</span> },
      {
        title: '活动状态', dataIndex: 'postStatus', key: 'postStatus',
        render: (e) => (<div>{window.common.activityStatus(e)}</div>)
      },
      {
        title: '操作',
        key: 'operation',
        render: (e) => {
          let status1 =
            <div>
              <a onClick={() => this.clickLook({ id: e.id, campaignId: e.campaignId })}>查看</a>
              {
                this.props.isDisplay ? '' :
                  <>
                    <Popconfirm
                      title={`暂停推广后可在活动截止前启动，继续推广`}
                      onConfirm={this.cancelActivityEvent.bind(this, e, 'pause')}
                      okText="确定"
                      cancelText="取消"
                    >
                      <a> | 暂停</a>
                    </Popconfirm>
                    <Popconfirm
                      title={`该操作将终止当前推广，且不可恢复`}
                      onConfirm={this.cancelActivityEvent.bind(this, e, 'stop')}
                      okText="确定"
                      cancelText="取消"
                    >
                      <a> | 停止</a>
                    </Popconfirm>
                  </>
              }
            </div>;
          let status2 =
            <div>
              <a onClick={() => this.clickLook({ id: e.id, campaignId: e.campaignId })}>查看</a>
              {
                this.props.isDisplay ? '' :
                  <>
                    <Popconfirm
                      title={`启动后将继续推广活动`}
                      onConfirm={this.cancelActivityEvent.bind(this, e, 'pause')}
                      okText="确定"
                      cancelText="取消"
                    >
                      <a> | 启动</a>
                    </Popconfirm>
                    <Popconfirm
                      title={`该操作将终止当前推广，且不可恢复`}
                      onConfirm={this.cancelActivityEvent.bind(this, e, 'stop')}
                      okText="确定"
                      cancelText="取消"
                    >
                      <a> | 停止</a>
                    </Popconfirm>
                  </>
              }
            </div>;
          let status3 =
          <div>
            <a onClick={() => this.clickLook({ id: e.id, campaignId: e.campaignId })}>查看</a>
            {
              e.postStatus === 22 ? 
              <Link
                to={{
                  pathname: '/createactivity',
                  state: {
                    id: e.id
                  }
                }}
              > | 编辑</Link> : null
            }
          </div>;
          switch (e.postStatus) {
            case 30:
              return status3;
            case 21:
              return status3;
            case 22:
              return status3;
            case 27:
              return status1;
            case 29:
              return status3;
            case 28:
              return status2;
          }
        }
      },
    ];
    return (
      <div className={style.mypromotion}>
        {
          this.props.isDisplay ?
            '' :
            <header className="header-style">
              推广记录
            </header>
        }
        {/* 首页 isDisplay 为true 时不显示 搜索条件 */}
        {
          this.props.isDisplay ?
            ''
            :
            <div>
              <ul className={style.search} style={{ marginBottom: 20 }}>
                <li>
                  <label>推广时间</label>
                  <RangePicker
                    value={search.dateStart === null || search.dateStart === '' ? null : [moment(search.dateStart, 'YYYY-MM-DD'), moment(search.dateEnd, 'YYYY-MM-DD')]}
                    className="date"
                    onChange={this.changeFormEvent.bind(this, 'date')}
                    style={{width: '230px'}}
                  />
                </li>
                <li>
                  <label>状态</label>
                  <Select placeholder="全部" value={search.postStatus} className="w120 select" onChange={this.changeFormEvent.bind(this, 'postStatus')}>
                    <Option value={null}>全部</Option>
                    {
                      window.common.postStatus.map((item, index) => (
                        <Option key={index} value={item.id}>{item.name}</Option>
                      ))
                    }
                  </Select>
                </li>
                <li>
                  <label>文章标题</label>
                  <Input style={{ width: 180 }} value={search.extrend_json} onChange={this.changeFormEvent.bind(this, 'extrend_json')} placeholder='搜索文章标题' />
                </li>
                <li>
                  <label>活动编号</label>
                  <Input style={{ width: 180 }} value={search.campaignId} onChange={this.changeFormEvent.bind(this, 'campaignId')} placeholder='搜索活动编号' />
                </li>
                <li>
                  <Button type="primary" className="mr10" onClick={this.searchEvent.bind(this)}>查询</Button>
                  {/* <Button className="ml10" onClick={this.clearEvent.bind(this)}>清除</Button> */}
                  <Button type="primary" onClick={this.createEvent.bind(this)}><Icon type="plus" />发布广告</Button>
                </li>
              </ul>
            </div>
        }
        <Table
          className="components-table-demo-nested"
          columns={columns}
          expandedRowKeys={expandedRows}
          expandedRowRender={this.expandedRowRender}
          onExpandedRowsChange={this.onExpandedRowsChange}
          dataSource={activityData}
          loading={loading}
          rowKey={record => record.id}
          pagination={this.props.isDisplay ? false : {
            showSizeChanger: true,
            // size:{pagination.size },
            onChange: this.changePage,
            onShowSizeChange: this.onShowSizeChange,
            current: pagination.currentPage,
            pageSize: pagination.pageSize,
            total: pagination.total,
            showTotal: () => `共${pagination.total}条`,
          }}
        />
      </div>
    );
  }
}
export default withRouter(MyActivity);