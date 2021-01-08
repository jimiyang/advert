import React, { Component } from 'react';
import { DatePicker, Table, Select, Input, Button, Modal, message, Row, Col, Card, Icon } from 'antd';
import style from './style.less';
import moment from 'moment';
import router from 'umi/router'
import {
  caQuery,
  topupList,
  native,
  getByOrderNo,
  getAccountBankInfo
} from '@/api/api'//接口地址
import WithdrawList from './withdrawallist' //结算记录
import ConsumeList from './consumelist' //消费记录
import AdWithrawList from './adwithdrawlist' //提现记录
import RechargeModel from '@/pages/components/rechargeModel' //充值modal
const { Option } = Select
const {RangePicker} = DatePicker
class DepositList extends Component {
  constructor(props) {
    super(props);
    this.state = {
      isActive: 0,
      loginName: '',
      depositData: [],
      status: ['下单', '成功', '失败'],
      isVisible: false, //是否显示充值弹层
      isDrawVisible: false, //是否显示提现弹层
      isDetailVisible: false, //是否显示订单详情
      available_balance: '.', //可用余额
      freezen_balance: '.', //冻结余额
      withdrawCa_balance: '.', //提现金额
      detailData: {}, //订单详情数据
      qrUrl: '',
      pagination: {
        size: 'small',
        limit: 10, //每页显示多少条
        currentPage: 1,
        current: 1,
        total: 0,
        showSizeChanger: true,
        onChange: this.changePage,
        onShowSizeChange: this.onShowSizeChange
      },
      search: {
        dateStart: null,
        dateEnd: null,
        orderNo: null,
        orderStatus: null
      },
      topup: {
        amount: ''
      },
      loading: false,
      rechargeStep: 0 //充值默认的步骤
    };
  }
  componentDidMount() {
    const loginInfo = JSON.parse(window.localStorage.getItem('login_info'));
    //因为setState是异步的，他会在render后才生效,加入一个回调函数
    this.setState({
      loginName: loginInfo.data.loginName,
      phone: loginInfo.data.phone,
      merchantType: loginInfo.data.merchantType
    }, async() => {
      await this.isCrossAuth()
      await this.loadList()
      await this.getCaQuery()
    });   
  }
  isCrossAuth = async() => {
    const rs = await getAccountBankInfo()
    if(rs.success) {
      //console.log(rs.data.isCrossAuth)
      this.setState({isCrossAuthState: rs.data.isCrossAuth})
    }
  }
  loadList = async () => {
    //this.openNotification()
    const { pagination, search } = this.state;
    const params = {
      currentPage: pagination.currentPage,
      limit: pagination.limit,
      ...search
    };
    //console.log(params)
    this.setState({loading: true})
    await topupList(params).then(rs => {
      if (rs.success) {
        const pagination = Object.assign(this.state.pagination, { total: rs.total });
        this.setState({ depositData: rs.data, pagination });
      }
      this.setState({loading: false})
    })
  }
  changePage = (page) => {
    page = page === 0 ? 1 : page;
    const pagination = Object.assign(this.state.pagination, { currentPage: page, current: page });
    this.setState({ pagination });
    this.loadList();
  }
  //改变每页条数事件
  onShowSizeChange = (current, size) => {
    let p = this.state.pagination;
    p = Object.assign(p, { currentPage: current, current, limit: size });
    this.setState({ pagination: p });
    this.loadList();
  }
  //获取可用余额和冻结余额
  getCaQuery = async () => {
    const { loginName } = this.state;
    const rs = await caQuery({ operatorLoginName: loginName })
    const data = rs.data
    if (rs.success && data !== undefined) {
      this.setState({ 
        available_balance: data.benefitCa.available_balance, 
        freezen_balance: data.settleCa.available_balance,
        withdrawCa_balance: data.withdrawCa.available_balance
      });
    }
  }
  //切换记录列表
  accountTypeEvent = (index) => {
    this.setState({ isActive: index });
  }
  changeFormEvent = (e, type, value2) => {
    let search = this.state.search;
    let obj = {};
    switch (type) {
      case 'date':
        obj = {dateStart: value2[0], dateEnd: value2[1]};
        break;
      case 'orderNo':
        obj = { [type]: e.target.value };
        break;
      case 'orderStatus':
        obj = { [type]: e };
        break;
      default:
        search = { [type]: e.target.value };
        break;
    }
    search = Object.assign(search, obj);
    this.setState({ search });
  }
  searchEvent = () => {
    const pagination = Object.assign(this.state.pagination, { currentPage: 1, current: 1 });
    this.setState({ pagination });
    this.loadList();
  }
  clearEvent = () => {
    let search = this.state.search;
    search = Object.assign(
      search, {
      dateStart: null,
      dateEnd: null,
      orderNo: null,
      orderStatus: null
    }
    );
    const pagination = Object.assign(this.state.pagination, { currentPage: 1, current: 1 });
    this.setState({ pagination, search});
    this.loadList();
  }
  //充值弹窗
  saveMoneyEvent = () => {
    let topup = this.state.topup;
    topup = Object.assign(topup, { amount: '' });
    this.setState({ isVisible: true, topup, rechargeStep: 0 });
  }
  closeEvent = () => {
    this.setState({
      isVisible: false,
      isDrawVisible: false,
      isDetailVisible: false,
      isvisible: false 
    });
  }
  //调用子组件的表单事件
  bindValue = (type, e) => {
    let topup = this.state.topup;
    topup = Object.assign(topup, {[type]: e.target.value});
    this.setState({ topup });
  }
  //充值事件
  rechargeEvent = () => {
    const {topup} = this.state;
    const reg = /^[0-9]+([.]{1}[0-9]{1,2})?$/;
    if (!reg.test(topup.amount)) {
      message.error('请输入整数或小数(保留后两位)');
      return false;
    }
    native(topup).then(rs => {
      if (rs.success) {
        this.setState({
          ...rs.data,
          rechargeStep: 1,
        });
      }
    });
  }
  reload = () => {
    //console.log(111111);
    const that = this;
    const timer = setTimeout(function () {
      that.getCaQuery();
      that.setState({ isVisible: false });
      clearTimeout(timer);
    }, 3000);
  }
  //查看订单详情
  viewDetailEvent = (id) => {
    const params = {
      operatorLoginName: this.state.loginName,
      orderNo: id
    };
    getByOrderNo(params).then(rs => {
      if (rs.success) {
        this.setState({ detailData: rs.data, isDetailVisible: true });
      }
    });
  }
  //提现和认证
  widthdrawEvent = (type) => {
    let {isCrossAuthState, token, phone, merchantType} = this.state
    switch(type) {
        case 1:
          let url = isCrossAuthState === 4 ? '/authentication' : `/detail`
          router.push({
            pathname: url,
            state: {
              phone,
              merchantType //1是广告主
            }
          })
        break
        case 2:
          isCrossAuthState !== 2 ? this.setState({isvisible: true}) :  router.push({
            pathname: '/account',
            state: {phone, merchantType}
          })
        break
    }
  }
  render() {
    const {
      isActive,
      depositData,
      status,
      pagination,
      isVisible,
      search,
      available_balance,
      freezen_balance,
      withdrawCa_balance,
      topup,
      rechargeStep,
      payUrl,
      orderNo,
      loading,
      isvisible
    } = this.state;
    const columns = [
      {
        title: '充值时间',
        key: 'createDate',
        dataIndex: 'createDate',
        render: (record) => (
          <div>{record === undefined ? '--' : window.common.getDate(record, true)}</div>
        )
      },
      {
        title: '充值单号',
        key: 'orderNo',
        dataIndex: 'orderNo',
        render: (record) => (
          <div className="opeartion-items">
            <span className="blue-color line" onClick={() => this.viewDetailEvent(record)}>{record}</span>
          </div>
        )
      },
      {
        title: '充值金额(元)',
        key: 'orderAmtShow',
        dataIndex: 'orderAmtShow',
        align: 'right'
      },
      {
        title: '充值方式',
        key: 'topupType',
        dataIndex: 'topupType',
        render: (record) => (
          <div>{record === 1 ? '微信' : '支付宝'}</div>
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
        title: '订单状态',
        key: 'orderStatus',
        dataIndex: 'orderStatus',
        render: (record) => (
          <div>
            <span>{status[record]}</span>
            {/*record === 2 ? <span>重新检测</span> : null*/}
          </div>
        )
      }
    ];
    return (
      <div className={style.financialModel}>
        <header className="header-style">
          财务管理
        </header>
        <Modal
            width={350}
            closable={false}
            visible={isvisible}
            onCancel={() => this.closeEvent()}
            footer={
              <Button type="primary" onClick={() => this.closeEvent()}>我知道了</Button>
            }
        >
            <div className={style['tips']}>
              <h1 className={style['error']}><Icon type="close-circle" className={style['ico']} />无法申请提现</h1>
              <p>为确保您的账户安全，请先进行实名认证</p>
            </div>
        </Modal>
        <Modal
          visible={isVisible}
          width={400}
          onCancel={this.closeEvent}
          footer={
            rechargeStep === 0 ?
              <div>
                <Button type="primary" onClick={() => this.rechargeEvent()}>确定</Button>
              </div> : null
          }
        >
          <RechargeModel
            changeFormEvent={(type, e) => this.bindValue(type, e)}
            reload={() => this.reload()}
            amount={topup.amount}
            payUrl={payUrl}
            orderNo={orderNo}
            rechargeStep={rechargeStep}
            isVisible={isVisible}
          />
        </Modal>
        <div >
          <Row gutter={50} style={{display:'flex',alignItems:'center'}}>
            <Col span={17}  className={style.cardStyle}>
              <Row gutter={[16, 20]} >
                <Col span={8}>
                  <Card className={style['money']} style={{ background: '#f97e96'}}>
                    <p className={style['money-p']}>账户可用余额</p>
                    <div className={style['moneyFont']}>
                      <span>{`${available_balance}`}</span>
                      <Icon type="wallet" theme="filled" style={{ fontSize: 43 }} />
                    </div>
                  </Card>
                </Col>
                <Col span={8}>
                  <Card className={style['money']} style={{ background: '#528EEB' }}>
                    <p className={style['money-p']}>提现中金额</p>
                    <div className={style['moneyFont']}>
                      <span>{`${withdrawCa_balance}`}</span>
                      <Icon type="dollar-circle" theme="filled" style={{ fontSize: 43 }} />
                    </div>
                  </Card>
                </Col>
                <Col span={8}>
                  <Card className={style['money']} style={{ background: '#9dabba' }}>
                    <p className={style['money-p']}>冻结金额</p>
                    <div className={style['moneyFont']}>
                      <span>{`${freezen_balance}`}</span>
                      <Icon type="money-collect" theme="filled" style={{ fontSize: 43 }} />
                    </div>
                  </Card>
                </Col>
              </Row>
            </Col>
            <Col span={8}>
              <div className={style['accountAmount']}>
                <span className={style['btn1']} onClick={() => this.saveMoneyEvent()}>充值</span>
                <span className={style['btn2']} onClick={() => this.widthdrawEvent(1)}>认证</span>
                <span className={style['btn3']} onClick={() => this.widthdrawEvent(2)}>提现</span>
              </div>
            </Col>
          </Row>
        </div>
        <ul className={style.accountType}>
          <li className={isActive === 0 ? style.active : null} onClick={() => this.accountTypeEvent(0)}>充值记录</li>
          <li className={isActive === 1 ? style.active : null} onClick={() => this.accountTypeEvent(1)}>活动收支明细</li>
          <li className={isActive === 2 ? style.active : null} onClick={() => this.accountTypeEvent(2)}>结算记录</li>
          <li className={isActive === 3 ? style.active : null} onClick={() => this.accountTypeEvent(3)}>提现记录</li>
        </ul>
        <div className={isActive === 2 ? null : 'hide'}>
          {
            //结算记录
            isActive === 2 ? <WithdrawList isActive={isActive} /> : null
          }
          
        </div>
        <div className={isActive === 1 ? null : 'hide'}>
          {
            //活动收支明细
            isActive === 1 ? <ConsumeList isActive={isActive} /> : null
          }
        </div>
        <div className={isActive === 3 ? null : 'hide'}>
          {
            //提现记录
            isActive === 3 ? <AdWithrawList isActive={isActive} /> : null
          }
        </div>
        <div className={isActive === 0 ? null : 'hide'}>
          <ul className={style.search}>
            <li>
              <label>创建时间：</label>
              <RangePicker 
                className={`w2600`}
                value={search.dateStart === null || search.dateStart === '' ? null : [moment(search.dateStart, 'YYYY-MM-DD'), moment(search.dateEnd, 'YYYY-MM-DD')]}
                onChange={(e, value) => this.changeFormEvent(e, 'date', value)}
              />
            </li>
            <li>
              <label className="ml10">充值单号：</label>
              <Input className={`${style['ipt']}`} value={search.orderNo} onChange={e => this.changeFormEvent(e, 'orderNo')} />
            </li>
            <li>
              <label className="ml10">订单状态：</label>
              <Select value={search.orderStatus} onChange={e => this.changeFormEvent(e, 'orderStatus')} className={`${style['ipt']}`}>
                <Option value={null}>全部</Option>
                {
                  status.map((item, index) => (<Option value={index} key={index}>{item}</Option>))
                }
              </Select>
            </li>
            <li>
              <Button type="primary" onClick={() => this.searchEvent()} className="ml10">查询</Button>
            </li>
          </ul>
          <Table
            dataSource={depositData}
            columns={columns}
            rowKey={record => record.id}
            pagination={pagination}
            className="table"
            loading={loading}
          />
        </div>
      </div>
    );
  }
}
export default DepositList;