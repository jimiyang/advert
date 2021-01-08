import React, { Component } from 'react'
import { Steps, Table, Avatar } from 'antd'
import style from './style.less'
import { missionList } from '@/api/api'
import moment from 'moment'
import untils from '@/untils/common'
import WxUrl from '../component/wxurl/wxurl'

const { Step } = Steps
class MateriaStep extends Component {
  constructor(props) {
    super(props)
    this.state = {
      data: null,
      missionId: null,
      isVisible: false,
    }
  }
  componentDidMount() {
    this.loadList.bind(this)()
  }
  loadList() {
    const { token, appMsg } = this.props.location.state
    missionList({ token, appId: appMsg.appId, totalNum: 1 }).then(res => {
      res.data.items.length = 1
      this.setState({
        data: res.data.items
      })
    })
  }
  //提交链接
  submitUrl = (e) => {
    this.setState({
      isVisible: true,
      missionId: e.missionId,
    })
  }
  //隐藏
  hide() {
    this.setState({
      isVisible: false,
    })
  }
  render() {
    const { data, isVisible, missionId } = this.state
    const { token } = this.props.location.state
    const columns = [
      {
        title: '订单号',
        dataIndex: 'missionId',
        align:'center',
        key: "missionId"
      },
      {
        title: '接单公众号',
        key: 'appNickName',
        render: (e) => (
          <div className={style["d-select"]}>
            <Avatar
              className={style["d-avatar"]}
              size="large"
              src={e.headImg}
            />
            <span>{e.appNickName}</span>
          </div>
        )
      },
      {
        title: '创建时间',
        dataIndex: 'createDate',
        key: "createDate",
        align:'center',
        render: (e) => (
          <div >
            <span>{moment(e).format('YYYY-MM-DD ')}</span>
            <p>{moment(e).format('hh:mm:ss')}</p>
          </div>

        )
      },
      {
        title: '文案内容',
        key: 'missionIdMsg',
        render: e => (
          <div className={style['table-text']} onClick={() => {
            window.open(`${untils.articleUrl}/fshstatic/view.html?id=${e.missionArticleId}`)
          }}>
            <div>
              <img src={e.impImage} width='80' height='55' />
              {/* <p>{e.appArticlePosition != 9 ? untils.advertLocal[e.appArticlePosition] : '不限'}</p> */}
            </div>
            <div>
              {/* <b>{e.appNickName}</b> */}
              <p style={{WebkitBoxOrient:'vertical'}}>{e.title}</p>
            </div>
          </div>
        )
      },
      {
        title: '投放位置',
        dataIndex: 'appArticlePosition',
        key: 'appArticlePosition',
        align: 'center',
        render: e => (
          <p>{e != 9 ? untils.advertLocal[e-1] : '不限'}</p>
        )
      },
      {
        title: '计划投放日期',
        key: 'planPostArticleTime',
        align: 'center',
        dataIndex: 'planPostArticleTime'
      },
      {
        title: '预估收入(元)',
        key: 'missionReadCnt',
        align: 'center',
        render: (e) => (
          <div>
            <span>{`${e.estimateMin}~${e.estimateMax}`}</span>
          </div>
        )
      },
      {
        title: '操作',
        align: 'center',
        key: 'option',
        render: (e) => (
          <div>
            <span style={{ color: '#64d', cursor: 'pointer' }} onClick={() => this.submitUrl(e)}>提交链接</span>
          </div>
        )
      }
    ]
    return (
      <div className={style['mstep']} style={{ background: 'rgb(240, 242, 245)', padding: 0 }}>
        <div className={style['mstep-step']} id="selectmateriaitems">
          <Steps current={1} >
            <Step title="接单设置" />
            <Step title={<div>生成多图文素材并同步至微信</div>} />
            <Step title="前往微信公众平台推文" />
            <Step title="结算" />
            <Step title="完成订单" />
          </Steps>
        </div>
        <div className={style['mstep-table']}>
          <h1 style={{fontSize:16}}>订单详情</h1>
          <Table
            columns={columns}
            dataSource={data ? data : []}
            pagination={false}
          />
        </div>
        <div className={style['mstep-process']}>
          <h1 style={{fontSize:16}}>推文流程</h1>
          <dl className={style['list']}>
            <dd>
              <div className={style['title']}>
                <h2>第<i>1</i>步</h2>
                <p>合成器生成多图文素材</p>
              </div>
              <div className={style['content']}>
                <div>在粉丝汇的“<em className="red-color">本地文库</em>”找到已接单广告文案，
                将该广告文案加入<em className="red-color">图文素材合成器</em>，同时可将“本地素材”、“微信素材”中的任意文章加入同一合成器，
                多篇文章合成一条多图文素材。</div>
                <p>广告文案的投放位置须与推广要求一致。</p>
                <p>合成器中的不允许添加接单公众号不同的广告文案。</p>
                <p>合成器合成后的多图文素材会保存至“<em className="red-color">本地素材</em>”</p>
                <img src={require('@/assets/images/demo-1.png')} />
              </div>
            </dd>
            <dd>
              <div className={style['title']}>
                <h2>第<i>2</i>步</h2>
                <p>包含文案的素材同步至接单公众号</p>
              </div>
              <div className={style['content']}>
                <div>在“<em className="red-color">本地素材</em>”中，将刚刚合成的包含广告文案的多图文素材同步至文案的接单公众号。</div>
                <p>切勿修改推广文案的<em className="red-color">标题、内容、封面、原文链接、投放位置</em>等内容，否则可能影响收入结算。</p>
                <img src={require('@/assets/images/demo-2.png')} />
              </div>
            </dd>
            <dd>
              <div className={style['title']}>
                <h2>第<i>3</i>步</h2>
                <p>微信公众平台群发文案素材</p>
              </div>
              <div className={style['content']}>
                <div>
                  请用接单公众号登录微信公众平台，在“素材管理”菜单页找到刚刚同步的素材，并群发该素材。
                  （登录公众号<a href="https://mp.weixin.qq.com/" target="_blank" className="red-color">https://mp.weixin.qq.com/</a>）
                </div>
                <p>我平台已对推广文案启动实时阅读监控，对故意在聊天群和朋友圈进行宣传等阅读刷量行为，平台有权不予认可及结算。</p>
                <p>订单验收前禁止删文，删文的订单将做取消处理。</p>
              </div>
            </dd>
            <dd>
              <div className={style['title']}>
                <h2>第<i>4</i>步</h2>
                <p>提交文案链接完成推广</p>
              </div>
              <div className={style['content']}>
                <div>
                  请在微信公众平台，复制已群发的广告文案的链接
                  （登录公众号<a href="https://mp.weixin.qq.com/" target="_blank" className="red-color">https://mp.weixin.qq.com/</a>)
                </div>
                <p>将已群发的广告文案链接回填在上方列表或“接单记录”列表中，并提交链接。</p>
                <p>请务必及时提交已群发的广告文案的正确链接，否则可能影响后续结算。</p>
                <img src={require('@/assets/images/demo-3.png')} />
              </div>
            </dd>
          </dl>
        </div>
        <WxUrl loadList={this.loadList.bind(this)} isVisible={isVisible} hide={this.hide.bind(this)} key={isVisible + Date.now()} token={token} missionId={missionId} loding={false} />
      </div>
    )
  }
}
export default MateriaStep