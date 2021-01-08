import React, {Component} from 'react'
import {Tooltip, Icon} from 'antd'
import TradeList from './component/tradeList'
import style from '../style.less'
class ggzMerchantTrading extends Component{
  constructor(props) {
    super(props)
  }
  render() {
    const state = this.props.location.state
    const merchantCode = state !== undefined ? state.merchantCode : null
    return(
      <div className={style['administrator']}>
        <header className="header-style">
          广告主收支报表
          <Tooltip placement="topLeft" title="仅统计所有广告主充值成功、提现成功以及所发布的活动中结算成功的订单收支记录">
            <Icon type="question-circle" className="f12 cur ml10" />
          </Tooltip>
        </header>
        <TradeList merchantType={1}  merchantCode={merchantCode} />
      </div>
    )
  }
}
export default ggzMerchantTrading