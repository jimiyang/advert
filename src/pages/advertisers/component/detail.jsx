import React, {Component} from 'react'
import style from '../mypromotion/style.less'
import {
  getById,
  getDictByType
} from '@/api/api';//接口地址
class ActivityInfo extends Component {
  constructor(props) {
    super(props)
    this.state = {
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
    }
  }
  async componentDidMount() {
    await this.setState({
      id: this.props.id,
      campaignId: this.props.campaignId
    }, async () => {
      await this.initForm();
      await this.initDictionary('provinceType');
      await this.initDictionary('parent_mediatype');
    });
  }
  initForm = () => {
    let { form } = this.state;
    getById({id: this.props.id}).then(rs => {
      if (rs.success) {
        form = Object.assign(form, rs.data);
        this.setState({ form });
      }
    });
  }
  initDictionary = (type) => {
    const { form } = this.state;
    getDictByType({ type }).then(rs => {
      if (rs.success) {
        let obj = type === 'provinceType' ? { provinceData: rs.data } : { mediaData: rs.data };
        this.setState({ ...obj });
      }
    });
  }
  render() {
    const {
      form,
      provinceData,
      mediaData
    } = this.state
    let data = []
    const getDict = (type) => {
      switch (type) {
        case 'provinceType':
          let arr = [];
          if (form.targetArea !== '' && provinceData !== undefined) {
            JSON.parse(form.targetArea).map(item => {
              provinceData.map(node => {
                if (item === node.value) {
                  arr.push(node.label);
                }
              });
            });
            data = arr
          }
          return arr;
        case 'parent_mediatype':
          let arr1 = [];
          if (form.targetMediaCategory !== '' && mediaData !== undefined) {
            JSON.parse(form.targetMediaCategory).map(item => {
              mediaData.map(node => {
                node.dictChildList.map(child => {
                  if (item === child.value) {
                    arr1.push(child.label)
                  }
                });
              });
            });
            data = arr1
          }
          return arr1;
      }
    };
    return(
      <div className={`${style.createBlocks} ${this.props.activeIndex === 1 ? '' : 'hide'}`}>
        <div className={style.form} style={{ borderTop: 'none' }}>
          <div className={style['detail']}>
            <div className={`${style.items} mb24`}>
              <label className={style.labName} style={{ verticalAlign: 'top', marginTop: '10px' }}>素材：</label>
              <div className={style['mImage']}>
                <a href={`${window.common.articleUrl}/fshstatic/view.html?id=${form.postContent}`} target="_blank">
                  <img src={form.impImage} />
                </a>
              </div>
            </div>
            <div className={`${style.items} mb24`}>
              <label className={style.labName}>活动名称：</label>
              <div>{form.campaignName}</div>
            </div>
            <div className={`mb24 ${style.items}`}>
              <label className={style.labName} style={{ verticalAlign: 'top', marginTop: '10px' }}>定向设定：</label>
              <ul className={style.target}>
                <li>
                  <div className={style.cell}>
                    <em>男女：</em>
                    <div className={style.item}>
                      {Number(form.targetGender) !== 0 ? '设置比例' : '不限制'}
                    </div>
                    {
                      Number(form.targetGender) !== 0 ?
                        <div className={`${style.col}`}>
                          <div className="bold">{Number(form.targetGender) === 1 ? '男粉' : '女粉'}</div>
                          <em>></em>
                          <div className="ml10 bold">{form.targetGenderScale === undefined ? 0 : parseInt(form.targetGenderScale * 100)}%</div>
                        </div> : null
                    }
                  </div>
                </li>
                <li>
                  <div className={style.cell}>
                    <em>地域：</em>
                    <div className={style.item}>
                      {form.targetArea !== '[]' ? '已选推广地域' : '不限制'}
                    </div>
                    <div className={`${style.selDicTarget} bold`}>
                      {getDict('provinceType').join(',')}
                    </div>
                  </div>
                </li>
                <li className={style.last}>
                  <div className={style.cell}>
                    <em>类别：</em>
                    <div className={style.item}>
                      {form.targetMediaCategory !== '[]' ? '已选推广类别' : '不限制'}
                    </div>
                    <div className={`${style.selDicTarget} bold`}>
                      {getDict('parent_mediatype').join(',')}
                    </div>
                  </div>
                </li>
              </ul>
            </div>
            <div className={`mb24 ${style.items}`}>
              <label className={style.labName} style={{ verticalAlign: 'top', marginTop: '10px' }}>公众号设定：</label>
              <ul className={`${style.setWx} clearfix`}>
                {
                  form.missionLimit === 1 ?
                    <li>
                      每个公众号接过我的相似文案后
                    <div className={style.col}>
                        <div>
                          <span className="bold">{form.missionLimitDay}</span>天内不能再接我的广告
                      </div>
                      </div>
                    </li> :
                    <li>每个公众号只可接本文案一次</li>
                }
              </ul>
            </div>
            <div className={`mb24 ${style.items}`}>
              <label className={style.labName} style={{ verticalAlign: 'top', marginTop: '10px' }}>投放时间：</label>
              <ul className={`${style.setDate} clearfix`}>
                <li>
                  <em>推广日期：</em>
                  <div>{window.common.getDate(form.dateStart)}~{window.common.getDate(form.dateEnd)}</div>
                </li>
                <li className={style.last}>
                  <em>发文时段：</em>
                  <div className="inlineb">
                    {form.hourStart === undefined ? '不限' : `${form.hourStart}点~${form.hourEnd}点`}
                  </div>
                </li>
              </ul>
            </div>
            <div className={`mb24 ${style.items}`}>
              <label className={style.labName} style={{ verticalAlign: 'top', marginTop: '10px' }}>预算：</label>
              <div className={style.setPrice}>
                <ul className="clearfix">
                  <li>
                    <em>单价：</em>
                    <div><span className="bold">{form.unitPrice}</span>元 / 阅读</div>
                  </li>
                  <li>
                    <em>总预算：</em>
                    <div><span className="bold">{form.postAmtTotal}</span>元</div>
                  </li>
                </ul>
                <div className="mt30">预算阅读量：<em className="bold">{form.finalAvailableCnt}</em></div>
              </div>
            </div>
            <div className={`mb24 ${style.items}`}>
              <label className={style.labName}>投放位置：</label>
              <div className={style.adLocal}>
                <div>
                  {form.appArticlePosition === 9 ? '不限' : window.common.advertLocal[form.appArticlePosition - 1]}
                </div>
                <em>广告最少保留时间：</em>
                <div>{form.retentionTime}小时</div>
              </div>
            </div>
            {
              form.postAmtTotal < 5000 ? null :
                <div>
                  <div className={`mb24 ${style.items}`}>
                    <label className={style.labName}>公众号类型：</label>
                    <ul className={style.pubType}>
                      <li>
                        {window.common.wxAccountType(form.appType)}
                      </li>
                    </ul>
                  </div>
                  <div className={`mb24 ${style.items}`}>
                    <label className={style.labName} style={{ verticalAlign: 'top'}}>粉丝数：</label>
                    <div className={style.fansNum}>
                      <div>
                        大于{form.fansNumLimit}
                      </div>
                      {form.userAppNumLimit === 0 ? null : <p>只允许同一用户下{form.userAppNumLimit}个公众号接单</p>}
                      {form.appMissionNumLimit === 0 ? null : <p>只允许接过{form.appMissionNumLimit}单以内的公众号接单</p>}
                    </div>
                  </div>
                </div>
            }
            <div className={`mb24 ${style.items}`}>
              <label className={style.labName}>备注要求：</label>
              <div className={style.describe}>{form.remarks}</div>
            </div>
          </div>
        </div>
      </div>
    )
  }
}
export default ActivityInfo