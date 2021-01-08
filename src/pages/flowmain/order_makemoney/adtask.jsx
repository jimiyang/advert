import React, { Component } from 'react';
import { Button, Table, Select, Avatar, Popconfirm, message } from 'antd';
import style from './style.less';
import moment from 'moment';
import untils from '@/untils/common';
import urlFn from '@/untils/method';
import {
  appList,
  missionList,
  updateMissionStatusById,
} from '@/api/api';
import utils from '@/untils/common';
import WxUrl from '../component/wxurl/wxurl';
const Option = Select.Option;
class AdTask extends Component {
  constructor(props) {
    super(props);
    this.state = {
      pubAccountData: [],
      appsData: [], //公众号列表
      status: null,
      total: 0,
      appId: null,
      missionStatus: null,
      appId: null,
      missionStatus: null,
      current: 1,
      defaultApp: '',
      loading: true,
      missionId: null,
      nickName: null
    };
  }
  componentDidMount() {
    //遍历路由  获取参数
    let urlObj = urlFn();
    let currentToken = urlObj.token ? urlObj.token : window.localStorage.getItem('token');
    this.setState({
      token: currentToken
    }, async () => {
      await this.getListApps();
    });
  }
  //列表
  loadList = (page) => {
    const { appId, missionStatus, token } = this.state;
    let obj = {};
    obj.appId = appId;
    obj.missionStatus = missionStatus;
    obj.currentPage = page ? page : this.state.current;
    obj.token = token;
    missionList({ ...obj }).then(rs => {
      if (rs.code === 0) {
        rs.data.items.forEach((item, index) => {
          item.key = index;
        });
        this.setState({
          pubAccountData: rs.data.items,
          total: rs.data.totalNum,
          loading: false
        });
      }
    });
  }
  //改变页码
  changePage = (page) => {
    this.setState({
      current: page,
      loading: true
    });
    this.loadList(page);
  }

  //查询所有公众号
  getListApps = () => {
    appList({ token: this.state.token }).then(rs => {
      if (rs.code === 0) {
        if (rs.data !== undefined || rs.data.length) {
          this.setState({
            appsData: rs.data,
          }, () => {
            this.loadList();
          });
        }
      }

    });
  }
  changeFormEvent = (e, type) => {
    let search = this.state.search;
    this.setState({
      [type]: e,
      loading: true,
      current: 1
    }, () => {
      this.loadList();
    });
  }
  cancelMission = (item) => {
    updateMissionStatusById({ id: item.id, missionStatus: 19, token: this.state.token }).then(rs => {
      if (rs.success) {
        message.success(rs.message);
        this.loadList();
      }
    });
  }
  submitUrl = (e) => {
    this.setState({
      isVisible: true,
      missionId: e.missionId
    });
  }
  //隐藏弹框
  hide() {
    this.setState({
      isVisible: false,
    });
  }
  render() {
    const {
      pubAccountData,
      appsData,
      appId,
      missionStatus,
      status,
      total,
      current,
      loading,
      isVisible,
      missionId,
      token,
      nickName
    } = this.state;
    const columns = [
      {
        title: '订单号',
        dataIndex: 'missionId',
        key: "missionId",
      },
      {
        title: '创建时间',
        dataIndex: 'createDate',
        key: "createDate",
        render: (e) => (
          <span>{moment(e).format('YYYY-MM-DD hh:mm:ss')}</span>
        )
      },
      {
        title: '订单内容',
        key: 'missionIdMsg',
        render: e => (
          <div className={style['table-text']}>
            <div>
              <img src={e.impImage} width='80' height='55' />
              <p>{e.appArticlePosition != 9 ? untils.advertLocal[e.appArticlePosition - 1] : '不限'}</p>
            </div>
            <div>
              <b>{e.appNickName}</b>
              <p>{e.title}</p>
            </div>
          </div>
        )
      },
      {
        title: '推文要求时间',
        key: 'needTime',
        align: 'center',
        render: (e) => (
          <div>
            <span>{moment(e.dateStart).format('YYYY-MM-DD')}~{moment(e.dateEnd).format('YYYY-MM-DD')}</span>
            <p>{e.hourStartStr ? `(${e.hourStartStr}~${e.hourEndStr})` : '不限'}</p>
          </div>
        )
      },
      {
        title: '计划投放日期',
        key: 'planPostArticleTime',
        align: 'center',
        dataIndex: 'planPostArticleTime'
      },
      {
        title: '实际推文时间',
        key: 'realPostArticleTime',
        align: 'center',
        render: (e) => (
          <span>{e.realPostArticleTime ? e.realPostArticleTime : '--'}</span>
        )
      },
      {
        title: '阅读单价(元/阅读)',
        key: 'adUnitPrice',
        dataIndex: 'flowUnitPrice',
        align: 'center',
        render: (record) => (
          <span>{record !== undefined ? record : '--'}</span>
        )
      },
      {
        title: (<div><p>预估收入（元）</p><p>实际收入（元）</p></div>),
        key: 'missionReadCnt',
        align: 'center',
        render: (e) => (
          <div>
            <span>{`${e.estimateMin}~${e.estimateMax}`}</span>
            <p>{e.flowRealIncome ? e.flowRealIncome : '--'}</p>
            {/* <p>{e. !== undefined ? window.common.formatNumber(record.missionReadCnt) : '--'}</p> */}
          </div>
        )
      },
      {
        title: '订单状态',
        align: 'center',
        render: (e) => (
          <div>
            {
              e.missionStatus === 19 ? '取消' : null
            }
            {
              e.missionStatus === 18 ? '结算失败' : utils.missionStatus[e.missionStatus - 10]
            }

          </div>
        )
      },
      {
        title: '操作',
        render: (e) => (
          <div>
            {
              (e.verifyTypeInfo * 1 == -1) && (e.missionStatus == 11) ? <p className="cur purple-color" onClick={() => this.submitUrl(e)}>提交链接</p> : ''
            }
            {
              Number(e.missionStatus) === 11 ?
                <Popconfirm
                  title="是否要取消订单?"
                  onConfirm={() => this.cancelMission(e)}
                  okText="是"
                  cancelText="否"
                  className='purple-color'
                >
                  <span className="blue-color block cur">取消订单</span>
                </Popconfirm> : null
            }
          </div>

        )
      }
    ];
    return (
      <div className={style.pubAccount}>
        <header className="header-style">已接订单</header>
        <WxUrl isVisible={isVisible} key={isVisible + Date.now()} token={token} missionId={missionId} hide={this.hide.bind(this)} loadList={() => { this.loadList() }} />
        <ul className={style.search}>
          <li>
            <span className="mr10">公众号</span>
            <Select showSearch value={nickName} className="w180">
              <Option value={null} onClick={() => {
                this.setState({
                  appId: null,
                  nickName: null
                }, () => {
                  this.changeFormEvent('appId');
                });
              }}
              >全部公众号</Option>
              {
                appsData.map((item, index) => {
                  return <Option key={index} value={item.nickName} onClick={() => {
                    this.setState({
                      appId: item.appId,
                      nickName: item.nickName
                    }, () => {
                      this.changeFormEvent('appId');
                    });
                  }}>
                    <div className={style["d-select"]}>
                      <Avatar
                        className={style["d-avatar"]}
                        size="small"
                        src={item.headImg}
                      />
                      <span>{item.nickName}</span>
                    </div>
                  </Option>;
                })
              }
            </Select>
          </li>
          <li>
            <span className="mr10">接单状态</span>
            <Select value={missionStatus} className="w180" onChange={e => this.changeFormEvent(e, 'missionStatus')}>
              <Option value={null}>全部订单</Option>
              {
                utils.missionStatus.map((item, index) => {
                  return index ? <Option key={index} value={index * 1 + 10}>{item}</Option> : '';
                })
              }
              <Option value={19}>取消</Option>
            </Select>
          </li>
          <Button
            type='primary'
            style={{ position: 'absolute', right: 20 }}
            onClick={() => {
              if (window.location.href.includes('test')) {
                window.top.location.href = "http://test.fensihui.com/fshstatic/localArticleList";
              } else {
                window.top.location.href = "http://houtai.fensihui.com/fshstatic/localArticleList";
              }
            }}
          >查看文案</Button>
        </ul>
        <Table
          dataSource={pubAccountData}
          columns={columns}
          loading={loading}
          pagination={{
            showQuickJumper: true,
            size: 'small',
            showTotal: (total) => `共 ${total} 条`,
            total: total,
            current: current,
            limit: 10,
            onChange: this.changePage,
          }}
          rowKey={record => record.id}
          style={{ marginTop: 20 }}
        />
      </div>
    );
  }
}
export default AdTask;