import React, { Component, Fragment } from 'react';
import { withRouter } from 'react-router-dom';
import { Icon, Avatar, Button, Modal, Row, Col, Select, message, DatePicker } from 'antd';
import style from './style.less';
import moment from 'moment';
import QRCode from 'qrcode.react'
import { newAdd, newestimate } from '@/api/api'
import urlFn from '@/untils/method'
const { Option } = Select;
const type = ['', '头条', '二条', '三条', '四条', '五条', '六条', '七条', '八条'];
class ReceiptCard extends Component {
    state = {
        visible: false,
        appId: '',
        newMsgPosition: '',
        articlePosition: '',
        isSuccess: false,
        planPostArticleTime:null,
        timeValue:null
    };
    componentDidMount() {
        //遍历路由  获取参数
        let urlObj = urlFn();
        let currentToken = window.localStorage.getItem('token');
        let token = urlObj.token ? urlObj.token : currentToken;
        this.setState({
            token
        })
    }
    //接单失败弹框
    receiptFail=(msg)=>{
        Modal.error({
            title: '接单失败',
            content: msg,
            okText:'我知道了',
            icon:<Icon type="close-circle" theme="filled" />
        });
    }
    //接单跳出弹框
    jumpPage = () => {
        this.setState({
            visible: true,
            articlePosition: 1,
            planPostArticleTime:null,
            timeValue:null
        });
    }
    //确认接单接单
    sendReceipt = () => {
        let obj = {};
        obj.planPostArticleTime =this.state.planPostArticleTime? this.state.planPostArticleTime:null;
        obj.appId = this.props.appMsg.appId;
        obj.campaignId = this.props.item.campaignId;
        obj.articlePosition = this.props.item.appArticlePosition === 9 ? this.state.articlePosition : this.props.item.appArticlePosition;
        if(!this.state.planPostArticleTime){
            message.info('请选择计划投放日期')
            return;
        }
        if ((this.props.item.appArticlePosition === 9)) {
            if (this.state.articlePosition) {
                newAdd({ ...obj, token: this.state.token }).then(res => {
                    if (res.code === 0) {
                        this.setState({
                            visible: false,
                            isSuccess: true,
                        }, () => {
                            this.props.refresh()
                        });
                    }else{
                        this.receiptFail(res.message)
                    }
                });
                this.setState({
                    visible: false,
                    articlePosition: 1
                });
            } else {
                message.info('请选择位置');
            }
            
        } else {
            newAdd({ ...obj, token: this.state.token }).then(res => {
                if (res.code === 0) {
                    this.setState({
                        visible: false,
                        isSuccess: true,
                        articlePosition: 1
                    }, () => {
                        this.props.refresh()
                    });
                }else{
                    this.receiptFail(res.message)
                }
            });
        }
    }
    //弹框
    handleOk = async e => {
        await this.sendReceipt()
    };

    handleCancel = e => {
        this.setState({
            visible: false,
            isSuccess: false,
            articlePosition: 1,
        });
    };
    //选择位置
    onSelect = (value) => {
        this.setState({
            articlePosition: value
        });
        newestimate({ appId: this.props.appMsg.appId, campaignId: this.props.item.campaignId, articlePosition: value, token: this.state.token }).then(res => {
            this.setState({
                newMsgPosition: res.data
            });
        });
    }
    //投放日期
    disabledEndDate = (current) => {
        const { item } = this.props
        const dateEnd = window.common.getDate(item.dateEnd)
        //return current < moment().subtract(1, "days") || current > moment(new Date(dateEnd)).add(0, 'day')
        return current < moment().subtract(1, "day") || current > moment(new Date(dateEnd)).add(1, 'day')
    }
    //投放日期
    onChangeTime=(date, dateString)=> {
        this.setState({
            planPostArticleTime:dateString,
            timeValue:date
        })
    }
    render() {
        const { newMsgPosition, articlePosition, dateStart,token,timeValue } = this.state;
        const { item, isMask, appMsg, verifyTypeInfo } = this.props;
        const obj = newMsgPosition ? newMsgPosition : item;
        return (
            <Fragment>
                <div className={style.card}>
                    <div className={style['card-wrap']}>
                        <img
                            alt="暂无封面"
                            src={item.impImage}
                            width='100%'
                            height="160px"
                        />
                        <div className={style['card-p']}>{item.extrendJson}</div>
                        <p className={style['card-tag']}>{type[item.appArticlePosition] || '不限'}</p>
                    </div>
                    <div className={style['card-msg']}>
                        <p style={{ color: 'rgb(248, 76, 39)' }}><b style={{ fontSize: 18 }}>{item.unitPrice}</b>/元/阅读</p>
                        <p><span className={style['card-span']}>预估收益：</span><span style={{ color: 'rgb(248, 76, 39)' }}>{item.estimateMin}~{item.estimateMax}</span>元</p>
                        <p><span className={style['card-span']}>推广日期：</span><span style={{ color: 'black' }}  >{moment(item.dateStart).format('l')}~{moment(item.dateEnd).format('l')}</span></p>
                        <p>
                            <span className={style['card-span']}>推广时间：</span>
                            <span style={{ color: 'black' }} >{item.hourStartStr ? `${item.hourStartStr}~${item.hourEndStr}` : '不限'}{`（保留${item.retentionTime}h）`}</span>
                        </p>
                    </div>
                    <div className={style['center']}>
                        <Button
                            onClick={() => this.jumpPage()}
                            type='primary'
                            disabled={(isMask !== 2) ? true : item.mayOrder ? false : true}
                            style={{ width: '99.5%' }}
                        >我要接单</Button>
                    </div>
                </div>
                {/* 接单确认弹框 */}
                <Modal
                    title="接单确认"
                    visible={this.state.visible}
                    onCancel={this.handleCancel}
                    footer={
                        <div style={{ textAlign: 'right' }}>
                            <Button type="primary" onClick={this.handleOk}>确认接单</Button><Button onClick={this.handleCancel}>取消</Button>
                        </div>
                    }
                >
                    <p className={style['modal-warning']}><Icon type="info-circle" theme="filled" style={{ color: '#6644dd', marginRight: 10 }} />请按接单要求、在「粉丝汇」平台群发接单文案，以免影响收益结算</p>
                    <Row type="flex">
                        <Col span={12}>
                            <div className={style['receiptMsg']}>
                                <label>接单公众号：</label>
                                <div style={{
                                    whiteSpace: 'nowrap',
                                    overflow: 'hidden',
                                    textOverflow: 'ellipsis'
                                }}>
                                    <Avatar src={appMsg.headImg} style={{ backgroundColor: this.state.color, verticalAlign: 'middle' }} size="small"></Avatar>
                                    <span
                                        style={{ marginLeft: 10, verticalAlign: 'middle' }}
                                    >
                                        {appMsg.nickName}
                                    </span>
                                </div>
                            </div>
                            <div className={style['receiptMsg']}>
                                <label>文章位置：</label>
                                <div>
                                    {
                                        item.appArticlePosition === 9 ?
                                            <Select placeholder='请选择位置' style={{ width: 120, }} value={articlePosition} onChange={this.onSelect} size='small'>
                                                {
                                                    type.map((item, index) => {
                                                        return index > 0 ? <Option value={index} key={index}>{item}</Option> : '';
                                                    })
                                                }
                                            </Select>
                                            : type[item.appArticlePosition]
                                    }
                                </div>
                            </div>
                            <div className={style['receiptMsg']}>
                                <label>计划投放日期：</label>
                                <div>
                                    <DatePicker
                                        className="w120"
                                        format="YYYY-MM-DD"
                                        disabledDate={this.disabledEndDate}
                                        onChange={this.onChangeTime}
                                        value={timeValue}
                                    />
                                </div>
                            </div>
                            <div className={style['receiptMsg']}>
                                <label>备注：</label>
                                <div>
                                    {obj.adRemarks ? item.adRemarks : '无'}
                                </div>
                            </div>
                            <div className={style['receiptMsg']}>
                                <label>预计为您赚取：</label>
                                <div>
                                    <span>{`${obj.estimateMin}元 ~ ${obj.estimateMax}元   ${obj.remarks ? obj.remarks : ''}`}</span>
                                </div>
                            </div>
                        </Col>
                        <Col span={12}>
                            <div className={style['QRCode']}>
                                <p>微信扫码手机预览文案</p>
                                <QRCode
                                    value={`${window.common.articleUrl}/fshstatic/view.html?id=${item.postContent}`}
                                    size={135}
                                    fgColor='#000000'
                                >
                                </QRCode>
                            </div>
                        </Col>
                    </Row>
                </Modal>
                {/* 接单完毕弹框 */}
                <Modal
                    title={<div><Icon style={{ color: 'rgb(82, 196, 27)', marginRight: 15 }} type="check-circle" theme="filled" />接单成功</div>}
                    visible={this.state.isSuccess}
                    onCancel={this.handleCancel}
                    footer={
                        <div style={{ textAlign: 'right' }}>
                            {
                                verifyTypeInfo * 1 === -1 ? <Button type="primary" onClick={() => {
                                    this.props.history.push({ pathname: "/step", state: { appMsg,token } })
                                }}>查看推文流程</Button>
                                    :
                                <>
                                    <Button type="primary" onClick={this.handleCancel}>继续接单</Button>
                                    <Button onClick={() => {
                                        if (window.location.href.includes('test')) {
                                            window.top.location.href = "http://test.fensihui.com/fshstatic/localArticleList"
                                        } else {
                                            window.top.location.href = "http://houtai.fensihui.com/fshstatic/localArticleList"
                                        }
                                    }}>前往文库</Button>
                                </>
                            }

                        </div>
                    }
                >
                    {
                        verifyTypeInfo * 1 === -1 ?
                        <p><em className="red-color">未认证号</em>订单已生成 ，请按设定的日期前往微信公众平台完成推文，并在“接单记录”列表中提交微信文章链接，超过计划投放日期<em className="red-color">36小时</em>仍未推文订单会自动取消；超过广告主要求的推广日期推文亦将无效。</p>
                        :
                        <p>订单已生成，文案已保存在「<em className="red-color">本地文库</em>」，请按设定的日期在「粉丝汇」平台完成推文。超过计划投放日期<em className="red-color">36小时</em>仍未推文订单会自动取消；超过广告主要求的推广日期推文亦将无效。</p>
                    }
                </Modal>
            </Fragment>
        );
    }
}

export default withRouter(ReceiptCard);