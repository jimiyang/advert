import React, { Component } from 'react'
import { Card, Row, Col, Icon, Tooltip } from 'antd';
import MyActivity from '../advertisers/mypromotion/myactivity'
import style from './style.less'
import { caQuery } from '@/api/api'
class Content extends Component {
  state = {
    mainMsg: '',
    name: '',
  }
  async componentDidMount() {
    const data = JSON.parse(localStorage.getItem('login_info')).data;
    this.setState({
      name: data.userName ? data.userName : data.loginName
    })
    //console.log(data )
    if (Number(data.merchantType) === 1) {
      const res = await caQuery()
      //console.log(res)
      if (res.code === 0) {
        this.setState({
          mainMsg: res.data
        })
      }
    }

  }
  render() {
    let { mainMsg, name } = this.state;
    return (
      <div className={style['main']}>
        <Row >
          <Col className={style.cardStyle}>
            <div className={style['header-massage']}>
              <h1>hi！<span style={{color:'#64d'}}>{name}</span>,祝您开心每一天！</h1>
              <p>推广营销平台 | 自动控制 - 投放精准 - 曝光高效 - 费用透明</p>
            </div>
            <Row gutter={50} >
              <Col span={6} >
                <Card className={style['money']} style={{ background: '#7a5ffa' }}>
                  <p className={style['money-p']}>
                    投放中活动
                    <Tooltip placement="right" title={'包括待审核、投放中、暂停、停止四种状态的活动总个数'}>
                      <Icon type="question-circle" theme="filled" style={{color:'#a2a2a2',marginLeft:5}}/>
                    </Tooltip>
                  </p>
                  <div className={style['moneyFont']}>
                    <span>{`${mainMsg && mainMsg.inExecuteNum ? mainMsg.inExecuteNum : '----'}`}</span>
                    <Icon type="unordered-list" style={{ fontSize: 43 }} />
                  </div>
                </Card>
              </Col>
              <Col span={6} >
                <Card className={style['money']} style={{ background: '#f97e96' }}>
                  <p className={style['money-p']}>账户可用余额</p>
                  <div className={style['moneyFont']}>
                    <span>{`${mainMsg && mainMsg.benefitCa.available_balance ? mainMsg.benefitCa.available_balance : '----'}`}</span>
                    <Icon type="wallet" theme="filled" style={{ fontSize: 43 }} />
                  </div>
                </Card>
              </Col>
              <Col span={6}>
                <Card className={style['money']} style={{ background: '#faa26b' }}>
                  <p className={style['money-p']}>投放中预算</p>
                  <div className={style['moneyFont']}>
                    <span>{`${mainMsg.postTotalAmt ? mainMsg.postTotalAmt : '----'}`}</span>
                    <Icon type="pay-circle" theme="filled" style={{ fontSize: 43 }} />
                  </div>
                </Card>
              </Col>
              <Col span={6}>
                <Card className={style['money']} style={{ background: '#9dabba' }}>
                  <p className={style['money-p']}>冻结金额</p>
                  <div className={style['moneyFont']}>
                    <span>{`${mainMsg && mainMsg.settleCa.available_balance ? mainMsg.settleCa.available_balance : '----'}`}</span>
                    <Icon type="money-collect" theme="filled" style={{ fontSize: 43 }} />
                  </div>
                </Card>
              </Col>
            </Row>
          </Col>
        </Row>
        {/* isDisplay 是否显示搜索条件 */}
        <MyActivity isDisplay={true} pageSize={4} />
      </div >
    )
  }
}
export default Content