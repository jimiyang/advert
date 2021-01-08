import React, {Component} from 'react'
import {Button} from 'antd'
import style from '../style.less'
import {
  missionSettleDetail
} from '@/api/api'
class MerchantDetail extends Component {
  constructor(props) {
    super(props)
    this.state = {
      form: {
        campaign: {
          campaignName: '', //活动名称
          postStatus: '', //活动状态
          auditRemark: '', //活动审核意见
          dateStart: '', //活动开始时间
          dateEnd: '', //活动结束时间
          targetGender: '', //男女比例
          targetMediaCategory: '', //行业标签
          impImage: '', //货送素材
          targetArea: '', //地域
          adType: '', //活动形式
          unitPrice: '', //活动阅读单价
        },
      }
    }
  }
  async componentDidMount() {
    this.setState({
      id: this.props.location.state.id
    }, () => {
      this.initForm()
    })
    
  }
  //初始化数据详情
  initForm = () => {
    const {id} = this.state
    missionSettleDetail({id}).then(rs => {
      if (!rs.data) return false
      const form = Object.assign(this.state.form, rs.data)
      this.setState({form})
    })
  }
  render() {
    const {
      form
    } = this.state
    return (
      <div className={style.administrator}>
        <header className="header-style">商户详情</header>
        <ul className={style.detaillist}>
          <li><em>公众号：</em><div>{form.nickName}</div></li>
          <li><em>公众号状态：</em><div>{Number(form.verifyTypeInfo) === 1 ? '未认证' : '已认证'}</div></li>
          <li><em>授权时间：</em><div>{window.common.getDate(form.authDate, true)}</div></li>
          <li><em>审核状态：</em><div>{window.common.weChatstatus[form.status - 1]}</div></li>
          <li><em>商户编号：</em></li>
        </ul>
        <div className="mt30 g-tc">
           <Button onClick={() => {window.history.go(-1)}} className="ml30">返回</Button>
        </div>
      </div>
    ) 
  }
}
export default MerchantDetail