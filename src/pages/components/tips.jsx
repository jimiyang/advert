import React, { Component } from 'react'
import { Modal, Icon, Button} from 'antd'
import style from './component.less'
class WithDrawTip extends Component {
  constructor(props) {
    super(props)
    this.state = {
        visible: false
    }
  }
  componentDidMount() {
    this.setState({
      visible: this.props.visible
    })
  }
  componentWillReceiveProps(nextProps) {
    this.setState({
      visible: nextProps.visible
    })
  }
  handleCancel = () => {
    this.setState({
      visible: false
    })
  }
  render() {
    const {visible} = this.state
    return (
        <Modal
            visible={visible}
            width={350}
            closable={false}
            footer={
                <Button type="primary" onClick={this.handleCancel.bind(this)}>我知道了</Button>
            }
        >
        <div className={style['tips']}>
          <h1><Icon type="check-circle" className={style['ico']} />提交完成</h1>
          <p>请等待平台审核认证资质，审核需要1-3个工作日</p>
          <p>需要加急请联系客服人员</p>
        </div>
      </Modal> 
    )
  }
}
export default WithDrawTip