(window["webpackJsonp"]=window["webpackJsonp"]||[]).push([[31],{"S/S3":function(e,t,a){"use strict";a.r(t);a("Q1Sh");var n=a("xSYZ"),l=a("Ico4"),i=a.n(l),s=a("UWy3"),r=a.n(s),m=a("2w0b"),c=a.n(m),o=a("2Qu+"),d=a.n(o),u=a("TsPW");class h extends m["Component"]{constructor(e){super(e),this.initForm=(()=>{var e=this.state,t=e.missionId,a=e.form,n={missionId:t};Object(u["sb"])(n).then(e=>{e.success&&(a=Object.assign(a,e.data),this.setState({form:a}))})}),this.goBackEvent=(()=>{window.history.go(-1)}),this.state={activeIndex:1,form:{targetMediaCategory:[],targetArea:[]},campaignId:null,type:0,missionData:[],pagination:{size:"small",showSizeChanger:!0,total:0,currentPage:1,limit:5,pageSize:5,onChange:this.changePage,onShowSizeChange:this.onShowSizeChange},provinceData:[],mediaData:[],areaVisible:!1,tagVisible:!1,selAreaData:[],selCategoryData:[]}}componentDidMount(){var e=this;return r()(i.a.mark(function t(){var a;return i.a.wrap(function(t){while(1)switch(t.prev=t.next){case 0:if(a=e.props.location.state,a.missionId){t.next=3;break}return t.abrupt("return",!1);case 3:return t.next=5,e.setState({missionId:a.missionId});case 5:e.initForm();case 6:case"end":return t.stop()}},t)}))()}componentWillUnmount(){this.setState=((e,t)=>{})}render(){var e=this.state.form;return c.a.createElement("div",{className:d.a.administrator},c.a.createElement("header",{className:"header-style"},"\u7ed3\u7b97\u8be6\u60c5"),c.a.createElement("ul",{className:d.a.detaillist},c.a.createElement("li",null,c.a.createElement("em",{style:{width:"120px"}},"\u8ba2\u5355\u7f16\u53f7\uff1a"),c.a.createElement("div",null,e.missionId)),c.a.createElement("li",null,c.a.createElement("em",{style:{width:"120px"}},"\u5e7f\u544a\u4e3b\u5546\u6237\u7f16\u53f7\uff1a"),c.a.createElement("div",null,e.adMerchantCode)),c.a.createElement("li",null,c.a.createElement("em",{style:{width:"120px"}},"\u7ed3\u7b97\u65f6\u95f4\uff1a"),c.a.createElement("div",null,e.settleDate)),c.a.createElement("li",null,c.a.createElement("em",{style:{width:"120px"}},"\u5e7f\u544a\u4e3b\u652f\u51fa(\u5143)\uff1a"),c.a.createElement("div",null,void 0===e.adRealCost?"--":e.adRealCost)),c.a.createElement("li",null,c.a.createElement("em",{style:{width:"120px"}},"\u6d41\u91cf\u4e3b\u6536\u5165(\u5143)\uff1a"),c.a.createElement("div",null,void 0===e.flowRealIncome?"--":e.flowRealIncome)),c.a.createElement("li",null,c.a.createElement("em",{style:{width:"120px"}},"\u5e73\u53f0\u6536\u76ca(\u5143)\uff1a"),c.a.createElement("div",null," ",void 0===e.benefit?"--":e.benefit)),c.a.createElement("li",null,c.a.createElement("em",{style:{width:"120px"}},"\u72b6\u6001\uff1a"),c.a.createElement("div",null,18===Number(e.missionStatus)?"\u7ed3\u7b97\u5931\u8d25":window.common.missionStatus[Number(e.missionStatus)-10])),c.a.createElement("li",null,c.a.createElement("em",{style:{width:"120px"}},"\u6d41\u91cf\u4e3b\u5546\u6237\u7f16\u53f7\uff1a"),c.a.createElement("div",null,e.flowMerchantCode)),c.a.createElement("li",null,c.a.createElement("em",{style:{width:"120px"}},"\u6d3b\u52a8\u7f16\u53f7\uff1a"),c.a.createElement("div",null,e.campaignId)),c.a.createElement("li",{style:{width:"100%"}},c.a.createElement("div",null,c.a.createElement(n["a"],{style:{marginLeft:"120px"},onClick:this.goBackEvent.bind(this)},"\u8fd4\u56de")))))}}t["default"]=h}}]);