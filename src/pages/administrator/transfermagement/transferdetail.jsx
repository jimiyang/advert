import React, {Component} from 'react'
import {Button} from 'antd'
import style from '../style.less'
import {
  tmSettleDetails
} from '@/api/api'
class ViewDetail extends Component {
  constructor(props) {
    super(props)
    this.state = {
      activeIndex: 1,
      form: {
        targetMediaCategory: [], //行业标签
        targetArea: [], //地域
      },
      campaignId: null,
      type: 0,//判断是查看活动页面[0]还是审核接单页面[1]
      missionData: [],
      pagination: {
        size: 'small',
        showSizeChanger: true,
        total: 0,
        currentPage: 1,
        limit: 5,
        pageSize: 5,
        onChange: this.changePage,
        onShowSizeChange: this.onShowSizeChange
      },
      provinceData: [],
      mediaData: [],
      areaVisible: false,
      tagVisible: false,
      selAreaData: [],
      selCategoryData: []
    }
  }
  async componentDidMount() {
    const state = this.props.location.state
    //console.log(state)
    if (!state.missionId) return false
    await this.setState({
      missionId: state.missionId
    })
    this.initForm()
  }
  initForm = () => {
    let {missionId, form} = this.state
    const params = {
      missionId
    }
    tmSettleDetails(params).then(rs => {
      //console.log(rs)
      if (rs.success) {
        form = Object.assign(form, rs.data)
        this.setState({form})
      }
    })
  }
  goBackEvent = () => {
    window.history.go(-1)
  }
  componentWillUnmount () {
    this.setState = (state, callback) => {
      return;
    };
  }
  render() {
    const {
      form
    } = this.state
    return (
      <div className={style.administrator}>
        <header className="header-style">结算详情</header>
        <ul className={style.detaillist}>
          <li><em style={{width: '120px'}}>订单编号：</em><div>{form.missionId}</div></li>
          <li><em style={{width: '120px'}}>广告主商户编号：</em><div>{form.adMerchantCode}</div></li>
          <li><em style={{width: '120px'}}>结算时间：</em><div>{form.settleDate}</div></li>
          <li><em style={{width: '120px'}}>广告主支出(元)：</em>
            <div>{form.adRealCost === undefined ? '--' : form.adRealCost}</div>
          </li>
          <li><em style={{width: '120px'}}>流量主收入(元)：</em>
            <div>{
                form.flowRealIncome === undefined ? '--' : form.flowRealIncome
            }</div>
          </li>
          <li><em style={{width: '120px'}}>平台收益(元)：</em>
          <div> {form.benefit === undefined ? '--' : form.benefit}</div></li>
          <li><em style={{width: '120px'}}>状态：</em>
            <div>{Number(form.missionStatus) === 18 ? '结算失败' : window.common.missionStatus[Number(form.missionStatus) - 10]}</div>
          </li>
          <li><em style={{width: '120px'}}>流量主商户编号：</em><div>{form.flowMerchantCode}</div></li>
          <li><em style={{width: '120px'}}>活动编号：</em><div>{form.campaignId}</div></li>
          <li style={{width: '100%'}}>
            <div>
              <Button
                style={{marginLeft: '120px'}}
                onClick={this.goBackEvent.bind(this)}
              >返回</Button>
            </div>
          </li>
        </ul>
      </div>
    ) 
  }
}
export default ViewDetail