import React, {Component} from 'react';
import {Input, Form, Modal} from 'antd';
import style from './component.less';
export default Form.create({ name: 'form_in_modal' })(
  class AddFlowMain extends Component{
    constructor(props) {
      super(props);
    }
    render() {
      const {isAddVisible, onCancel, onCreate, form, type} = this.props;
      const {getFieldDecorator} = form;
      return (
        <Modal
          visible={isAddVisible}
          onCancel={onCancel}
          onOk={onCreate}
        >
          <Form layout="vertical">
            <ul className={style.add}>
              <li>
                <em className={style.name}>{type === 1 ? '广告主' : '流量主'}名称</em>
                <Form.Item>
                  {
                    getFieldDecorator(
                      'merchantName',
                      {
                        rules: [
                          {required: true, message: type=== 1 ? '请输入广告主名称' : '请输入流量主名称'}
                        ]
                      }
                    )(<Input className="ipttxt"  placeholder={`${type === 1 ? '广告主' : '流量主'}名称`} />)
                  }
                </Form.Item>
              </li>
              <li>
                <em className={style.name}>联系人</em>
                <Form.Item>
                  {
                    getFieldDecorator(
                      'contactName',
                      {
                        rules: [
                          {required: true, message: '请输入联系人姓名'}
                        ]
                      }
                    )(<Input className="ipttxt"  placeholder="联系人"/>)
                  }
                </Form.Item>
              </li>
              <li>
                <em className={style.name}>联系人电话</em>
                <Form.Item>
                  {
                    getFieldDecorator(
                      'mobile',
                      {
                        rules: [
                          {required: true, message: '请输入联系人电话'}
                        ]
                      }
                    )(<Input placeholder="联系人电话" />)
                  }
                </Form.Item>
              </li>
              <li>
                <em className={style.name}>登录名</em>
                <Form.Item>
                  {
                    getFieldDecorator(
                      'loginName',
                      {
                        rules: [
                          {required: true, message: '请输入登录名'}
                        ]
                      }
                    )(<Input placeholder="登录名" />)
                  }
                </Form.Item>
              </li>
              <li>
                <em className={style.name}>密码</em>
                <Form.Item>
                  {
                    getFieldDecorator(
                      'password',
                      {
                        rules: [
                          {required: true, message: '请输入密码'}
                        ]
                      }
                    )(<Input placeholder="请输入密码" type="password" />)
                  }
                </Form.Item>
              </li>
            </ul>
          </Form>
        </Modal>
      )
    }
  }
  //export default AddFlowMain;
  //export default Form.create()(AddFlowMain);
);
