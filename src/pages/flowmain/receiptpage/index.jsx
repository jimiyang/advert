import { appList, flowCampaignList } from '@/api/api';
import style from './index.less';
import React, { Component } from 'react';
import urlFn from '@/untils/method';
import { Form, Select, Checkbox, Button, Pagination, Icon, Spin, Empty, message, Avatar, List, Modal } from 'antd';
import ReceiptCard from '../component/Receiptcard';
function info() {
    Modal.info({
      title: '数据更新中……',
      content: (
        <div>
          <p>后台正在更新该公众号的粉丝数据和预估阅读数据，请稍后再来接单哦！</p>
        </div>
      ),
      onOk() {},
      icon: <Icon type="exclamation-circle" theme="filled" style={{color: '#6644dd'}}/>,
      okText: '我知道了'
    });
  }
const { Option } = Select;
class ReceiptPage extends Component {
    state = {
        appList: [],
        defaultApp: '',
        token: '',
        mayOrder: 0,
        currentPage: 1,
        limit: 10,
        receiptList: [],
        isMask: '',
        totalNum: 0,
        current: 1,
        appMessage: {},
        num: 0,
        syncLoading: false,
        isColon: false,
        verifyTypeInfo: null,
        defaultName: null
    }
    componentDidMount() {
        //遍历路由  获取参数
        let urlObj = urlFn();
        let currentToken = window.localStorage.getItem('token');
        let token = urlObj.token ? urlObj.token : currentToken;
        let { setFieldsValue } = this.props.form;
        appList({ token: token }).then(res => {
            if (res.code === 0) {
                this.setState({
                    token: token,
                    defaultApp: res.data.length ? res.data[0].appId : null,
                    defaultName: res.data.length ? res.data[0].nickName : null,
                    appList: res.data,
                    isMask: res.data.length ? res.data[0].status : '',
                    appMessage: res.data.length ? res.data[0] : [],
                    verifyTypeInfo: res.data.length?res.data[0].verifyTypeInfo:null
                }, () => {
                    setFieldsValue({ appId: this.state.defaultName });
                    if (this.state.defaultApp) {
                        this.getList();
                    } else {
                        this.setState({
                            syncLoading: false
                        });
                    }
                });
            }
        });
    }
    //获取列表
    getList = (page) => {
        let current = 0;
        current = page ? page : 1;
        let obj = {};
        obj.appId = this.state.defaultApp;
        obj.token = this.state.token;
        obj.currentPage = current;
        obj.limit = 10;
        obj.mayOrder = this.state.mayOrder;
        obj.unitPriceSort = this.state.num;
        if (obj.appId === null) {
            message.error('请选择公众号');
            return false;
        }
        this.setState({syncLoading: true});
        flowCampaignList({ ...obj }).then(res => {
            //console.log(res)
            if (res.code === 0) {
                this.setState({
                    receiptList: res.data.items,
                    totalNum: res.data.totalNum,
                    current: current,
                });
            } else if(res.code === 400001){
                    info();
                }
            this.setState({
                syncLoading: false
            });
        });
    }
    // //选择公众号
    // handleChange = (value) => {
    //     this.setState({
    //         defaultName: value,
    //         syncLoading: true,
    //     }, () => {
    //         this.getList();
    //     });
    // }
    //是否显示只有可接单活动
    onChange = (e) => {
        this.setState({
            mayOrder: e.target.checked ? 1 : 0,
            syncLoading: true
        }, () => {
            this.getList();
        });
    }
    //表单数据
    handleSubmit = e => {
        e.preventDefault();
        this.props.form.validateFields((err, values) => {
            if (!err) {
                let obj = {};
                for (let i in values) {
                    if (values[i]) {
                        obj[i] = values[i];
                    }
                }
                obj.mayOrder = this.state.mayOrder;
                obj.appId = this.state.defaultApp;
                flowCampaignList({ ...obj, token: this.state.token, currentPage: 1, limit: 10 }).then(res => {
                    if (res.code === 0) {
                        this.setState({
                            receiptList: res.data.items,
                            totalNum: res.data.totalNum,
                            current: 1
                        });
                    }
                });
            }
        });
    };
    render() {
        const { getFieldDecorator } = this.props.form;
        const {
            appList,
            receiptList,
            isMask,
            totalNum,
            current,
            defaultApp,
            appMessage,
            num,
            syncLoading,
            isColon,
            verifyTypeInfo
        } = this.state;
        return (
            <div className={style.wrapp}>
                <header className="header-style">可接订单</header>
                <p className="tip-circle"><Icon type="info-circle" className="ico" theme="filled" />认证号请务必在“粉丝汇”发文，未认证号在微信公众平台发文后请务必提交微信文章链接，否则本平台有权不予结算。</p>
                <p className="tip-circle"><Icon type="info-circle" className="ico" theme="filled" />仅在广告主要求的推广日期内可以接单，且接单账号与广告主的推广要求不匹配时无法接单。</p>
                <div className={`${style.header} mt30`}>
                    <Form layout='inline' onSubmit={this.handleSubmit}>
                        <Form.Item label="公众号" colon={isColon}>
                            {getFieldDecorator('appId')(<Select showSearch style={{ width: 200, height: 30 }} placeholder='暂无公众号'>
                                {
                                    appList.length ? appList.map((item, index) => {
                                        return <Option
                                            onClick={() => {
                                                this.setState({
                                                    isMask: item.status,
                                                    appMessage: item,
                                                    verifyTypeInfo: item.verifyTypeInfo,
                                                    defaultApp: item.appId
                                                }, ()=>{
                                                    this.getList();
                                                });
                                            }}
                                            value={item.nickName}
                                            key={index}>
                                            <div className={style["d-select"]}>
                                                <Avatar
                                                    className={style["d-avatar"]}
                                                    size="small"
                                                    src={item.headImg}
                                                />
                                                <span>{item.nickName}</span>
                                            </div>
                                        </Option>;
                                    }) : ''
                                }
                            </Select>)}
                            {
                                defaultApp ?
                                    <span style={{ color: 'red', marginLeft: 15, marginRight: 15, display: 'inline-block' }}>{isMask === 2 ? '' : '公众号待审核，不可接单'}</span>
                                    : ''
                            }
                        </Form.Item>
                        <Form.Item label="排序" colon={isColon}>
                            <div className="inlineb">
                                {getFieldDecorator('unitPrice')(
                                    <Button className={style.btn}
                                        onClick={() => {
                                            let i = num;
                                            i++;
                                            if (i > 2) {
                                                i = 0;
                                            }
                                            this.setState({
                                                num: i
                                            }, () => {
                                                this.getList();
                                            });
                                        }}
                                    >
                                        单价
                                        <span>
                                            <span style={{ display: 'flex', flexDirection: 'column', marginLeft: 7 }}>
                                                <Icon type="caret-up" style={num === 1 ? { color: "rgb(102, 68, 221)" } : {}} />
                                                <Icon type="caret-down" style={num === 2 ? { color: "rgb(102, 68, 221)" } : {}} />
                                            </span>
                                        </span>

                                    </Button>
                                )}
                            </div>
                        </Form.Item>
                        <Form.Item>
                            <Checkbox onClick={this.onChange}>只有可接单活动</Checkbox>
                        </Form.Item>
                    </Form>
                </div>
                <div className={style.main}>
                    <Spin spinning={syncLoading}>
                        {
                            receiptList.length ?
                                <List
                                    grid={{
                                        gutter: 16,
                                        xs: 1, //<576px 展示的列数
                                        sm: 2, //≥576px 展示的列数
                                        md: 2, //≥768px 展示的列数
                                        lg: 3, //≥992px 展示的列数
                                        xl: 3, //≥1200px 展示的列数
                                        xxl: 4 //≥1600px 展示的列数
                                    }}
                                    className="list-tab"
                                    dataSource={receiptList}
                                    renderItem={(item, index) => (
                                        <List.Item>
                                            <ReceiptCard isMask={isMask} key={index} item={item} appMsg={appMessage} verifyTypeInfo={verifyTypeInfo} refresh={() => {
                                                this.setState({
                                                    syncLoading: true
                                                }, ()=>{
                                                    this.getList();
                                                });
                                            }}></ReceiptCard>
                                        </List.Item>
                                    )}
                                />
                                :
                                <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} />
                        }
                    </Spin>
                </div>
                {
                    receiptList.length ? <Pagination simple current={current} total={totalNum} onChange={(page) => {
                        this.getList(page);
                    }}></Pagination> : ''
                }
            </div >
        );
    }
}
export default Form.create({ name: 'ReceiptPage' })(ReceiptPage);