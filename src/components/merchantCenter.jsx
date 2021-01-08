import React, {Component} from 'react'
import {Icon, Input, message} from 'antd'
import style from '@/pages/user/style.less'
import {updateMerchant, getByMerchantCodeInfo} from '@/api/api'
import EventBus from '@/untils/eventbus'
import Link from 'umi/link'
import router from 'umi/router'
const { TextArea } = Input;
class merchantCenter extends Component{
  constructor(props) {
    super(props)
    this.state = {
      form: {},
      params: {},
      minValue: [0, 0],
      inputFocus: ''
    }
  }
  async componentDidMount() {
    await this.setState({form: this.props.merchantInfo}, () => {
     this.getMerchantIno()
    })
  }
  getMerchantIno = () => {
    const merchantCode = JSON.parse(window.localStorage.getItem('login_info')).data.merchantCode
    getByMerchantCodeInfo({merchantCode}).then(rs => {
      this.setState({
        form: rs.data
      })
    })
  }
  changeFormEvent = (e, type) => {
    let {form, minValue} = this.state, value = e.target.value, len = value.length
    form = Object.assign(form, {[type]: value})
    if (type === 'merchantName') {
      minValue[0] = len
    } else {
      minValue[1] = len
    }
    this.setState({form, minValue})
  }
  setEvent = async (type) => {
    this.setState({isActive: type}, () => {
      if (this.input) {
        this.input.focus()
      }
      if (this.input2) {
        this.input2.focus()
      }
    })
  }
  closeEvent = () => {
    this.getMerchantIno()
    this.setState({isActive: null})
  }
  saveMerchantInfoEvent = (type) => {
    let obj = {}, form = this.state.form
    switch(type) {
      case 'userName':
        obj = {userName: form.userName}
      break
      case 'merchantName':
        obj = {merchantName: form.merchantName}
      break
      case 'mainBusiness':
        obj = {mainBusiness: form.mainBusiness}
      break
    }
    updateMerchant(obj).then(rs => {
      if (rs.success) {
        message.success(rs.message)
        if (type === 'userName') {
          EventBus.emit('ChangeUserName', form.userName)
        }
        this.setState({isActive: null})
        /*router.push({
          pathname: '/merchant',
          state: {current: 2}
        })*/
      }
    })
  }
  render() {
    let {
      isActive,
      form,
      minValue
    } = this.state
    //let props = this.contentProps.textAreaRef;//获取dom节点实例
    minValue = [form.merchantName !== undefined ? form.merchantName.length : 0, form.mainBusiness !== undefined ? form.mainBusiness.length : 0]
    return(
      <div className={style['user']}>
        <ul className={style['user-modify']}>
          <li>
            <label>姓名：</label>
            {
              Number(form.merchantType) === 0 ?
              <div>{form.userName}</div> :
              <div className={isActive === 'userName' ? 'hide' : ''}>
                {form.accountHolder}
                <span className="mr10">
                  {form.accountHolder === undefined ? 
                    <em>
                      <i className="red-color">未认证</i>，
                      <Link to={{pathname: '/authentication', state: {merchantType: 1}}}>立即认证</Link>
                    </em> : 
                    null
                  }
                </span>
              </div>
            }
          </li>
          <li>
            <label>商户编号：</label>
            <div>{form.merchantCode}</div>
          </li>
          <li>
            <label>商户名称：</label>
            {
              Number(form.merchantType) === 0 ?
              <div>北京联智天目互动科技有限公司</div> 
              :
              <div className="inlineb" className={isActive === 'merchantName' ? 'hide' : ''}>
                {form.merchantName === undefined || form.merchantName === '' ? '未设置' : form.merchantName}
                <span className="mr10 ml30" onClick={() => this.setEvent('merchantName')}>
                  {form.merchantName === undefined || form.merchantName === '' ? '立即设置' : '修改'}
                </span>
              </div>
            }
            <div className={`inlineb ${isActive === 'merchantName' ? '' : 'hide'}`} >
              <div className={style['ipt']} style={{position: 'relative'}}>
                <Input
                  ref={refs => this.input = refs}
                  autoFocus='autoFocus'
                  placeholder="请填写您的公司/店铺名称"
                  value={form.merchantName}
                  onChange={e => this.changeFormEvent(e, 'merchantName')}
                  maxLength={25}
                />
                <em style={{position: 'absolute', right: '5px', top:'8px', background: '#fff'}}>{minValue[0]}/25</em>
              </div>
              <Icon type="check" className={style['ico']} onClick={() => this.saveMerchantInfoEvent('merchantName')} />
              <Icon type="close" className={style['ico']} onClick={() => this.closeEvent()} />
            </div>
          </li>
          <li>
            <label style={{verticalAlign: 'top'}}>主营业务：</label>
            {
              Number(form.merchantType) === 0 ?
              <div>新媒体平台、流量变现、电子商务</div> 
              :
              <div className="inlineb" className={isActive === 'mainBusiness' ? 'hide' : ''}>
                {form.mainBusiness === undefined || form.mainBusiness === '' ? '未设置' : form.mainBusiness}
                <span
                  className="mr10 ml30" 
                  onClick={() => this.setEvent('mainBusiness')}>
                  {form.mainBusiness === undefined || form.mainBusiness === '' ? '立即设置' : '修改'}
                </span>
              </div>
            }
            <div className={`inlineb ${isActive === 'mainBusiness' ? '' : 'hide'}`} >
              <div className={style['ipt']} style={{position: 'relative'}}>
                <Input 
                  placeholder="请填写主营产品名称，多个名称用逗号分隔"
                  value={form.mainBusiness}
                  ref={refs => this.input2 = refs}
                  autoFocus='autoFocus'
                  onChange={e => this.changeFormEvent(e, 'mainBusiness')}
                  //suffix={`${minValue[1]}/50`}
                  maxLength={50}
                />
                <em style={{position: 'absolute', right: '5px', top:'8px', background: '#fff'}}>{minValue[1]}/50</em>
              </div>
              <Icon type="check" className={style['ico']} onClick={() => this.saveMerchantInfoEvent('mainBusiness')} />
              <Icon type="close" className={style['ico']} onClick={() => this.closeEvent(form.mainBusiness)} />
            </div>
          </li>
        </ul>
      </div>
    )
  }
}
export default merchantCenter