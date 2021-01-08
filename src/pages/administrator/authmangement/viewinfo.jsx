import React, { Component } from 'react'
import { Button, Input, Form, Modal, Icon, message} from 'antd'
import style from '../style.less'
import { getMerchanAuthDetail, merchantAuthAudit } from '@/api/api'
import ViewPic from '@/pages/components/viewpic'
const { TextArea } = Input
class ViewInfo extends Component {
    constructor(props) {
        super(props)
        this.state = {
            form: {},
            isVisible: false,
            confirmText: '确认要通过这条认证信息吗？'
        }
    }
    async componentDidMount() {
        await this.setState({
            id: this.props.location.state.id,
            type: this.props.location.state.type
        })
        this.initForm()
    }
    initForm = async () => {
        let form = this.state.form
        const rs = await getMerchanAuthDetail({ id: this.state.id })
        if (rs.success) {
            form = Object.assign(form, rs.data)
            this.setState({ form })
        }
    }
    onSubmitEvent = (e, status) => {
        e.preventDefault();
        this.props.form.validateFields((err, values) => {
            if (!err) {
                let text = status === 3 ? '确认要驳回这条认证信息吗？' : '确认要通过这条认证信息吗？'
                this.setState({
                    isVisible: true,
                    confirmText: text,
                    status,
                    values
                })
            }
        })
    }
    onEvent = () => {
        const { id, status, values } = this.state
        merchantAuthAudit({ id, status, ...values }).then(rs => {
            if (rs.success) {
                message.success(rs.message)
                window.history.go(-1)
            }
            this.setState({ isVisible: false })
        })
    }
    cancelEvent = () => {
        this.setState({ isVisible: false })
    }
    //预览图片并且可以下载
    viewPicEvent = (url) => {
        this.setState({
          isImgVisible: true,
          imgUrl: url
        })
    }
    closeEvent = () => {
        this.setState({
            isImgVisible: false
        })
    }
    render() {
        const {
            form,
            isVisible,
            confirmText,
            type,
            isImgVisible,
            imgUrl
        } = this.state
        const { getFieldDecorator } = this.props.form
        //console.log(this.props)
        return (
            <div className={style['authenticationForm']}>
                <header className="header-style">认证详情</header>
                <Modal
                    visible={isVisible}
                    width={300}
                    closable={false}
                    onOk={() => this.onEvent()}
                    onCancel={() => this.cancelEvent()}
                >
                    <div className={style['tips']}>
                        <Icon type="exclamation-circle" className={style['icon']} />{confirmText}
                    </div>
                </Modal>
                <h1 className={`${style['title']} mt30`}>个人资料</h1>
                <ViewPic isImgVisible={isImgVisible} imgUrl={imgUrl} key={Date.now()} closeEvent={this.closeEvent}/>
                <Form onSubmit={this.onSubmitEvent}>
                    <ul className={style['form']}>
                        <li>
                            <label>姓名：</label>
                            <div className={style['content']}>{form.certificateName}</div>
                        </li>
                        <li>
                            <label>提现人身份证号码：</label>
                            <div className={style['content']}>
                                {form.certificateNumber !== undefined ? form.certificateNumber : '--'}
                            </div>
                        </li>
                        <li>
                            <label>证件有效期：</label>
                            <div className={style['content']}>
                                {window.common.getDate(form.certificateStartDate)}-{window.common.getDate(form.certificateEndDate)}
                            </div>
                        </li>
                        <li className={style['h150']}>
                            <label>身份证正面照：</label>
                            <div className={style['content']}>
                                <div className="uploader cur" onClick={() => this.viewPicEvent(form.certificatePhotoFrontUrl)}>
                                    <img src={form.certificatePhotoFrontUrl} alt="avatar" style={{ width: '100%', maxHeight: '100%' }} />
                                    <div className={style['mask']}></div>
                                </div>
                            </div>
                        </li>
                        <li className={style['h150']}>
                            <label>身份证背面照：</label>
                            <div className={style['content']}>
                                <div className="uploader cur" onClick={() => this.viewPicEvent(form.certificatePhotoBackUrl)}>
                                    <img src={form.certificatePhotoBackUrl} alt="avatar" style={{ width: '100%', maxHeight: '100%' }} />
                                    <div className={style['mask']}></div>
                                </div>
                            </div>
                        </li>
                        
                    </ul>
                    <h1 className={style['title']}>提现账号</h1>
                    <ul className={style['form']}>
                        <li>
                            <label>开户姓名：</label>
                            <div className={style['content']}>
                                {form.accountHolder !== undefined ? form.accountHolder : '--'}
                            </div>
                        </li>
                        <li>
                            <label>选择银行：</label>
                            <div className={style['content']}>{form.bankName}</div>
                        </li>
                        <li>
                            <label>开户行所在城市：</label>
                            <div className={style['content']}>{form.subbranchProvinceName}</div>
                            <div className={style['content']}>{form.subbranchCityName}</div>
                        </li>
                        <li>
                            <label>开户银行支行名称：</label>
                            <div className={style['content']}>{form.subbranchName}</div>
                        </li>
                        <li>
                            <label>银行卡号：</label>
                            <div className={style['content']}>
                                {form.bankCardNumber !== undefined ? form.bankCardNumber : '--'}
                            </div>
                        </li>
                        <li>
                            <label>银行预留手机号：</label>
                            <div className={style['content']}>
                                <div className={`${style['ipttxt']} ${style['mt5']}`}>{form.phoneNumber}</div>
                            </div>
                        </li>
                        <li className={style['h150']}>
                            <label style={{ verticalAlign: 'top' }}>审核备注：</label>
                            <div className={`${style['content']} tmid`}>
                                {type === 1 ?
                                    <Form.Item>
                                        {getFieldDecorator(
                                            'auditInfo',
                                            {
                                                rules: [
                                                    { required: true, message: '请输入备注信息' },
                                                ]
                                            }
                                        )(<TextArea row={4} className={style['textarea']} />)
                                        }
                                    </Form.Item> :
                                    <div className={style['content']}>{form.auditInfo} </div>
                                }
                            </div>
                        </li>
                    </ul>
                    <div className="g-tc">
                        <Form.Item>
                            {
                                type === 1 ?
                                    <div className="inlineb">
                                        <Button type="primary" onClick={(e) => this.onSubmitEvent(e, 3)}>审核驳回</Button>
                                        <Button type="primary" onClick={(e) => this.onSubmitEvent(e, 2)} className="ml10">审核通过</Button>
                                    </div> : null
                            }
                            <Button className="ml10" onClick={() => { window.history.go(-1) }}>返回</Button>
                        </Form.Item>
                    </div>
                </Form>
            </div>
        )
    }
}
export default Form.create()(ViewInfo)