import React, { Component } from 'react'
import { DatePicker, Table, Button, Popover, Select, Modal, Icon} from 'antd'
import moment from 'moment'
import router from 'umi/router'
import {
    caQuery,
    getWithdrawList, //流量主提现
    getAdWithdrawList, //广告主提现
    getAccountBankInfo,
    getAdAccountBankInfo,
    getWithdrawDetail,
    getAdWithdrawDetail
} from '@/api/api'
import style from './index.less'
const Option = Select.Option
const { RangePicker } = DatePicker;
class AuthList extends Component {
  constructor(props) {
    super(props)
    this.state = {
        availableBalance: '.',
        settlecaBalance: '.',
        isvisible: false,
        search: {
            dateStart: null,
            dateEnd: null,
            orderStatus: null
        },
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
        widthdrawData: [],
        isCrossAuthState: null,
        hovered: false,
        detailForm: {
            bankCardOwnerName: null,
            orderAmtShow: null,
            thirdOrderNo: null,
            bankName: null,
            subbranchName: null,
            bankCardNo: null,
            auditRemark: null
        },
        loading: true
    }
  }
  async componentDidMount() {
    const token = this.props.location.state.token
    //商户类型
    const merchantType = this.props.location.state.merchantType
    this.setState({
        token,
        merchantType
    }, async () => {
        await this.isCrossAuth()
        this.getcaQuery()
        this.loadList()
    })
  }
  isCrossAuth = async() => {
    const {token, merchantType} = this.state
    const Fun = Number(merchantType) === 1 ? getAdAccountBankInfo() : getAccountBankInfo({token}) //1是广告主 
    //const rs = await getAccountBankInfo({token: this.state.token})
    await Fun.then(rs => {
        if(rs.success) {
            //console.log(rs.data.isCrossAuth)
            this.setState({isCrossAuthState: rs.data.isCrossAuth})
        }
    })
  }
  getcaQuery = async () => {
    const rs = await caQuery({token: this.state.token})
    if (rs.success && rs.data !== undefined) {
        this.setState({ availableBalance: rs.data.benefitCa.available_balance, settlecaBalance: rs.data.settleCa.available_balance });
    }
  }
  loadList = async () => {
    let {search, pagination, token, merchantType} = this.state
    const params = {
      ...search,
      currentPage: pagination.currentPage,
      limit: pagination.pageSize,
      token
    }
    const Fun = Number(merchantType) === 1 ? getAdWithdrawList : getWithdrawList
    Fun(params).then(rs => {
        if (rs.success) {
            const p = Object.assign(pagination, {total: rs.total})
            this.setState({widthdrawData: rs.data, pagination: p, loading: false})
        } 
    })
  }
  changePage = (page) => {
    page = page === 0 ? 1 : page
    const pagination = Object.assign(this.state.pagination, {currentPage: page, current: page})
    this.setState({pagination, ischecked: false, allchk: false, loading: true }, () => {
        this.loadList();
    });
  }
  //改变每页条数事件
  onShowSizeChange = (current, size) => {
    let p = this.state.pagination
    p = Object.assign(p, {currentPage: current, current, pageSize: size})
    this.setState({pagination: p, ischecked: false, allchk: false, loading: true }, () => {
        this.loadList();
    });
  }
  changeFormEvent = (e, type, value) => {
    let search = this.state.search, obj = {}
    switch(type) {
      case 'orderStatus':
        obj = {[type]: e}
        break
      case 'date':
        obj = {'dateStart': value[0], 'dateEnd': value[1]}
        break
      default:
        obj = {[type]: e.target.value}
        break
    }
    search = Object.assign(search, obj)
    this.setState({search})
  }
  widthdrawEvent = (type) => {
    let {isCrossAuthState, token} = this.state
    switch(type) {
        case 1:
          let url = isCrossAuthState === 4 ? '/authentication' : '/detail'
          router.push({
              pathname: url,
              state: {
                token
              }
          })
        break
        case 2:
          isCrossAuthState !== 2 ? this.setState({isvisible: true}) :  router.push({
              pathname: '/account',
              state: { token}
          })
        break
      }
  }
  searchEvent = () => {
    const pagination = Object.assign(this.state.pagination, { currentPage: 1, current: 1 });
    this.setState({ pagination, loading: true }, () => {
      this.loadList();
    });
  }
  clearEvent = () => {
    let search = this.state.search;
    search = Object.assign(
    search, {
        dateStart: null,
        dateEnd: null,
        orderStatus: null
    }
    );
    const pagination = Object.assign(this.state.pagination, { currentPage: 1, current: 1 });
    this.setState({ pagination, search, loading: true }, () => {
        this.loadList();
    });
  }
  cancelEvent = () => {
    this.setState({isvisible: false})
  }
  viewDataEvent = (item) => {
    const {token, merchantType} = this.state
    const params = {
        orderNo: item.orderNo, 
        token
    }
    const Fun = merchantType === 1 ? getAdWithdrawDetail : getWithdrawDetail
    Fun(params).then(rs => {
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
        availableBalance,
        settlecaBalance,
        search,
        widthdrawData,
        pagination,
        isvisible,
        hovered,
        detailForm,
        loading
    } = this.state
    const title = (<div className={style['dtitle']}>提现详情</div>)
    const content = (
        <ul className={style['detailBox']}>
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
            dataIndex: 'orderNo',
            render: (record) => (
                <div className="g-tc">{record}</div>
            )
        },
        {
            title: '提现人',
            key: 'bankCardOwnerName',
            dataIndex: 'bankCardOwnerName',
            render: (record) => (
                <div className="g-tc">{record}</div>
            )
        },
        {
            title: '提现渠道',
            render: (record) => (
                <div className="g-tc">银行卡</div>
            )
        },
        {
            title: '申请金额(元)',
            key: 'orderAmtShow',
            dataIndex: 'orderAmtShow',
            render: (record) => (
                <div className="g-tc">{record}</div>
            )
        },
        {
            title: '到账金额(元)',
            key: 'realWithdrawAmt',
            dataIndex: 'realWithdrawAmt',
            render: (record) => (
                <div className="g-tc">{record}</div>
            )
        },
        {
            title: '手续费(元)',
            key: 'feeAmt',
            dataIndex: 'feeAmt',
            render: (record) => (
                <div className="g-tc">{record}</div>
            )
        },
        {
            title: '申请时间',
            key: 'applyTime',
            dataIndex: 'applyTime',
            render: (record) => (
                <div className="g-tc">{record}</div>
            )
        },
        {
            title: '更新时间',
            key: 'auditTime',
            dataIndex: 'auditTime',
            render: (record) => (
                <div className="g-tc">{record}</div>
            )
        },
        {
            title: '提现状态',
            key: 'orderStatus',
            dataIndex: 'orderStatus',
            render: (record) => (
                <div className="g-tc">{window.common.cashstatusData[Number(record) - 1]}</div>
            )
        },
        {
            title: '操作',
            render: (record) => (
                <div>
                    <Popover
                        placement="bottomLeft"
                        title={title}
                        content={content}
                        trigger="hover"
                        visible={hovered === record.id ? true : false}
                        onVisibleChange={() => this.handleHoverChange(record)}
                    >
                        <span className="g-tc blue-color cur">详情</span>
                    </Popover>
                </div>
            )
        }
    ]
    return (
        <div className={style.authenticationForm}>
            <Modal
                width={350}
                closable={false}
                visible={isvisible}
                onCancel={() => this.cancelEvent()}
                footer={
                    <Button type="primary" onClick={() => this.cancelEvent()}>我知道了</Button>
                }
            >
                <div className={style['tips']}>
                    <h1 className={style['error']}><Icon type="close-circle" className={style['ico']} />无法申请提现</h1>
                    <p>为确保您的账户安全，请先进行实名认证</p>
                </div>
            </Modal>
            {/*<div className={style.accountAmount}>
                <div>
                    <div className={style.accountItems}>
                        {availableBalance}
                        <h1>账户可用余额</h1>
                    </div>
                    <div className={style.lockAmount}>
                        {settlecaBalance}
                        <h1>提现中金额</h1>
                    </div>
                </div>
                <p>
                    <span onClick={this.widthdrawEvent.bind(this, 1)}>认证</span> 
                    <span onClick={this.widthdrawEvent.bind(this, 2)}>提现</span>
                </p>
            </div>*/}
            <ul className={style.search}>
                <li>
                    提现日期
                    <RangePicker
                        value={search.dateStart === null || search.dateStart === '' ? null : [moment(search.dateStart, 'YYYY-MM-DD'), moment(search.dateEnd, 'YYYY-MM-DD')]}
                        className={`${style['ml10']} w2600`}
                        onChange={(e, value) => this.changeFormEvent(e, 'date', value)}
                    />
                </li>
                <li className="ml30">
                    提现状态
                    <Select className={`${style['ml10']} w120`} value={search.orderStatus} onChange={e => this.changeFormEvent(e, 'orderStatus')}>
                        <Option value={null}>请选择</Option>
                        {
                          window.common.cashstatusData.map((item, index) => (
                            <Option key={index + 1} value={index + 1}>{item}</Option>  
                          ))
                        }
                    </Select>
                </li>
                <li className="ml30">
                    <Button type="primary" onClick={() => this.searchEvent()}>查询</Button>
                    <Button onClick={() => this.clearEvent()} className="ml10">重置</Button>
                </li>
            </ul>
            <Table
                dataSource={widthdrawData}
                columns={columns}
                pagination={pagination}
                //rowSelection={rowSelection}
                rowKey={record => record.id}
                className="tabList"
                size="middle"
                loading={loading}
            />
      </div>

    )
  }
}
export default AuthList