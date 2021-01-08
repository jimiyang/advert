import React, {Component} from 'react';
import {Input} from 'antd';
import style from './component.less';
class RechargeModel extends Component{
  render() {
    return(
      <ul className={style.withDrawForm}>
        <li>
          <label className={style.name}>提现金额</label>
          <Input className={style.ipttxt} placeholder="请输入提现金额" />
        </li>
        <li>
          <label className={style.name}>银行卡号</label>
          <Input className={style.ipttxt} placeholder="请输入银行卡号" />
        </li>
        <li>
          <label className={style.name}>开户行</label>
          <Input className={style.ipttxt} placeholder="请输入开户行" />
        </li>
        <li>
          <label className={style.name}>户主姓名</label>
          <Input className={style.ipttxt} placeholder="请输入户主姓名" />
        </li>
      </ul>
    )
  }
}
export default RechargeModel;