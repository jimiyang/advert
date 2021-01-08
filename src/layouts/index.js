import React, {Component} from 'react';
import router from 'umi/router';
import {Layout} from 'antd';
import common from '@/untils/common';
import Menu from '@/pages/wrap/menu'; //左侧菜单
import Header from '@/pages/wrap/header'; //头部
import Main from '@/pages/wrap/main'; //主页面
const {Sider, Content} = Layout;
window.common = common; //公共方法
class BasicLayout extends Component {
  constructor(props) {
    super(props);
    this.state = {
      id: null,
      type: null,
      collapsed: true
    };
  }
  async componentDidMount() {
    const query = this.props.location.query;
    if (query.type !== undefined) {
      this.setState({type: query.type});
    }
  }
  handleClick = (pane) => {
    router.push(pane.url);
  }
  onCollapse = () => {
    this.setState({collapsed: false});
  }
  leaveEvent = () => {
    this.setState({collapsed: true});
  }
  render() {
    const {
      type,
      id,
      collapsed
    } = this.state;
    return (
      <div className="section">
        { //window.localStorage.getItem('login_info') === null ? 
          //<Login /> :
          <Layout>
            {
              type === 'fans' ? null
              :
              <div className="sider-menu">
                <Sider className="sider"
                  collapsedWidth={50}
                  onMouseEnter={this.onCollapse}
                  onMouseLeave={this.leaveEvent}
                  collapsed={collapsed}
                >
                  <Menu
                    handleClick={this.handleClick}
                    id={id}
                    currentIndex={this.props.location.query.currentIndex}
                  />
                </Sider>
              </div>
            }
            <Layout>
              {type === 'fans' ? null : <Header onCollapse={this.onCollapse} collapsed={collapsed} />}
              <Content className={(type === 'fans') ? null : "content-blocks"}>
                {
                  this.props.location.pathname === '/' ? <Main /> : this.props.children
                }
              </Content>
            </Layout>
          </Layout>
        }
      </div>
    );
  }
}
export default BasicLayout;
