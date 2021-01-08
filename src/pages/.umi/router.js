import React from 'react';
import { Router as DefaultRouter, Route, Switch } from 'react-router-dom';
import dynamic from 'umi/dynamic';
import renderRoutes from 'umi/lib/renderRoutes';
import history from '@@/history';
import RendererWrapper0 from '/Users/yanglina/workspace/advertising/src/pages/.umi/LocaleWrapper.jsx';
import { routerRedux, dynamic as _dvaDynamic } from 'dva';

const Router = routerRedux.ConnectedRouter;

const routes = [
  {
    path: '/login',
    component: __IS_BROWSER
      ? _dvaDynamic({
          component: () => import('../login'),
        })
      : require('../login').default,
    exact: true,
    _title: '联拓推',
    _title_default: '联拓推',
  },
  {
    path: '/register',
    component: __IS_BROWSER
      ? _dvaDynamic({
          component: () => import('../register'),
        })
      : require('../register').default,
    exact: true,
    _title: '联拓推',
    _title_default: '联拓推',
  },
  {
    path: '/',
    component: __IS_BROWSER
      ? _dvaDynamic({
          component: () => import('../../layouts/index.js'),
        })
      : require('../../layouts/index.js').default,
    Routes: [require('../../routes/privateRoute.js').default],
    routes: [
      {
        path: '/merchant',
        component: __IS_BROWSER
          ? _dvaDynamic({
              component: () => import('../user/merchant'),
            })
          : require('../user/merchant').default,
        exact: true,
        _title: '联拓推',
        _title_default: '联拓推',
      },
      {
        path: '/createactivity',
        component: __IS_BROWSER
          ? _dvaDynamic({
              component: () =>
                import('../advertisers/mypromotion/createactivity'),
            })
          : require('../advertisers/mypromotion/createactivity').default,
        exact: true,
        _title: '联拓推',
        _title_default: '联拓推',
      },
      {
        path: '/myactivity',
        component: __IS_BROWSER
          ? _dvaDynamic({
              component: () => import('../advertisers/mypromotion/myactivity'),
            })
          : require('../advertisers/mypromotion/myactivity').default,
        exact: true,
        _title: '联拓推',
        _title_default: '联拓推',
      },
      {
        path: '/activitydetail',
        component: __IS_BROWSER
          ? _dvaDynamic({
              component: () =>
                import('../advertisers/mypromotion/activitydetail'),
            })
          : require('../advertisers/mypromotion/activitydetail').default,
        exact: true,
        _title: '联拓推',
        _title_default: '联拓推',
      },
      {
        path: '/materiallist',
        component: __IS_BROWSER
          ? _dvaDynamic({
              component: () =>
                import('../advertisers/mypromotion/materiallist'),
            })
          : require('../advertisers/mypromotion/materiallist').default,
        exact: true,
        _title: '联拓推',
        _title_default: '联拓推',
      },
      {
        path: '/editor',
        component: __IS_BROWSER
          ? _dvaDynamic({
              component: () => import('../advertisers/mypromotion/editor'),
            })
          : require('../advertisers/mypromotion/editor').default,
        exact: true,
        _title: '联拓推',
        _title_default: '联拓推',
      },
      {
        path: '/havedtask',
        component: __IS_BROWSER
          ? _dvaDynamic({
              component: () =>
                import('../advertisers/taskmanagement/havedtask'),
            })
          : require('../advertisers/taskmanagement/havedtask').default,
        exact: true,
        _title: '联拓推',
        _title_default: '联拓推',
      },
      {
        path: '/advertdetail',
        component: __IS_BROWSER
          ? _dvaDynamic({
              component: () =>
                import('../advertisers/taskmanagement/advertdetail'),
            })
          : require('../advertisers/taskmanagement/advertdetail').default,
        exact: true,
        _title: '联拓推',
        _title_default: '联拓推',
      },
      {
        path: '/depositlist',
        component: __IS_BROWSER
          ? _dvaDynamic({
              component: () =>
                import('../advertisers/financialaccount/depositlist'),
            })
          : require('../advertisers/financialaccount/depositlist').default,
        exact: true,
        _title: '联拓推',
        _title_default: '联拓推',
      },
      {
        path: '/withdrawallist',
        component: __IS_BROWSER
          ? _dvaDynamic({
              component: () =>
                import('../advertisers/financialaccount/withdrawallist'),
            })
          : require('../advertisers/financialaccount/withdrawallist').default,
        exact: true,
        _title: '联拓推',
        _title_default: '联拓推',
      },
      {
        path: '/consumelist',
        component: __IS_BROWSER
          ? _dvaDynamic({
              component: () =>
                import('../advertisers/financialaccount/consumelist'),
            })
          : require('../advertisers/financialaccount/consumelist').default,
        exact: true,
        _title: '联拓推',
        _title_default: '联拓推',
      },
      {
        path: '/monitorlist',
        component: __IS_BROWSER
          ? _dvaDynamic({
              component: () => import('../advertisers/monitor/monitorlist'),
            })
          : require('../advertisers/monitor/monitorlist').default,
        exact: true,
        _title: '联拓推',
        _title_default: '联拓推',
      },
      {
        path: '/missionmonitor',
        component: __IS_BROWSER
          ? _dvaDynamic({
              component: () => import('../advertisers/monitor/missionmonitor'),
            })
          : require('../advertisers/monitor/missionmonitor').default,
        exact: true,
        _title: '联拓推',
        _title_default: '联拓推',
      },
      {
        path: '/receiptpage',
        component: __IS_BROWSER
          ? _dvaDynamic({
              component: () => import('../flowmain/receiptpage'),
            })
          : require('../flowmain/receiptpage').default,
        exact: true,
        _title: '联拓推',
        _title_default: '联拓推',
      },
      {
        path: '/step',
        component: __IS_BROWSER
          ? _dvaDynamic({
              component: () => import('../flowmain/step'),
            })
          : require('../flowmain/step').default,
        exact: true,
        _title: '联拓推',
        _title_default: '联拓推',
      },
      {
        path: '/adtask',
        component: __IS_BROWSER
          ? _dvaDynamic({
              component: () => import('../flowmain/order_makemoney/adtask'),
            })
          : require('../flowmain/order_makemoney/adtask').default,
        exact: true,
        _title: '联拓推',
        _title_default: '联拓推',
      },
      {
        path: '/arningslist',
        component: __IS_BROWSER
          ? _dvaDynamic({
              component: () => import('../flowmain/myarnings/arningswrap'),
            })
          : require('../flowmain/myarnings/arningswrap').default,
        exact: true,
        _title: '联拓推',
        _title_default: '联拓推',
      },
      {
        path: '/putlist',
        component: __IS_BROWSER
          ? _dvaDynamic({
              component: () => import('../flowmain/myarnings/putlist'),
            })
          : require('../flowmain/myarnings/putlist').default,
        exact: true,
        _title: '联拓推',
        _title_default: '联拓推',
      },
      {
        path: '/getcash',
        component: __IS_BROWSER
          ? _dvaDynamic({
              component: () => import('../flowmain/myarnings/getcash'),
            })
          : require('../flowmain/myarnings/getcash').default,
        exact: true,
        _title: '联拓推',
        _title_default: '联拓推',
      },
      {
        path: '/adlist',
        component: __IS_BROWSER
          ? _dvaDynamic({
              component: () => import('../administrator/information/adlist'),
            })
          : require('../administrator/information/adlist').default,
        exact: true,
        _title: '联拓推',
        _title_default: '联拓推',
      },
      {
        path: '/flowlist',
        component: __IS_BROWSER
          ? _dvaDynamic({
              component: () => import('../administrator/information/flowlist'),
            })
          : require('../administrator/information/flowlist').default,
        exact: true,
        _title: '联拓推',
        _title_default: '联拓推',
      },
      {
        path: '/merchantdetail',
        component: __IS_BROWSER
          ? _dvaDynamic({
              component: () =>
                import('../administrator/information/merchantdetail'),
            })
          : require('../administrator/information/merchantdetail').default,
        exact: true,
        _title: '联拓推',
        _title_default: '联拓推',
      },
      {
        path: '/cashdatalist',
        component: __IS_BROWSER
          ? _dvaDynamic({
              component: () =>
                import('../administrator/cashmangement/cashdatalist'),
            })
          : require('../administrator/cashmangement/cashdatalist').default,
        exact: true,
        _title: '联拓推',
        _title_default: '联拓推',
      },
      {
        path: '/cashdetail',
        component: __IS_BROWSER
          ? _dvaDynamic({
              component: () =>
                import('../administrator/cashmangement/cashdetail'),
            })
          : require('../administrator/cashmangement/cashdetail').default,
        exact: true,
        _title: '联拓推',
        _title_default: '联拓推',
      },
      {
        path: '/authTmlist',
        component: __IS_BROWSER
          ? _dvaDynamic({
              component: () =>
                import('../administrator/authmangement/authTmlist'),
            })
          : require('../administrator/authmangement/authTmlist').default,
        exact: true,
        _title: '联拓推',
        _title_default: '联拓推',
      },
      {
        path: '/viewinfo',
        component: __IS_BROWSER
          ? _dvaDynamic({
              component: () =>
                import('../administrator/authmangement/viewinfo'),
            })
          : require('../administrator/authmangement/viewinfo').default,
        exact: true,
        _title: '联拓推',
        _title_default: '联拓推',
      },
      {
        path: '/transferlist',
        component: __IS_BROWSER
          ? _dvaDynamic({
              component: () =>
                import('../administrator/transfermagement/transferlist'),
            })
          : require('../administrator/transfermagement/transferlist').default,
        exact: true,
        _title: '联拓推',
        _title_default: '联拓推',
      },
      {
        path: '/transferdetail',
        component: __IS_BROWSER
          ? _dvaDynamic({
              component: () =>
                import('../administrator/transfermagement/transferdetail'),
            })
          : require('../administrator/transfermagement/transferdetail').default,
        exact: true,
        _title: '联拓推',
        _title_default: '联拓推',
      },
      {
        path: '/activitylist',
        component: __IS_BROWSER
          ? _dvaDynamic({
              component: () =>
                import('../administrator/information/activitylist'),
            })
          : require('../administrator/information/activitylist').default,
        exact: true,
        _title: '联拓推',
        _title_default: '联拓推',
      },
      {
        path: '/viewdetail',
        component: __IS_BROWSER
          ? _dvaDynamic({
              component: () =>
                import('../administrator/information/viewdetail'),
            })
          : require('../administrator/information/viewdetail').default,
        exact: true,
        _title: '联拓推',
        _title_default: '联拓推',
      },
      {
        path: '/tasklist',
        component: __IS_BROWSER
          ? _dvaDynamic({
              component: () => import('../administrator/information/tasklist'),
            })
          : require('../administrator/information/tasklist').default,
        exact: true,
        _title: '联拓推',
        _title_default: '联拓推',
      },
      {
        path: '/taskdetail',
        component: __IS_BROWSER
          ? _dvaDynamic({
              component: () =>
                import('../administrator/information/taskdetail'),
            })
          : require('../administrator/information/taskdetail').default,
        exact: true,
        _title: '联拓推',
        _title_default: '联拓推',
      },
      {
        path: '/wechatAccoutlist',
        component: __IS_BROWSER
          ? _dvaDynamic({
              component: () =>
                import('../administrator/information/wechatAccoutlist'),
            })
          : require('../administrator/information/wechatAccoutlist').default,
        exact: true,
        _title: '联拓推',
        _title_default: '联拓推',
      },
      {
        path: '/accountView',
        component: __IS_BROWSER
          ? _dvaDynamic({
              component: () =>
                import('../administrator/information/accountView'),
            })
          : require('../administrator/information/accountView').default,
        exact: true,
        _title: '联拓推',
        _title_default: '联拓推',
      },
      {
        path: '/rechargelist',
        component: __IS_BROWSER
          ? _dvaDynamic({
              component: () => import('../administrator/recharge/list'),
            })
          : require('../administrator/recharge/list').default,
        exact: true,
        _title: '联拓推',
        _title_default: '联拓推',
      },
      {
        path: '/ksSsoCross',
        component: __IS_BROWSER
          ? _dvaDynamic({
              component: () =>
                import('../administrator/information/ksSsoCross'),
            })
          : require('../administrator/information/ksSsoCross').default,
        exact: true,
        _title: '联拓推',
        _title_default: '联拓推',
      },
      {
        path: '/order',
        component: __IS_BROWSER
          ? _dvaDynamic({
              component: () => import('../administrator/report/order'),
            })
          : require('../administrator/report/order').default,
        exact: true,
        _title: '联拓推',
        _title_default: '联拓推',
      },
      {
        path: '/ggzMerchantTrade',
        component: __IS_BROWSER
          ? _dvaDynamic({
              component: () =>
                import('../administrator/report/ggzMerchantTrade'),
            })
          : require('../administrator/report/ggzMerchantTrade').default,
        exact: true,
        _title: '联拓推',
        _title_default: '联拓推',
      },
      {
        path: '/llzMerchantTrade',
        component: __IS_BROWSER
          ? _dvaDynamic({
              component: () =>
                import('../administrator/report/llzMerchantTrade'),
            })
          : require('../administrator/report/llzMerchantTrade').default,
        exact: true,
        _title: '联拓推',
        _title_default: '联拓推',
      },
      {
        path: '/cashReport',
        component: __IS_BROWSER
          ? _dvaDynamic({
              component: () => import('../administrator/report/cashReport'),
            })
          : require('../administrator/report/cashReport').default,
        exact: true,
        _title: '联拓推',
        _title_default: '联拓推',
      },
      {
        path: '/authList',
        component: __IS_BROWSER
          ? _dvaDynamic({
              component: () => import('../public/authentication/authList'),
            })
          : require('../public/authentication/authList').default,
        exact: true,
        _title: '联拓推',
        _title_default: '联拓推',
      },
      {
        path: '/authentication',
        component: __IS_BROWSER
          ? _dvaDynamic({
              component: () => import('../public/authentication'),
            })
          : require('../public/authentication').default,
        exact: true,
        _title: '联拓推',
        _title_default: '联拓推',
      },
      {
        path: '/detail',
        component: __IS_BROWSER
          ? _dvaDynamic({
              component: () => import('../public/authentication/detail'),
            })
          : require('../public/authentication/detail').default,
        exact: true,
        _title: '联拓推',
        _title_default: '联拓推',
      },
      {
        path: '/account',
        component: __IS_BROWSER
          ? _dvaDynamic({
              component: () => import('../public/authentication/account'),
            })
          : require('../public/authentication/account').default,
        exact: true,
        _title: '联拓推',
        _title_default: '联拓推',
      },
      {
        component: () =>
          React.createElement(
            require('/Users/yanglina/workspace/advertising/node_modules/_umi-build-dev@1.16.7@umi-build-dev/lib/plugins/404/NotFound.js')
              .default,
            { pagesPath: 'src/pages', hasRoutesInConfig: true },
          ),
        _title: '联拓推',
        _title_default: '联拓推',
      },
    ],
    _title: '联拓推',
    _title_default: '联拓推',
  },
  {
    component: () =>
      React.createElement(
        require('/Users/yanglina/workspace/advertising/node_modules/_umi-build-dev@1.16.7@umi-build-dev/lib/plugins/404/NotFound.js')
          .default,
        { pagesPath: 'src/pages', hasRoutesInConfig: true },
      ),
    _title: '联拓推',
    _title_default: '联拓推',
  },
];
window.g_routes = routes;
const plugins = require('umi/_runtimePlugin');
plugins.applyForEach('patchRoutes', { initialValue: routes });

export { routes };

export default class RouterWrapper extends React.Component {
  unListen() {}

  constructor(props) {
    super(props);

    // route change handler
    function routeChangeHandler(location, action) {
      plugins.applyForEach('onRouteChange', {
        initialValue: {
          routes,
          location,
          action,
        },
      });
    }
    this.unListen = history.listen(routeChangeHandler);
    // dva 中 history.listen 会初始执行一次
    // 这里排除掉 dva 的场景，可以避免 onRouteChange 在启用 dva 后的初始加载时被多执行一次
    const isDva =
      history.listen
        .toString()
        .indexOf('callback(history.location, history.action)') > -1;
    if (!isDva) {
      routeChangeHandler(history.location);
    }
  }

  componentWillUnmount() {
    this.unListen();
  }

  render() {
    const props = this.props || {};
    return (
      <RendererWrapper0>
        <Router history={history}>{renderRoutes(routes, props)}</Router>
      </RendererWrapper0>
    );
  }
}
