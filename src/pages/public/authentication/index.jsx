import React, { Component} from 'react';
import {Form, Input, Button, DatePicker, Select, Upload, message} from 'antd';
import {withRouter} from 'react-router-dom';
import {authSave, upload, msgVerify, authGetDetail, checkPhone, adAuthSave, adAuthDetail} from '@/api/api';
import moment from 'moment';
import bankData from '@/untils/bankName' //银行数据
import Area from '@/untils/area'
import style from './index.less'
import WithDrawTip from '../../components/tips'
const { RangePicker } = DatePicker
const { Option } = Select
class ReceiptList extends Component {
  state = {
    form: {},
    number: 60,
    timer: null,
    sendTxt: '发送验证码',
    sendStatus: false,
    cityData: [],
    visible: false,
    isdisabled: false
  }
  async componentDidMount() {
    let state = this.props.location.state
    const type = state === undefined ? null : state.type
    //商户类型
    const merchantType = this.props.location.state.merchantType
    //遍历路由  获取参数
    const token = this.props.location.state.token
    
    const phone = this.props.location.state.phone
    await this.setState({phone, type, token, merchantType})
    await this.initForm()
  }
  initForm = async () => {
    const {token, merchantType} = this.state
    const Fun = Number(merchantType) === 1 ? adAuthDetail() : authGetDetail({token}) //1是广告主认证，2是流量主认证
    //const rs = await authGetDetail({token: this.state.token})
    await Fun.then(rs => {
      if (rs.success && rs.data) {
        let form = Object.assign(this.state.form, rs.data)
        const cityData = this.getChildCity(form.subbranchProvinceCode)
        //1是广告主，2是流量主
        const phone = merchantType === 1 ? form.phoneNumber : this.props.location.state.phone
        this.setState({phone, isEdit: true, form, cityData, front: form.certificatePhotoFrontUrl, behind: form.certificatePhotoBackUrl})
        this.props.form.setFieldsValue({
          certificatePhotoFrontUrl: form.certificatePhotoFrontUrl,
          certificatePhotoBackUrl: form.certificatePhotoBackUrl
        })
      }
    })
  }
  getChildCity(pid, pname) {
    let arr = [], obj = {}
    if (pname === '香港') {
      arr.push({id: 810000, name: "香港",p_id: 1})
    } else if (pname === '澳门') {
      arr.push({id: 820000, name: "澳门",p_id: 1})
    } else {
      Area.map(item => {
        item.children.map(child => {
          if(Number(pid) === child.p_id) {
            arr.push(child)
          }
        })
      })
    }
    return arr
  }
  changeFormEvent = (e, type, value) => {
    let form = this.state.form, obj = {}
    switch(type) {
      case 'date':
        obj = {certificateStartDate: value[0], certificateEndDate: value[1]}
      break
      case 'bankCode':
        obj = {[type]: e, bankName: value.props.children}
      break
      case 'subbranchProvinceCode':
        //console.log(e, value.key)
        //obj = {[type]: e, subbranchProvinceName: value.props.children}
        obj = {[type]: value.key, subbranchProvinceName: e}
        this.props.form.setFieldsValue({subbranchCityCode: null});
        this.setState({
          cityData: this.getChildCity(value.key, e)
        })
      break
      case 'subbranchCityCode':
        obj = {[type]: e, subbranchCityName: value.props.children}
      break
      default:
        obj = {[type]: e.target.value}
      break
    }
    form = Object.assign(form, obj)
    this.setState({form})
  }
  beforeUpload = (type, img) => {
    //console.log(img)
    const reader = new FileReader();
    let form = this.state.form
    reader.readAsDataURL(img);
    const flag = window.common.beforeUpload(img, message); //上传之前判断图片大小
    if (flag) {
      reader.onload = e => {
        //img.thumbUrl = e.target.result;
        upload({img}).then(rs => {
          if (rs.success) {
            if (type === 'front') {
              this.props.form.setFieldsValue({certificatePhotoFrontUrl: rs.data.url})
            } else {
              this.props.form.setFieldsValue({certificatePhotoBackUrl: rs.data.url})
            }
            this.setState({
              form,
              [type]: e.target.result
            })
          }
        })
      }
    }
  }
  //清除setInterval
  error = () => {
    let {timer} = this.state
    const that = this
    window.clearInterval(timer);
    that.setState({
      sendTxt: '发送验证码',
      sendStatus: false,
      number: 60
    });
  }
  //发送验证码
  sendCodeEvent = () => {
    const that = this;
    let {number, phone} = this.state;
    this.props.form.validateFields(['phoneNumber'], (errors, values) => {
      if(!errors) {
        this.setState({
          sendTxt: `59秒后重发`,
          sendStatus: true
        })
        this.state.timer = window.setInterval(()=> {
          if(number <= 1){
            this.error();
          }else{
            number--;
            that.setState({
              sendTxt: `${number}秒后重发`,
              sendStatus: true
            });
          }
        }, 1000);
        msgVerify({phone: values.phoneNumber}).then(rs => {
          if (!rs.success) {
          } else {
            message.success('验证码发送成功')
          }
        });
      }
    })
  }
  handleSubmit = (e) => {
    const that = this
    e.preventDefault();
    this.props.form.validateFields((err, values) => {
      if (!err) {
        delete values.subbranchProvinceCode
        this.setState({isdisabled: true})
        let {form, phone, token, merchantType} = this.state
        //phoneNumber: phone, 
        form = Object.assign(form, values, {token})
        delete form.date
        //console.log(form)
        const Fun = Number(merchantType) === 1 ? adAuthSave : authSave //1是广告主认证，2是流量主认证
        Fun(form).then(rs => {
          if (rs.success) {
            this.setState({visible: true})
            const timer = setTimeout(function() {
              that.setState({visible: false});
              window.history.go(-1)
              clearTimeout(timer);
            }, 3000);
          }
          this.setState({
            isdisabled: false
          })
          this.error()
        })
      }
    })
  }
  gobackEvent = () => {
    //console.log(this.state.isEdit)
    this.state.isEdit ? window.history.go(-2) : window.history.go(-1)
  }
  checkPhoneEvent = () => {
    const {phone, form} = this.state
    this.props.form.validateFields(['smsCode'], (errors, values) => {
      if (!errors) {
        checkPhone({phone, msgAuthCode: form.smsCode}).then(rs => {
          if (rs.success) {
            message.success(rs.message)
          }
        })
      }
    })
  }
  componentWillUnmount() {
    this.error()
  }
  render() {
    const {
      form,
      front,
      behind,
      phone,
      sendStatus,
      sendTxt,
      cityData,
      visible,
      isdisabled,
      type
    } = this.state
    const {getFieldDecorator} = this.props.form
    return (
      <div className={style['authenticationForm']}>
        <WithDrawTip visible={visible} />
        {
          type !== 'edit' ?
            <div className={style['notice']}>
              <p>提现汇款，需要登记下列信息，下面所登记的信息只会用于提现过程中银行机构做身份验证</p>
              <p>请配合如实填写</p>
            </div> : null
        }
        <Form layout='inline' onSubmit={this.handleSubmit}>
          {
            type !== 'edit' ? null :
            <ul className={`${style['form']} mt30`}>
              <li className={style['h90']}>
                <label className={style['name']}><i className="red">*</i>联系手机：</label>
                <div className={style['content']}>
                  <Form.Item>
                    {getFieldDecorator(
                    'phoneNumber',
                      {
                        initialValue: form.phoneNumber,
                        rules: [
                          {required: true, message: '请输入手机号'},
                          {pattern: /^1(3|4|5|6|7|8|9)\d{9}$/, message: '请输入正确的手机号'}
                        ]
                      }    
                      )(<Input className={style['ipttxt']} placeholder="请输入手机验证码" onChange={e => this.changeFormEvent(e, 'phoneNumber')} />)
                    }
                  </Form.Item>
                </div>
                <div className={`${style['uploadBtn']} ${style['ml20']}`} style={{marginTop: '5px'}}>
                  <Button
                    onClick={() => this.sendCodeEvent()}
                    disabled={sendStatus === true ? true : false}
                  >{sendTxt}</Button>
                </div>
                <div className="mt10" style={{paddingLeft: '150px'}}>手机号必须与提现账户的银行预留手机号保持一致，否则会导致提现失败。</div>
              </li>
              <li>
                <label className={style['name']}><i className="red">*</i>验证码：</label>
                <div className={style['content']}>
                  <Form.Item>
                    {getFieldDecorator(
                    'smsCode',
                      {
                        rules: [
                          {required: true, message: '请输入手机验证码'}
                        ]
                      }    
                      )(<Input className={style['ipttxt']} placeholder="请输入手机验证码" onChange={e => this.changeFormEvent(e, 'smsCode')} />)
                    }
                  </Form.Item>
                  {/*<Button onClick={this.checkPhoneEvent.bind(this)}>验证</Button>*/}
                </div>
              </li>
            </ul>
          }
          <h1 className={style['title']}>个人资料</h1>
          <ul className={style['form']}>
            <li>
              <label className={style['name']}><i className="red">*</i>姓名：</label>
              <div className={style['content']}>
                <Form.Item>
                  {getFieldDecorator(
                   'certificateName',
                    {
                      initialValue: form.certificateName,
                      rules: [
                        {required: true, message: '请输入个人姓名'}
                      ]
                    }    
                    )(<Input className={style['ipttxt']} placeholder="请输入个人姓名" onChange={e => this.changeFormEvent(e, 'certificateName')} />)
                  }
                </Form.Item>
              </div>
            </li>
            <li>
              <label className={style['name']}><i className="red">*</i>提现人身份证号码：</label>
              <div className={style['content']}>
                <Form.Item>
                  {getFieldDecorator(
                   'certificateNumber',
                    {
                      initialValue: form.certificateNumber,
                      rules: [
                        {required: true, message: '请输入提现人身份证号码'},
                        {pattern: /^[1-9][0-9]{5}(19|20)[0-9]{2}((01|03|05|07|08|10|12)(0[1-9]|[1-2][0-9]|31)|(04|06|09|11)(0[1-9]|[1-2][0-9]|30)|02(0[1-9]|[1-2][0-9]))[0-9]{3}([0-9]|x|X)$/, message: '身份证号不正确'},
                      ]
                    }    
                    )(<Input className={style['ipttxt']} placeholder="请输入提现人身份证号码" onChange={e => this.changeFormEvent(e, 'certificateNumber')} />)
                  }
                </Form.Item>
              </div>
            </li>
            <li>
              <label className={style['name']}><i className="red">*</i>证件有效期：</label>
              <div className={style['content']}>
                <Form.Item>
                  {getFieldDecorator(
                   'date',
                    {
                      initialValue: [
                        form.certificateStartDate === undefined ? null : moment(window.common.getDate(form.certificateStartDate), 'YYYY-MM-DD'), 
                        form.certificateEndDate === undefined ? null : moment(window.common.getDate(form.certificateEndDate), 'YYYY-MM-DD')
                      ],
                      rules: [
                        {required: true, message: '请选择身份证号有效期'}
                      ]
                    }    
                    )(
                      <RangePicker
                        format="YYYY-MM-DD"
                        className={style.date}
                        style={{width: '260px'}}
                        ranges={{
                          Today: [moment(), moment()]
                        }}
                        onChange={(e, value) => this.changeFormEvent(e, 'date', value)}
                      /> 
                    )
                  }
                </Form.Item>
              </div>
            </li>
            <li className={style['h150']}>
              <label className={style['name']}><i className="red">*</i>身份证正面照：</label>
              <div className={style['content']}>
                <Form.Item>
                  {getFieldDecorator(
                   'certificatePhotoFrontUrl',
                    {
                      rules: [
                        {required: true, message: '请上传身份证正面照'}
                      ]
                    }    
                    )(<div className="uploader">
                        {
                          front ? 
                            <img src={front} alt="avatar" style={{width: '100%', maxHeight: '100%'}} />
                            :
                            <div className="default">
                              <img src={require('@/assets/images/auto-pic.png')}/>
                              <div className="ant-upload-text">建议上传文件2M以内</div>
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
                  beforeUpload={(img) => this.beforeUpload('front',img)}
                  showUploadList={false}
                >
                  <Button>上传身份证正面照</Button>
                </Upload>
                <p className="mt15">提现人姓名和身份证必须与提现银行卡号的开户名为同一人</p>
                <p>格式要求：原件照片</p>
                <p>支持：jpg、jpeg、bmp、gif、png格式照片，大小出超过2M</p>
              </div>
            </li>
            <li className={style['h150']}>
              <label className={style['name']}><i className="red">*</i>身份证背面照：</label>
              <div className={style['content']}>
                <Form.Item>
                  {getFieldDecorator(
                   'certificatePhotoBackUrl',
                    {
                      rules: [
                        {required: true, message: '请上传身份证背面照'}
                      ]
                    }
                    )(<div className="uploader">
                      {
                        behind ? 
                          <img src={behind} alt="avatar" style={{width: '100%', maxHeight: '100%'}} />
                           :
                          <div className="default">
                            <img src={require('@/assets/images/auto-pic.png')}/>
                            <div className="ant-upload-text">建议上传文件2M以内</div>
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
                  beforeUpload={(img) => this.beforeUpload('behind',img)}
                  showUploadList={false}
                >
                  <Button>上传身份证背面照</Button>
                </Upload>
                <p className="mt15">提现人姓名和身份证必须与提现银行卡号的开户名为同一人</p>
                <p>格式要求：原件照片</p>
                <p>支持：jpg、jpeg、bmp、gif、png格式照片，大小出超过2M</p>
              </div>
            </li>
            {
              type !== 'edit' ?
                <li className={style['h90']}>
                  <label className={style['name']}><i className="red">*</i>联系手机：</label>
                  <div className={style['content']} style={{height: '60px'}}>
                    <Form.Item>
                      {getFieldDecorator(
                      'phoneNumber',
                        {
                          rules: [
                            {required: true, message: '请输入手机号'},
                            {pattern: /^1(3|4|5|6|7|8|9)\d{9}$/, message: '请输入正确的手机号'}
                          ]
                        }    
                        )(<Input className={style['ipttxt']} placeholder="请输入手机验证码" onChange={e => this.changeFormEvent(e, 'phoneNumber')} />)
                      }
                    </Form.Item>
                  </div>
                  <div className={`${style['uploadBtn']} ${style['ml20']}`} style={{marginTop: '5px'}}>
                    <Button
                      onClick={() => this.sendCodeEvent()}
                      disabled={sendStatus === true ? true : false}
                    >{sendTxt}</Button>
                  </div>
                  <div style={{paddingLeft: '150px'}}>
                    手机号必须与提现账户的银行预留手机号保持一致，否则会导致提现失败。
                  </div>
                </li> : null
            }
            {
              type !== 'edit' ? 
                <li>
                  <label className={style['name']}><i className="red">*</i>验证码：</label>
                  <div className={style['content']}>
                    <Form.Item>
                      {getFieldDecorator(
                      'smsCode',
                        {
                          rules: [
                            {required: true, message: '请输入手机验证码'}
                          ]
                        }    
                        )(<Input className={style['ipttxt']} placeholder="请输入手机验证码" onChange={e => this.changeFormEvent(e, 'smsCode')} />)
                      }
                    </Form.Item>
                  </div>
                </li> : null
            }
          </ul>
          <h1 className={style['title']}>提现账号</h1>
          <ul className={style['form']}>
            <li>
              <label className={style['name']}><i className="red">*</i>开户姓名：</label>
              <div className={style['content']}>
                <Form.Item>
                  {getFieldDecorator(
                   'accountHolder',
                    {
                      initialValue: form.accountHolder,
                      rules: [
                        {required: true, message: '请输入个人姓名'}
                      ]
                    }    
                    )(<Input className={style['ipttxt']} placeholder="请输入个人姓名" onChange={e => this.changeFormEvent(e, 'accountHolder')} />)
                  }
                </Form.Item>
              </div>
            </li>
            <li>
              <label className={style['name']}><i className="red">*</i>选择银行：</label>
              <div className={style['content']}>
                <Form.Item>
                  {getFieldDecorator(
                   'bankCode',
                    {
                      initialValue: form.bankCode,
                      rules: [
                        {required: true, message: '请选择银行'}
                      ]
                    }    
                    )(
                      <Select
                        showSearch
                        className={style['select']}
                        onChange={(e, value) => this.changeFormEvent(e, 'bankCode', value)}
                        optionFilterProp="children"
                        filterOption={(input, option) =>
                          option.props.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
                        }
                      >
                        <Option value={null}>请选择银行</Option>
                        {
                          bankData.map((item, index) => (
                            <Option key={index} value={String(item.code)}>{item.name}</Option>
                          ))
                        }
                      </Select>       
                    )
                  }
                </Form.Item>
              </div>
            </li>
            <li>
              <label className={style['name']}><i className="red">*</i>开户行所在城市：</label>
              <div className={style['content']}>
                <Form.Item>
                  {getFieldDecorator(
                   'subbranchProvinceCode',
                    {
                      initialValue: form.subbranchProvinceName, // || null
                      rules: [
                        {required: true, message: '请选择省'}
                      ]
                    }    
                    )(
                      <Select
                        className={`${style['select2']}`}
                        onChange={(e, value) => this.changeFormEvent(e, 'subbranchProvinceCode', value)}
                        //value={form.subbranchProvinceName}
                      >
                        <Option value={null}>请选择省</Option>
                        {
                          Area.map((item, index) => (
                            <Option key={item.id} value={String(item.name)}>{item.name}</Option>
                          ))
                        }
                      </Select>
                    )
                  }
                </Form.Item>
              </div>
              <div className={style['content']}>
                <Form.Item>
                  {getFieldDecorator(
                   'subbranchCityCode',
                    {
                      initialValue: form.subbranchCityCode || null,
                      rules: [
                        {required: true, message: '请选择市'}
                      ]
                    }    
                    )(
                      <Select className={style['select3']} onChange={(e, value) => this.changeFormEvent(e, 'subbranchCityCode', value)}>
                        <Option value={null}>请选择市</Option>
                        {
                          cityData.map((item, index) => (
                            <Option key={index} value={String(item.id)}>{item.name}</Option>
                          ))
                        }
                      </Select>       
                    )
                  }
                </Form.Item>
              </div>
            </li>
            <li>
              <label className={style['name']}><i className="red">*</i>开户银行支行名称：</label>
              <div className={style['content']}>
                <Form.Item>
                  {getFieldDecorator(
                   'subbranchName',
                    {
                      initialValue: form.subbranchName,
                      rules: [
                        {required: true, message: '请输入开户银行支行名称'}
                      ]
                    }    
                    )(<Input className={style['ipttxt']} placeholder="请输入开户银行支行名称" onChange={e => this.changeFormEvent(e, 'subbranchName')} />)
                  }
                </Form.Item>
              </div>
            </li>
            <li>
              <label className={style['name']}><i className="red">*</i>银行卡号：</label>
              <div className={style['content']}>
                <Form.Item>
                  {getFieldDecorator(
                   'bankCardNumber',
                    {
                      initialValue: form.bankCardNumber,
                      rules: [
                        {required: true, message: '请输入银行卡号'},
                        {pattern: /^\d{14}|\d{16}|\d{19}$/, message: '请输入正确的银行卡号'}
                      ]
                    }    
                    )(<Input maxLength={19} className={style['ipttxt']} placeholder="请输入银行卡号" onChange={e => this.changeFormEvent(e, 'bankCardNumber')} />)
                  }
                </Form.Item>
              </div>
            </li>
          </ul>
          <div  className={style['pl150']} >
            <Form.Item>
              <Button type="primary" htmlType="submit" disabled={isdisabled === true ? true : false}>提交认证</Button>
              <Button className="ml30" onClick={() => this.gobackEvent()}>返回</Button>
            </Form.Item>
          </div>
        </Form>
      </div>
    )
  }
}
export default Form.create({ name: 'authentication' })(withRouter(ReceiptList)); 