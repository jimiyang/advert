import React, { Component } from 'react';
import { Button} from 'antd';
import {
  missionDetail
} from '@/api/api';//接口地址
import style from './style.less'
import ActivityMissionList from '../component/list' //订单列表
import ActivityInfo from '../component/detail' //活动详情
class ActivityDetail extends Component {
  constructor(props) {
    super(props);
    this.state = {
      campaignId: null,
      id: null,
      activeIndex: 0,
      form: {
        campaignName: '', //活动名称
        postStatus: '', //活动状态
        auditRemark: '', //活动审核意见
        dateStart: '', //活动开始时间
        dateEnd: '', //活动结束时间
        targetGender: '', //男女比例
        targetMediaCategory: '', //行业标签
        targetArea: '', //地域
        adType: '', //活动形式
        unitPrice: '', //活动阅读单价
        billingType: 0 //计费方式
      },
      provinceData: [],
      mediaData: []
    };
  }
  async componentDidMount() {
    const state = this.props.location.state;
    if (!state) return false;
    await this.setState({
      id: state.id,
      campaignId: state.campaignId
    });
    await this.missionDetails(); //广告主--订单明细详情
  }

  missionDetails = () => {
    let { campaignId, form } = this.state;
    const params = {
      campaignId
    };
    missionDetail(params).then(rs => {
      if (rs.success) {
        form = Object.assign(form, rs.data);
        this.setState({ form });
      }
    });
  }
  changeTypeEvent = (index) => {
    this.setState({
      activeIndex: index
    });
  }
  render() {
    const {
      form,
      activeIndex,
      id,
      campaignId
    } = this.state;
    return (
      <div className={style.mypromotion} >
        <div className={style.createBlocks}>
          <ul className={style.activityCount}>
            <li>
              <h1>接单媒体数</h1>
              <p className={style['numTxt']}>{form.missionCount !== undefined ? form.missionCount : 0}</p>
            </li>
            <li>
              <h1>粉丝覆盖数</h1>
              <p className={style['numTxt']}>{form.appTotalUserCntSum !== undefined ? form.appTotalUserCntSum : 0}</p>
            </li>
            <li>
              <h1>未完成订单预计支出(元)</h1>
              <p className={style['numTxt']}>{form.estimateMin !== undefined ? form.estimateMin : 0}~{form.estimateMax !== undefined ? form.estimateMax : 0}</p>
            </li>
            <li>
              <h1>实际阅读量</h1>
              <p className={style['numTxt']}>{form.missionRealReadCntSum !== undefined ? form.missionRealReadCntSum : 0}</p>
            </li>
            <li>
              <h1>实际支出(元)</h1>
              <p className={style['numTxt']}>{form.adRealCostSum !== undefined ? form.adRealCostSum : 0}</p>
            </li>
            <li>
              <h1>支出占比</h1>
              <p className={style['numTxt']}>{form.costRatio !== undefined ? form.costRatio : 0}</p>
            </li>
          </ul>
          <div className={style.activityNav}>
            <a className={activeIndex === 0 ? `${style.active}` : ''} onClick={() => this.changeTypeEvent(0)}>接单媒体</a>
            <a className={activeIndex === 1 ? `${style.active}` : ''} onClick={() => this.changeTypeEvent(1)}>活动详情</a>
          </div>
          <ActivityMissionList activeIndex={activeIndex} campaignId={campaignId}/>
          <ActivityInfo activeIndex={activeIndex} id={id}/>
          <div className="g-tc">
            <Button onClick={() => {window.history.go(-1)}}>返回</Button>
          </div>
        </div>
      </div>
    );
  }
}
export default ActivityDetail;