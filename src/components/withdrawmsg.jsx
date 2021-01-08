import React, {Component} from 'react'
import { Modal, Button} from 'antd'
import style from './style.less'
class WithDrawNotice extends Component{
  constructor(props){
    super(props)
    this.state = {
      isVisible: true
    }
  }
  closeEvent = () => {
    this.setState({isVisible: false})
  }
  render() {
    return(
      <div>
        <Modal
          visible={this.state.isVisible}
          footer={null}
          closable={false}
          width={650}
        >
          <div className={style['withdraw']}>
            <h1>提现通知</h1>
            <h2>亲爱的用户，为响应银行要求，平台对提现规则进行更新，具体内容如下：</h2>
            <div className={style['withdraw-content']}>
              <p>1.  平台账户余额大于100元可申请提现。</p>
              <p>2.  当日17点前申请提现，平台将于当日提交至银行；当日17点后申请，平台于次日17点前提交至银行。</p>
              <p>3.  具体到账时间为1～3个工作日（一般四大行是及时处理，其他银行根据自身规则可能延后）。</p>
            </div>
            <div className={style['withdraw-col']}>特此进行公示通知，感谢对本平台的支持！</div>
            <div className={style['withdraw-btn']}>
                <Button type="primary" onClick={() => {this.closeEvent()}}>我已阅读</Button>
            </div>
          </div>
        </Modal>
      </div>
    )
  }
}
export default WithDrawNotice