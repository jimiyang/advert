import React, { Component } from 'react'
import { Form, Input, Modal, Icon, Button, message } from 'antd'
import style from './style.less'
import { fillOutArticleUrl } from '@/api/api'
class WxUrl extends Component {
  constructor(props) {
    super(props)
    this.state = {
      isVisible: false,
      url: null,
      loading: false
    }
  }
  componentDidMount() {
    this.setState({
      isVisible: this.props.isVisible
    })
    this.props.form.setFieldsValue({ url: null })
  }
  componentWillReceiveProps(nprops) {
    this.setState({
      isVisible: nprops.isVisible
    })
  }
  submitEvent = (e) => {
    e.preventDefault();
    this.props.form.validateFields((err, values) => {
      if (!err) {
        this.setState({
          loading: true
        })
        const { missionId, token } = this.props
        fillOutArticleUrl({ ...values, token, missionId }).then(res => {
          if (res.code == 0) {
            message.success(res.message)
            //刷新接单记录
            this.setState({
              visible: false
            })
            this.props.loadList()
            this.props.hide()
          }
          this.setState({
            loading: false,
          })
        })
      }
    })
  }
  cancelEvent = () => {
    this.setState({ isVisible: false })
  }
  render() {
    const {
      isVisible,
      url,
      loading
    } = this.state
    const { missionId, token } = this.props
    const { getFieldDecorator } = this.props.form;
    return (
      <div className={style['url']}>
        <Modal
          title="提交链接"
          visible={isVisible}
          width={500}
          onCancel={() => this.cancelEvent()}
          footer={
            <div>
              <Button onClick={() => this.cancelEvent()}>取消</Button><Button type='primary' onClick={this.submitEvent} loading={loading}>提交链接</Button>
            </div>
          }
        >
          <div className={style['url-tips']}>
            <Icon type="info-circle" theme="filled" className={style['ico']} />
            <p>请前往微信公众平台的首页“已群发消息”列表，复制已群发的广告文案的链接</p>
            <p>登录公众号<a href="https://mp.weixin.qq.com/" target="_blank">https://mp.weixin.qq.com/</a></p>
          </div>
          <Form onSubmit={this.submitEvent}>
            <Form.Item>
              {getFieldDecorator(
                'backFillArticleUrl',
                {
                  initialValue: url,
                  rules: [
                    { required: true, message: '请输入链接地址' }
                  ]
                }
              )(<Input placeholder='输入已群发的当前广告文案的微信文章链接' />)
              }
            </Form.Item>
          </Form>
        </Modal>
      </div>
    )
  }
}
export default Form.create()(WxUrl)