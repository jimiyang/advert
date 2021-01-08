import React, {Component} from 'react'
import {Button, message, Input, Popconfirm, Form, Upload, Modal, Icon, Popover, Radio, Tooltip} from 'antd'
import style from '../style.less'
import ViewPic from '@/pages/components/viewpic'
import {
  withdrawDetail,
  withdrawAudit,
  withdrawPay,
  upload,
  onlinePay
} from '@/api/api'
import { isNull } from 'util'
const {TextArea} = Input
class CashDetail extends Component{
  constructor(props) {
    super(props)
    this.state = {
      loginName: null,
      orderNo: null,
      orderStatus: null,
      auditRemark: null,
      thirdOrderNo: null,
      type: null,
      isHide: false,
      form: {},
      payForm: {},
      isVisible: false,
      payStatus: null,
      current: false,
      isDisabled: false,
      payType: 1,
      isPopoverVisible: false
    }
  }
  async componentDidMount() {
    const loginInfo = JSON.parse(window.localStorage.getItem('login_info'))
    const state = this.props.location.state
    await this.setState({loginName: loginInfo.data.loginName, type: state.type, orderNo: state.orderNo})
    this.initForm()
  }
  initForm = () => {
    const {loginName, orderNo, form} = this.state
    const params = {
      loginName,
      orderNo
    }
    withdrawDetail(params).then(rs => {
      const f = Object.assign(form, rs.data, rs.account)
      this.setState({form: f})
    })
  }
  changeEvent = (e, type) => {
    const reg = /[^\d]/g
    let flag = false
    if (reg.test(e.target.value)) {
      flag = true
    }
    this.setState({[type]: e.target.value, isHide: flag})
  }
  auditEvent = (status) => {
    const {form, loginName, auditRemark, thirdOrderNo, type}  = this.state
    let obj = {}
    let methods
    if (type === 'pay') {
      if (isNull(thirdOrderNo)) {
        message.error('请输入汇款单号')
        return false
      }
      obj = {thirdOrderNo}
      methods = withdrawPay
    } else {
      if (isNull(auditRemark)) {
        message.error('请填写审核备注信息')
        return false
      }
      obj = {auditRemark}
      methods = withdrawAudit
    }
    const params = {
      orderNo: form.orderNo,
      loginName: loginName,
      orderStatus: status,
      ...obj
    }
    methods(params).then(rs => {
      if (rs.success) {
        message.success(rs.message)
        window.history.go(-1)
      } else {
        message.error(rs.message)
      }
    })
  }
  beforeUpload = (img) => {
    //console.log(img)
    const reader = new FileReader();
    let payForm = this.state.payForm
    reader.readAsDataURL(img);
    const flag = window.common.beforeUpload(img, message, 1); //上传之前判断图片大小
    if (flag) {
      reader.onload = e => {
        upload({img}).then(rs => {
          if (rs.success) {
            payForm = Object.assign(payForm, {thirdRemitReceiptUrl: rs.data.url})
            this.props.form.setFieldsValue({thirdRemitReceiptUrl: rs.data.url})
            this.setState({payForm})
          }
        })
      }
    }
  }
  submitEvent = (e, status) => {
    e.preventDefault();
    const type = this.props.location.state.type
    this.props.form.validateFields((err, values) => {
      if (!err) {
        this.setState({isDisabled: Number(status)})
        const orderNo = this.props.location.state.orderNo
        //审核
        if (type === 'audit') {
          const params = {
            orderNo,
            orderStatus: status,
            ...values
          }
          //console.log(params) 
          //patType为1，线上付款
          if (this.state.payType === 1) {
            onlinePay({orderNo}).then(rs => {
              if(rs.success) {
                message.success(rs.message)
              }
            })
          }
          //return false
          withdrawAudit(params).then(rs => {
            if (rs.success) {
              message.success(rs.message)
              window.history.go(-1)
              this.setState({isDisabled: false})
            }
          })
        } else {
          const payForm = Object.assign(this.state.payForm, values)
          this.setState({isVisible: true, payStatus: status, payForm})
        }
      }
    })
  }
  //付款成功或失败
  payEvent = () => {
    const that = this
    const {payForm, form} = this.state
    const params = {
      ...payForm,
      orderNo: form.orderNo
    }
    withdrawPay(params).then(rs => {
      if (rs.success) {
        this.setState({current: true})
        const timer = setTimeout(function() {
          that.setState({isVisible: false});
          window.history.go(-1)
          clearTimeout(timer);
        }, 3000);
      }
    })
  }
  cancelEvent = () => {
    this.setState({
      isVisible: false,
      isDisabled: false
    })
  }
  //预览图片并且可以下载
  viewPicEvent = (url) => {
    this.setState({
      isImgVisible: true,
      imgUrl: url
    })
  }
  setPayTypeEvent = (e) => {
    this.setState({payType: e.target.value})
  }
  popoverEvent = () => {
    this.setState({
      isPopoverVisible: true
    })
  }
  cancelEvent = () => {
    this.setState({
      isPopoverVisible: false
    })
  }
  render() {
    const {
      form,
      type,
      isVisible,
      payForm,
      current,
      payStatus,
      isDisabled,
      thirdOrderNo,
      isImgVisible,
      imgUrl,
      payType,
      isPopoverVisible
    } = this.state
    const {getFieldDecorator} = this.props.form
    const content = (
      <div className={style['pay-type']}>
        <h1>请选择付款方式：</h1>
        <Radio.Group onChange={(e) => this.setPayTypeEvent(e)} value={payType}>
          <Radio value={1}>自动操作
            <Tooltip title="选择自动操作并通过审核后，提现申请将自动上传至客商平台，自动完成后续打款流程，打款成功后将自动回传打款信息。">
              <Icon type="question-circle" className="m5" />
            </Tooltip>
          </Radio>
          <Radio value={2}>手动操作
            <Tooltip title="选择手动操作并通过审核后，需前往客商平台，人工添加提现账户信息，并在客商平台完成打款后，在“提现管理”列表手动提交打款信息。">
              <Icon type="question-circle" className="m5" />
            </Tooltip>
          </Radio>
        </Radio.Group>
        <div className={style['btn']}>
          <Button size="small" onClick={() => this.cancelEvent()}>取消</Button>
          <Button type="primary" size="small" className="ml10" onClick={(e)=> this.submitEvent(e, 3)}>确定</Button>
        </div>
      </div>
    )
    return(
      <div className={style.administrator}>
        <header className="header-style">提现详情</header>
        <div className={`${style.cash} ${style['cash-detail']}`}>
          <ViewPic isImgVisible={isImgVisible} imgUrl={imgUrl} key={Date.now()} />
          <Form onSubmit={this.submitEvent}>
            <ul className={style.detail}>
              <li><label>提现状态：</label><div>{window.common.cashstatusData[Number(form.orderStatus) - 1]}</div></li>
              <li><label>提现单号：</label><div>{form.orderNo}</div></li>
              <li><label>商户编号：</label><div>{form.merchantCode}</div></li>
              <li><label>提现批次号：</label><div>{form.acceptBatchNo === undefined ? '--' : form.acceptBatchNo}</div></li>
              <li><label>提现订单号：</label><div>{form.outTradeNo === undefined ? '--' : form.outTradeNo}</div></li>
              <li><label>汇款单号：</label><div>{form.thirdOrderNo}</div></li>
              <li><label>申请时间：</label><div>{form.applyTime}</div></li>
              <li><label>申请提现金额：</label><div>{form.orderAmt}元</div></li>
              <li><label>手续费：</label><div>{form.feeAmt}元</div></li>
              <li><label>到账金额：</label><div>{form.realWithdrawAmt}元</div></li>
              <li>
                <label>审核备注：</label>
                <div>{
                    type === 'audit' ? 
                      <Form.Item>
                        {getFieldDecorator(
                          'auditRemark',
                          {
                            rules: [
                              {required: true, message: '请输入审核备注'}
                            ]
                          }    
                          )(<TextArea rows={4} onChange={e => this.changeEvent(e, 'auditRemark')} style={{width: '300px'}} />)
                        }
                      </Form.Item>
                    :form.auditRemark
                  }
                </div>
              </li>
              {
                type === 'pay' ?
                <li  style={{marginBottom: 0}}>
                  <label>汇款单号：</label>
                    <div>
                      <Form.Item>
                        {getFieldDecorator(
                          'thirdOrderNo',
                            {
                              rules: [
                                {required: true, message: '请输入汇款单号'}
                              ]
                            }    
                            )(<Input className={style.ipttxt} onChange={e => this.changeEvent(e, 'thirdOrderNo')}/>)
                        }
                      </Form.Item> 
                    </div>
                </li> : null
              }
              <li className={style['h150']} style={{marginBottom: 0, marginTop: 0}}>
                <label>汇款凭证：</label>
                {
                  type === 'pay' ?
                    <div style={{width: '80%'}}>
                      <div className={`${style['content']} inlineb`}>
                        <Form.Item>
                          {getFieldDecorator(
                          'thirdRemitReceiptUrl',
                            {
                              rules: [
                                {required: true, message: '请上传汇款凭证'}
                              ]
                            }    
                            )(<div className="uploader inlineb">
                                {
                                  payForm.thirdRemitReceiptUrl ? 
                                    <img src={payForm.thirdRemitReceiptUrl} style={{width: '220px', height: '125px'}} />
                                    :
                                    <div className="default">
                                      <img src={require('@/assets/images/auto-pic.png')}/>
                                    <div className="ant-upload-text">建议上传文件1M以内</div>
                                  </div>     
                              }
                            </div>
                          )
                        }
                      </Form.Item>
                    </div>
                    <div className={style['uploadBtn']}>
                      <Upload
                        name="file"
                        beforeUpload={(e) => this.beforeUpload(e)}
                        showUploadList={false}
                      >
                        <Button>上传汇款凭证</Button>
                      </Upload>
                      <p className="mt15">付款凭证截图&照片</p>
                      <p>格式要求：原件照片</p>
                      <p>支持：jpg、jpeg、bmp、gif、png格式照片，大小是1M以内</p>
                    </div>
                  </div> : 
                  <div className="cur" onClick={() => this.viewPicEvent(form.thirdRemitReceiptUrl)}>
                    {
                      form.thirdRemitReceiptUrl === undefined ? '--' : 
                      <img src={form.thirdRemitReceiptUrl} style={{width: '220px', height: '125px'}} />
                    }
                  </div>
                }
              </li> 
              <li >
                <label>汇款备注：</label>
                {
                type === 'pay' ? 
                  <div>
                    <Form.Item>
                      {getFieldDecorator(
                      'thirdRemitRemarks',
                        {
                          rules: [
                            {required: true, message: '请填写汇款备注'}
                          ]
                        }    
                        )(<TextArea rows={4} onChange={e => this.changeEvent(e, 'thirdRemitRemarks')} style={{width: '300px'}} />)
                      } 
                    </Form.Item> 
                  </div> : 
                  <div>
                    {
                      form.thirdRemitRemarks === undefined ? '--' :  form.thirdRemitRemarks
                    }
                  </div>
                }
              </li> 
            </ul>
          </Form>
        </div>
        <div className={`${style.cash} ${style['cash-detail']}`} style={{paddingLeft: '10%'}}>
          <ul className={style.detail}>
            <li><label>开户姓名：</label><div>{form.bankCardOwnerName}</div></li>
            <li><label>开户银行：</label><div>{form.bankName}</div></li>
            <li><label>开户银行所在城市：</label><div>{form.subbranchProvinceName}{form.subbranchCityName}</div></li>
            <li><label>开户银行名称：</label><div>{form.subbranchName}</div></li>
            <li><label>银行卡号：</label><div>{form.bankCardNo}</div></li>
            <li><label>银行预留手机号：</label><div>{form.bankOwnerPhone}</div></li>
            <li><label>账户类型：</label><div>{form.accountType === 1 ? '个人' : '企业'}</div></li>
          </ul>    
        </div>
        <div className="g-tc" style={{paddingBottom: '10px'}}>
          {
            type === 'audit' ?
            <div className="inlineb">
              <Popconfirm
                title="是否要通过审核?"
                onConfirm={() => this.auditEvent(3)}
                okText="确定"
                cancelText="取消"
              >
                <Button type="primary" htmlType="submit" >审核通过</Button>
              </Popconfirm>
              <Popconfirm
                title="是否要驳回审核?"
                onConfirm={() => this.auditEvent(2)}
                okText="确定"
                cancelText="取消"
              >
                <Button className="ml10 mr10">审核驳回</Button>
              </Popconfirm>
            </div>
            :  null
          }
          {
            type === 'pay' ? 
            <div className="inlineb">
              <Modal
                visible={isVisible}
                width={350}
                closable={false}
                footer={
                  !current ? 
                    <div>
                    <Button onClick={() => this.cancelEvent()}>取消</Button>
                    <Button type="primary" className="ml30" onClick={() => this.payEvent()}>确定</Button>
                  </div> : null
                }
              >
                {
                  !current ?
                  <div className={style['tips']}>
                    <h1 className={style['warn']}><Icon type="exclamation-circle" className={style['icon']} />
                      {payStatus === 4 ? '确定要修改提现为【付款成功】状态吗？' : '确定要修改提现为【付款失败】状态吗？'}
                    </h1>
                    <p>汇款单号：{thirdOrderNo}</p>
                    <p>资金操作不可逆，请谨慎操作！</p>
                  </div> :
                  <div className={style['tips']}>
                    <h1 ><Icon type="check-circle" className={style['icon']}/>提现状态修改完成。</h1>
                    <p>当前状态:{payStatus === 4 ? '付款成功' : '付款失败'}</p>
                  </div>
                }
              </Modal>
              <Button type="primary" htmlType="submit" disabled={isDisabled === 4 ? true : false} className="mr10" onClick={e => this.submitEvent(e, 4)}>付款成功</Button>
            </div>
            : null
          }
          <div className="inlineb">
            <Button onClick={() => window.history.go(-1)}>返回</Button>
          </div>
        </div>
      </div>
    )
  }
}
export default Form.create()(CashDetail)