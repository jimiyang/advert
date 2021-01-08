import React, {Component} from 'react'
import {Tooltip, Tabs, Icon} from 'antd'
import TradeList from './component/tradeList'
import style from '../style.less'
class ggzMerchantTrading extends Component{
  constructor(props) {
    super(props)
    this.state = {
      type: null
    }
  }
  render() {
    const state = this.props.location.state
    const merchantCode = state !== undefined ? state.merchantCode : null
    return(
      <div className={style['administrator']}>
        <header className="header-style">
          流量主收支报表
          <Tooltip placement="topLeft" title="仅统计所有流量主接单后结算成功和提现成功的收支交易记录">
            <Icon type="question-circle" className="f12 cur ml10" />
          </Tooltip>
        </header>
        <TradeList merchantType={2} merchantCode={merchantCode} />
      </div>
    )
  }
}
export default ggzMerchantTrading