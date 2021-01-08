//module.exports导出对应require导入，export导出对应import导入
exports.route = [
  { path: '/login', component: './login' },
  { path: '/register', component: './register' },
  {
    path: '/',
    component: '../layouts/index.js',
    Routes: ['./src/routes/privateRoute.js'],
    routes: ['./src/routes/router.js'],
    routes: [
      { path: '/merchant', component: './user/merchant'}, //账户设置(个人中心)
      { path: '/createactivity', component: './advertisers/mypromotion/createactivity'}, //创建推广活动(广告主)
      { path: '/myactivity', component: './advertisers/mypromotion/myactivity' }, //我的推广活动(广告主)
      { path: '/activitydetail', component: './advertisers/mypromotion/activitydetail' }, //我的推广活动详情(广告主)
      { path: '/materiallist', component: './advertisers/mypromotion/materiallist' }, //素材管理(广告主)
      { path: '/editor', component: './advertisers/mypromotion/editor' }, //编辑器(广告主)
      { path: '/havedtask', component: './advertisers/taskmanagement/havedtask' }, //已接订单(广告主)
      { path: '/advertdetail', component: './advertisers/taskmanagement/advertdetail' }, //查看活动/审核接单(广告主)
      { path: '/depositlist', component: './advertisers/financialaccount/depositlist' }, //充值记录(广告主)
      { path: '/withdrawallist', component: './advertisers/financialaccount/withdrawallist' }, //提现记录(广告主)
      { path: '/consumelist', component: './advertisers/financialaccount/consumelist' }, //消费记录(广告主)
      { path: '/monitorlist', component: './advertisers/monitor/monitorlist'}, //阅读数据监控(广告主)
      { path: '/missionmonitor', component: './advertisers/monitor/missionmonitor'}, //接单账号列表( 广告主)
      { path: '/receiptpage', component: './flowmain/receiptpage' }, // 接单（流量住)
      { path: '/step', component: './flowmain/step'}, //推文流程页(流量主)
      { path: '/adtask', component: './flowmain/order_makemoney/adtask' }, //已接广告订单(流量主)
      { path: '/arningslist', component: './flowmain/myarnings/arningswrap' }, //我的收益（结算记录）流量主
      { path: '/putlist', component: './flowmain/myarnings/putlist' }, //提现记录(流量主)
      { path: '/getcash', component: './flowmain/myarnings/getcash' }, //提现申请(流量主)
      { path: '/adlist', component: './administrator/information/adlist' }, //广告主管理列表(天目管理员)
      { path: '/flowlist', component: './administrator/information/flowlist' }, //流量主管理列表(天目管理员)
      { path: '/merchantdetail', component: './administrator/information/merchantdetail' }, //商户详情(天目管理员)
      { path: '/cashdatalist', component: './administrator/cashmangement/cashdatalist' }, //提现管理(天目管理员)
      { path: '/cashdetail', component: './administrator/cashmangement/cashdetail' }, //提现管理详情(天目管理员)
      { path: '/authTmlist', component: './administrator/authmangement/authTmlist'}, //认证管理(天目管理员)
      { path: '/viewinfo', component: './administrator/authmangement/viewinfo'}, //认证管理详情/审核(天目管理员)
      { path: '/transferlist', component: './administrator/transfermagement/transferlist' }, // 结算列表（天目管理员)
      { path: '/transferdetail', component: './administrator/transfermagement/transferdetail' }, // 结算列表详情（天目管理员)
      { path: '/activitylist', component: './administrator/information/activitylist' }, // 活动管理（天目管理员)
      { path: '/viewdetail', component: './administrator/information/viewdetail' }, // 活动管理查看（天目管理员)
      { path: '/tasklist', component: './administrator/information/tasklist' }, // 订单管理（天目管理员)
      { path: '/taskdetail', component: './administrator/information/taskdetail' }, // 订单管理查看（天目管理员)
      { path: '/wechatAccoutlist', component: './administrator/information/wechatAccoutlist' }, // 公众号管理（天目管理员)
      { path: '/accountView', component: './administrator/information/accountView' }, // 公众号管理详情、审核（天目管理员)
      { path: '/rechargelist', component: './administrator/recharge/list' }, //充值管理(天目管理员)
      { path: '/ksSsoCross', component: './administrator/information/ksSsoCross' }, //客商提现
      { path: '/order', component: './administrator/report/order' }, //数据报表、订单报表(天目管理员)
      { path: '/ggzMerchantTrade', component: './administrator/report/ggzMerchantTrade' }, //数据报表、广告主商户交易报表(天目管理员)
      { path: '/llzMerchantTrade', component: './administrator/report/llzMerchantTrade' }, //数据报表、流量主商户交易报表(天目管理员)
      { path: '/cashReport', component: './administrator/report/cashReport' }, //提现报表
      /********广告主、流量主公共页面提现、认证****************** */
      { path: '/authList', component: './public/authentication/authList' }, // 提现列表（流量住)
      { path: '/authentication', component: './public/authentication' }, // 提交认证（流量住、广告主)
      { path: '/detail', component: './public/authentication/detail'}, // 认证详情（流量住、广告主)
      { path: '/account', component: './public/authentication/account' } // 提现申请（流量住、广告主)
    ]
  }
]