import React, {Component} from 'react';
import {Input} from 'antd';
import QRCode from 'qrcode.react'; //二维码
import style from './component.less';
import {
  orderQuery,
  native
} from '@/api/api';
let timer;
let num = 0;
class RechargeModel extends Component{
  constructor(props) {
    super(props);
    this.state = {
      amount: '',
      payUrl: null,
      step: 0,
      tip: '充值完成后会自动关闭此页面',
      failHide: false
    };
  }
  componentDidMount() {
    this.setState({...this.props});
  }
  componentWillReceiveProps(props) {
    this.setState({...props});
    if (props.orderNo !== undefined && props.isVisible === true) {
      const params = {
        orderNo: props.orderNo
      };
      this.orderStatus(params);
    }
    if (props.isVisible === false) {
      clearTimeout(timer);
    }
  }
  orderStatus = (params) => {
    timer = setTimeout(() => {
      num = num + 1;
      orderQuery(params).then(rs => {
        //console.log(rs);
        if(rs.success) {
          if (rs.data.status === 1) {
            this.setState({
              rechargeStep: 2
            });
            this.props.reload();
          } else {
            this.setState({tip: rs.message});
          }
          clearTimeout(timer);
          return false;
        } else {
          if (num === 24) { //判断两分钟二维码失效，5秒一次检测，执行24次后失效
            //console.log(num);
            this.setState({
              failHide: true,
              tip: '二维码已失效，请重新检测！'
            });
            clearTimeout(timer);
          } else {
            this.orderStatus(params);
          }
          //this.setState({tip: rs.message});
        }
      });
    }, 5000);
  }
  changeFormEvent = (type, e) => {
    this.props.changeFormEvent(type, e);
  }
  //重新加测
  reaginLoadEvent = () => {
    const {amount} = this.state;
    const params = {
      amount
    };
    native(params).then(rs => {
      if (rs.success) {
        this.setState({
          ...rs.data,
          rechargeStep: 1,
          failHide: false,
          tip: rs.message
        });
        //console.log(rs)
        this.orderStatus({orderNo: rs.data.orderNo});
      }
    });
  }
  componentWillUnmount() {
    clearTimeout(timer);
  }
  render() {
    const {
      amount,
      rechargeStep,
      payUrl,
      tip,
      failHide
    } = this.state;
    return(
      <ul className={style.rechargeForm}>
        <li className={rechargeStep === 0 ? '' : 'hide'}>
          <label className={style.name}>请输入充值金额：</label>
          <div className={style.content}>
            <Input className={style.ipttxt} onChange={this.changeFormEvent.bind(this, 'amount')} value={amount} />元
          </div>
        </li>
        <li className={`${style.payCode} ${rechargeStep === 1 ? '' : 'hide'}`}>
          <h1 className={style.title}>扫码付款</h1> 
          <p className={style.amount}><em>{amount}</em>元</p>
          <div className={style.bookedCompany}>
            <h2>收款方：北京联智天目互动科技有限公司</h2>
            <div className={style.payCodeImg}>
              {
                payUrl ?     
                <QRCode
                  value={payUrl} //value参数为生成二维码的链接
                  size={135} //二维码的宽高尺寸
                  fgColor="#000000" //二维码的颜色
                /> : null
              }
              <div className={failHide === true ? '' : 'hide'}>
                <div className={style.layer}></div>
                <div className={style.refresh}>
                  <h3>二维码已失效</h3>
                  <a  onClick={this.reaginLoadEvent.bind(this)}>点击刷新</a>
                </div>
              </div>
            </div>
            <p>
              支持：
              <img src={require('@/assets/images/wx-ico.jpg')} />
              <img src={require('@/assets/images/alipay-ico.jpg')} />
            </p>
            <div className={style.tip}>{tip}</div>
          </div>
        </li>
        <li className={`${style.payCode} ${rechargeStep === 2 ? '' : 'hide'}`}>
          <h1 className={style.title}>扫码付款</h1> 
          <p className={style.amount}><em>{amount}</em>元</p>
          <div className={style.success}>
            <img src={require('@/assets/images/success-ico.png')} />
            <p>付款成功</p>
          </div>
        </li>
      </ul>
    );
  }
}
export default RechargeModel;