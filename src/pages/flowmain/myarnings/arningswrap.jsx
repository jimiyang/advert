import React, { Component } from 'react';
import {Modal, Button, Icon} from 'antd';
import style from './style.less';
import router from "umi/router";
import ArningsList from './arningslist'
import PutList from './putlist'
import urlFn from '@/untils/method'
import {
    caQuery,
    flowFinanceList,
    getAccountBankInfo
} from '@/api/api';
class ArningsWrap extends Component {
    constructor(props) {
        super(props);
        this.state = {
            earningsData: [],
            availableBalance: '.', //可用余额
            settlecaBalance: '.', //冻结余额
            search: {
                dateStart: null,
                dateEnd: null,
                missionId: null
            },
            pagination: {
                size: 'small',
                showSizeChanger: true,
                total: 0,
                currentPage: 1,
                current: 1,
                limit: 10,
                onChange: this.changePage,
                onShowSizeChange: this.onShowSizeChange
            },
            tableInd: 0
        };
    }
    componentDidMount() {
        //遍历路由  获取参数
        let urlObj = urlFn();
        let currentToken = window.localStorage.getItem('token');
        const login_info = JSON.parse(window.localStorage.getItem('login_info'))
        let token = urlObj.token ? urlObj.token : currentToken;
        let phone = urlObj.phone ? urlObj.phone : login_info.data.phone
        this.setState({
            token,
            phone
        }, async () => {
            //const loginInfo = JSON.parse(window.localStorage.getItem('login_info'));
            //await this.setState({ loginName: loginInfo.data.loginName });
            //this.loadList();
            await this.getCaQuery()
            await this.isCrossAuth()
        })
    }
    isCrossAuth = async() => {
        const rs = await getAccountBankInfo()
        if(rs.success) {
            //console.log(rs.data.isCrossAuth)
            this.setState({isCrossAuthState: rs.data.isCrossAuth})
        }
    }
    //获取可用余额和提现余额
    getCaQuery = () => {
        caQuery({token: this.state.token }).then(rs => {
            if (rs.success && rs.data !== undefined) {
                const settlecaBalance = (Number(rs.data.withdrawCa.available_balance) + Number(rs.data.settleCa.available_balance)).toFixed(2)
                this.setState({ availableBalance: rs.data.benefitCa.available_balance, settlecaBalance});
            }
        });
    }
    loadList = () => {
        const {pagination, search, token } = this.state;
        const params = {
            token,
            currentPage: pagination.currentPage,
            limit: pagination.limit,
            ...search
        };
        flowFinanceList(params).then(rs => {
            const p = Object.assign(pagination, { total: rs.total });
            this.setState({ earningsData: rs.data, pagination: p });
        });
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
    changeFormEvent = (type, e, value) => {
        let search = this.state.search;
        let obj = {};
        switch (type) {
            case 'dateStart':
                obj = { [type]: value };
                break;
            case 'dateEnd':
                obj = { [type]: value };
                break;
            case 'missionId':
                obj = { [type]: e.target.value };
                break;
            default:
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
            search,
            {
                dateStart: null,
                dateEnd: null,
                missionId: null
            }
        );
        const pagination = Object.assign(this.state.pagination, { currentPage: 1, current: 1 });
        this.setState({ pagination, search });
        this.loadList();
    }
    //提现弹窗
    widthdrawEvent = (type) => {
        let {isCrossAuthState, token, phone} = this.state
        switch(type) {
            case 1:
              let url = isCrossAuthState === 4 ? '/authentication' : `/detail`
              router.push({
                pathname: url,
                state: {
                  token,
                  phone
                }
              })
            break
            case 2:
              isCrossAuthState !== 2 ? this.setState({isvisible: true}) :  router.push({
                pathname: '/account',
                state: { token, phone}
              })
            break
        }
    }
    cancelEvent = () => {
      this.setState({isvisible: false})
    }
    tapEvent = (index) => {
        // const url = index === 0 ? '/putlist' : '/arningslist';
        this.setState({
            tableInd: index
        })
    }
    render() {
        const {
            availableBalance,
            settlecaBalance,
            tableInd,
            isvisible
        } = this.state;
        return (
            <div className={style.arnings}>
                <header className="header-style">结算记录</header>
                <Modal
                    width={350}
                    closable={false}
                    visible={isvisible}
                    onCancel={this.cancelEvent.bind(this)}
                    footer={
                        <Button type="primary" onClick={this.cancelEvent.bind(this)}>我知道了</Button>
                    }
                >
                    <div className={style['tips']}>
                        <h1 className={style['error']}><Icon type="close-circle" className={style['ico']} />无法申请提现</h1>
                        <p>为确保您的账户安全，请先进行实名认证</p>
                    </div>
                </Modal>
                <div className={style.accountAmount}>
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
                </div>
                <ul className={style.accountType}>
                    <li className={tableInd === 0 ? style.active : null} onClick={this.tapEvent.bind(this, 0)}><a >提现记录</a></li>
                    <li className={tableInd === 1 ? style.active : null} onClick={this.tapEvent.bind(this, 1)}><a >结算记录</a></li>
                </ul>
                {
                    this.state.token?
                    tableInd?<ArningsList token={this.state.token} />:< PutList  token={this.state.token}/>
                    :''

                }
            </div>
        );
    }
}
export default ArningsWrap;