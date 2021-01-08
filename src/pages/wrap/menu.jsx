import React, { Component } from 'react';
import { Menu, Icon} from 'antd';
const SubMenu = Menu.SubMenu;
class MenuApp extends Component {
  constructor(props) {
    super(props);
    this.state = {
      defaultMenuData: [
        { id: 1, name: '首页', url: '/', ico: 'home' }
      ],
      advertMenuData: [
        { id: 2, name: '发布广告', url: '/createactivity', ico: 'control' },
        { id: 3, name: '推广记录', url: '/myactivity' , ico: 'container' },
        { id: 4, name: '我的文案', url: '/materiallist' , ico: 'appstore' },
        { id: 5, name: '财务管理', url: '/depositlist' , ico: 'account-book' },
        { id: 6, name: '阅读数据监控', url: '/monitorlist' , ico: 'fund' }
      ],
      flowofMainMenu: [
        { id: 51, name: '可接订单', url: '/receiptpage', ico: 'control' },
        { id: 52, name: '已接订单', url: '/adtask',  ico: 'container' },
        { id: 53, name: '财务记录', url: '/arningslist', ico: 'account-book' }
      ],
      administoraData: [
        { id: 7, name: '广告主管理', ico: 'container', url: '/adlist' },
        { id: 8, name: '流量主管理', ico: 'sliders', url: '/flowlist' },
        { id: 15, name: '公众号管理', ico: 'wechat', url: '/weChatAccoutlist' },
        { id: 17, name: '活动管理', ico: 'slack-circle', url: '/activitylist' },
        { id: 18, name: '订单管理', ico: 'project', url: '/tasklist' },
        { id: 10, name: '结算管理', ico: 'money-collect', url: '/transferlist' },
        { id: 20, name: '认证管理', ico: 'api', url: '/authTmlist' },
        { id: 9, name: '提现管理', ico: 'red-envelope', url: '/cashdatalist' },
        { id: 19, name: '充值管理', ico: 'security-scan', url: '/rechargelist' },
        { id: 21, name: '数据报表', ico: 'shopping', url: '' , children: [
          {id: 212, name: '订单报表', ico: 'shopping', url: '/order'},
          {id: 213, name: '广告主收支报表', ico: 'shopping', url: '/ggzMerchantTrade'},
          {id: 214, name: '流量主收支报表', ico: 'shopping', url: '/llzMerchantTrade'},
          {id: 211, name: '客商提现', ico: 'shopping', url: '/ksSsoCross' },
          //{id: 215, name: '提现报表', ico: 'shopping', url: '/cashReport' }
        ]}
      ],
      inlineCollapsed: false,
    };
  }
  componentDidMount() {
    //商户类型,1：广告主，2：流量主 0：天目管理
    const loginInfo = JSON.parse(window.localStorage.getItem('login_info'));
    if (window.localStorage.getItem('login_info') === null) return false;
    const { administoraData, advertMenuData, flowofMainMenu, defaultMenuData } = this.state;
    let data = [];
    switch (Number(loginInfo.data.merchantType)) {
      case 0:
        data = administoraData;
        break;
      case 1:
        data = advertMenuData;
        break;
      case 2:
        data = flowofMainMenu;
        break;
      default:
        data = advertMenuData;
        break;
    }
    if(Number(loginInfo.data.merchantType)===1){
      data = defaultMenuData.concat(data);
    }
    //console.log(data)
    this.setState({ defaultmenusData: data });
  }
  handleClick(pane) {
    this.props.handleClick(pane);
  }
  render() {
    const {
      defaultmenusData
    } = this.state;
    return (
      <div className="menu-blocks">
        <Menu
          theme="light"
          style={{ height: '100%' }}
          defaultSelectedKeys={[this.props.currentIndex === undefined ? '1' : this.props.currentIndex]}
          mode="inline"
          inlineIndent={10}
        >
          {
            defaultmenusData !== undefined ? 
              defaultmenusData.map((item, index) => (
                (item.children === undefined) ?
                  <Menu.Item key={item.id} onClick={() => this.handleClick(item)}>
                    {item.ico === undefined ? null : <Icon type={item.ico} theme="filled" className="ico" />}<span>{item.name}</span>
                  </Menu.Item>
                  :
                  <SubMenu
                    key={item.id}
                    title={<span><Icon type={item.ico} theme="filled" /><span>{item.name}</span></span>}
                  >
                    {
                      item.children.map((children) => (
                        <Menu.Item key={children.id} onClick={() => this.handleClick(children)}>
                          {children.name}
                        </Menu.Item>
                      ))
                    }
                  </SubMenu>
              )) : null
          }
        </Menu>
      </div>
    );
  }
}
export default MenuApp;
