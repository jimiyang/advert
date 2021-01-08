import React, {Component} from 'react';
import {Input, DatePicker, Form, Radio, Button, message, Modal, Steps, Select, Checkbox, Icon} from 'antd';
import moment from 'moment';
import style from './style.less';
import router from 'umi/router';
import {
  caQuery,
  add,
  native,
  getById,
  edit
} from '@/api/api'//接口地址
import ReactTooltip from 'react-tooltip'
import RechargeModel from '@/pages/components/rechargeModel' //充值modal
import Dictionary from  '@/components/dictionary' //字典标签(选择)
import Dict from '@/components/Dict' //字典标签
import MateriaInfo from './materiainfo' //文章详情
const { Step } = Steps
const { Option } = Select
const { TextArea } = Input
const { RangePicker } = DatePicker
const targetData = new Dict()
class CreateAdvertity extends Component {
  constructor(props) {
    super(props);
    this.state = {
      isDisabled: false,
      isMateriaShow: false,
      currentTime: null,
      areaVisible: false, //地区弹层
      tagVisible: false, //类别弹层
      rechargeVisible: false, //是否显示充值弹层
      dictData: [], //标签数据
      topup: {
        amount: null
      },
      form: {
        campaignName: null, //活动名称
        targetGender: null, //粉丝类别
        dateStart: null, //开始时间
        dateEnd: null, //结束时间
        adType: 'article', //活动形式
        missionLimitDay: 5, //活动接单限制【为1时必填】，天数限制（单位天）
        targetGender: 0, //男女比例粉 默认未不限
        targetGenderScale: null,
        targetMediaCategory: [], //行业
        targetArea: [], //地区
        targetAreaArray: [],
        targetMediaCategoryArray: [],
        billingType: 1, //计费方式
        unitPrice: null, //阅读单价
        postAmtTotal: null, //活动预算
        postStatus: 0, //活动状态
        missionLimit: 1, //活动接单限制（1天数限制，2只允许接一次）
        postTimeLimit: 0, //推广时段限制0: 无限制 ，1：限制时间
        hourStart: 0, //开始时段
        hourEnd: 0, //结束时段
        retentionTime: 24, //保留时长
        appArticlePosition: 9, //投放位置
        appType: 3, //公众号类型（1公众号，2订阅号 3公众号、订阅号均可）
        verifyTypeInfo: -2, //默认未认证
        fansNumLimit: null, //粉丝数默认2000
        userAppNumLimit: null, //同一用户允许接单公众号个数
        appMissionNumLimit: null, //公众号允许接单数
        remarks: null //备注
      },
      sexType: 0, //男女比例
      areaType: 0, //选择省份
      categoryType: 0, //选择公众号类别
      validReading: 0, //有效阅读数，，只在页面显示
      availableBalance: 0, //账户可用余额
      provinceName: [], //地域名称集合
      categoryName: [], //公众号类别名称集合
      checkAll: true, //是否全选公众号类型
      appTypeData: [1, 2, -2], //公众号类型
      rechargeStep: 0, //充值默认的步骤
      arr: [[], [], []],
      isHide: true,
      isSubmit: false
    };
  }
  async componentDidMount() {
    const state = this.props.location.state
    //const form = Object.assign(this.state.form);
    await this.getCaQuery();
    if (state !== undefined) {
      await this.initForm(state.id)
    }
  }
  //获取可用余额和冻结余额
  getCaQuery = () => {
    return caQuery().then(rs => {
      if (rs.success && rs.data !== undefined) {
        this.setState({availableBalance: rs.data.benefitCa.available_balance});
      }
    });
  }
  //获取活动详情
  initForm =  (id) => {
    let {form, appTypeData, checkAll} = this.state
    getById({id}).then(rs => {
      if (rs.success) {
        form = Object.assign(form, rs.data)
        checkAll = form.verifyTypeInfo === -2 ? true : false
        switch(form.appType) {
          case 3:
            appTypeData = [1, 2]
            appTypeData[2] = form.verifyTypeInfo === -2 ? -2 : -1
          break
          case 2:
            appTypeData = [null, 2]
            appTypeData[2] = (form.verifyTypeInfo === -2 || form.verifyTypeInfo === -1) ?  -2 : form.verifyTypeInfo
          break
          case 1:
            appTypeData = [1, null]
            appTypeData[2] = (form.verifyTypeInfo === -2 || form.verifyTypeInfo === -1) ?  -2 : form.verifyTypeInfo
          break
        }
        const sexType = form.targetGenderScale !== null ? 1 : 0
        const areaType = form.targetAreaArray.length > 0 ? 1 : 0
        const categoryType = form.targetMediaCategoryArray.length > 0 ? 1 : 0
        targetData.loadData('provinceType', form.targetAreaArray).then(res => {
          this.setState({provinceName: res})
        })
        targetData.childLoadData('parent_mediatype', form.targetMediaCategoryArray).then(res => {
          this.setState({categoryName: res})
        })
        this.setState({form, appTypeData, checkAll, sexType, areaType, categoryType})
      }
    })
  }
  //form 表单改变
  changeFormEvent = (type, e, value) => {
    let {form, appTypeData} = this.state,
      obj = {},
      validRead,
      values,
      total;
    switch(type) {
      case 'date':
        obj = {'dateStart': value[0], 'dateEnd': value[1]};
      break;
      case 'targetGenderScale':
        obj = {[type]: e.target.value};
      break;
      case 'unitPrice':
        values = e.target.value;
        obj = {unitPrice: values};
        total = parseInt(form.postAmtTotal / values);
        validRead = isNaN(total) ? 0 : total;
        this.setState({validReading: validRead});
      break;
      case 'postAmtTotal':
        values = e.target.value
        let num = {fansNumLimit: null}, obj2={}
        if (values >= 5000) {
          num = {fansNumLimit: 2000}
          this.props.form.setFieldsValue({fansNumLimit: 2000})
        } else {
          num = {fansNumLimit: null}
          obj2 = {checkAll: true, appTypeData: [1, 2, -2]}
        }
        obj = {postAmtTotal: values, ...num};
        total = parseInt(values / form.unitPrice);
        validRead = isNaN(total) ? 0 : total;
        this.setState({validReading: validRead, ...obj2});
      break;
      case 'missionLimit':
        obj = {missionLimit: e.target.value};
      break;
      case 'fansNumLimit':
        obj = {[type]: e.target.value};
      break;
      case 'postTimeLimit':
        obj = {[type]: e.target.value};
      break;
      case 'verifyType':
        appTypeData[2] = e.target.checked ? -2 : null
        let chk = false
        if (appTypeData[0] === 1 && appTypeData[1] === 2 && appTypeData[2] === -2) {
          chk = true
          obj = {verifyTypeInfo: -2}
        } else if (!this.state.checkAll && e.target.checked){
          chk = false
          obj = {verifyTypeInfo: -1}
        } else if (!this.state.checkAll && !e.target.checked){
          chk = false
          obj = {verifyTypeInfo: 0}
        }
        this.setState({
          appTypeData, 
          checkAll: chk
        })
      break;
      case 'appType': //公众号类型
        let index = e.target.value, chkked
        appTypeData[index - 1] = e.target.checked ? index : null;
        obj =  (appTypeData[2] !== -2 && this.state.checkAll !== true) ? {verifyTypeInfo: 0} : {verifyTypeInfo: -1}
        if (appTypeData[0] === 1 && appTypeData[1] === 2 && appTypeData[2] === -2) {
          chkked = true
        } else if (appTypeData[0] === 1 && appTypeData[1] === 2){
          obj = Object.assign(obj, {[type]: 3, verifyTypeInfo: -1})
        }else if (appTypeData[0] === 1) {
          obj = Object.assign(obj, {[type]: 1})
        } else if (appTypeData[1] === 2) {
          obj = Object.assign(obj, {[type]: 2})
        } else if (appTypeData[0] !== 1 && appTypeData[1] !== 2) {
          obj = {[type]: 3}
        }
        this.setState({appTypeData, checkAll: chkked})
      break;
      case 'allcheck':
        let chked = e.target.checked
        if (chked) {
          appTypeData = [1, 2, -2]
          obj = {appType: 3, verifyTypeInfo: -2}
        } else {
          appTypeData = [1, 2, null]
          obj = {appType: 3, verifyTypeInfo: -1}
        }
        this.setState({
          checkAll: chked,
          appTypeData
        });
      break;
      case 'remarks':
        obj = {[type]: e.target.value};
        break;
      default:
        obj = {[type]: e};
      break;
    }
    form = Object.assign(form, obj);
    //console.log(form)
    this.setState({form});
  }
  //定向设定
  setMadeEvent = (type, e) => {
    let value = e.target.value;
    let obj = {}
    let {form}= this.state;
    switch (type) {
      case 'sexType':
        let isVisible
        if (Number(value) === 0) {
          isVisible = false
          form = Object.assign(form, {targetGender: 0, targetGenderScale: null});
        } else{
          isVisible = true
          form = Object.assign(form, {targetGender: 1});
        }
        obj = {isVisible};
      break;
      case 'areaType':
        let areaVisible, obj2 = {}
        if (Number(value) === 0) {
          areaVisible = false
          this.setState({provinceName: []})
          form = Object.assign(form, {targetAreaArray: []});
        } else {
          areaVisible = true
        }
        obj = {areaVisible}
      break;
      case 'categoryType':
        //let tagVisible = value === 0 ? false : true;
        let tagVisible
        if (Number(value) === 0) {
          tagVisible = false
          this.setState({categoryName: []})
          form = Object.assign(form, {targetMediaCategoryArray: []});
        } else {
          tagVisible = true
        }
        obj = {tagVisible}
      break;
    }
    this.setState({[type]: Number(value), ...obj, form});
  }
  //选择标签
  getIndexTag = (item, data, type) => {
    let form = this.state.form;
    let obj = type === 'parent_mediatype' ? {targetMediaCategory: item, targetMediaCategoryArray: item} : {targetArea: item, targetAreaArray: item};
    form = Object.assign(form, obj);
    this.setState({form, dictData: data});
  }
  getDictionary = (type) => {
    const {form, dictData} = this.state;
    let arr = [], obj = {};
    if (type === 'parent_mediatype' ) {
      let arr2 = window.common.mergeArray(form.targetMediaCategory); //多维数组合并一维数组
      arr2.map(item => {
        dictData.map(node => {
          node.dictChildList.map(child => {
            if (item === child.value) {
              arr.push(child.label);
            }
          }); 
        });
      });
      obj = {categoryName: arr, tagVisible: false, categoryType: arr.length === 0 ? 0 : 1};
      if (arr.length === 0){
        message.error('至少选择一项需要推广的公众号类别')
        return false
      }
    } else {
      form.targetAreaArray.map(item => {
        dictData.map(child => {
          if (item === child.value) {
            arr.push(child.label);
          }
        });
      });
      obj = {provinceName: arr, areaVisible: false, areaType: arr.length === 0 ? 0 : 1};
      if (arr.length === 0) {
        message.error('至少选择一项需要推广的区域')
        return false
      } 
    }
    this.setState({...obj});
  } 
  //关闭充值弹层
  closeEvent = (type) => {
    const {form, provinceName, categoryName} = this.state
    if (type === 'provinceType') {
      let areaType = (provinceName.length === 0 && type === 'provinceType') ? 0 : 1
      //console.log(form.targetArea)
      let f = Object.assign(form, {targetAreaArray: []})
      this.setState({areaType, form: f})
    } else if (type === 'parent_mediatype') {
      let categoryType = categoryName.length === 0 && type === 'parent_mediatype' ?  0 : 1
      let f = Object.assign(form, {targetMediaCategoryArray: []})
      this.setState({categoryType, form: f})
    }
    this.setState({
      rechargeVisible: false,
      tagVisible: false,
      areaVisible: false,
      isMateriaShow: false,
      isSubmit: false
    });
  }
  isSubmitEvent = (e) => {
    e.preventDefault();
    this.props.form.validateFields((err, values) => {
      if (!err) {
        delete values.date
        let {form, checkAll, appTypeData} = this.state;
        const state = this.props.location.state
        let mData
        if (state !== undefined) {
          mData = form.targetMediaCategory.length === 0 ? [] : JSON.parse(form.targetMediaCategory)
        } else {
          mData = form.targetMediaCategory
        }
        // if (appTypeData[0] && appTypeData[1] && appTypeData[2]) {
        //let mData = form.targetMediaCategory.length === 0 ? [] : JSON.parse(form.targetMediaCategory)
        let arr2 = window.common.mergeArray(mData); //多维数组合并一维数组
        arr2 = arr2.length > 0 ? window.common.removeEmptyArrayEle(arr2) : arr2
        form = Object.assign(form, values, {targetMediaCategory: arr2});
        let midHour = 23 - Number(form.hourStart) + Number(form.hourEnd)
        
        if (form.impImage === undefined) {
          message.error('请选择推广文案')
          return false
        }
        if ( midHour < 6) {
          message.error('时间段间隔必须大于6小时')
        }
        if (form.postAmtTotal >= 5000 && !checkAll & appTypeData[0] !== 1 && appTypeData[1] !== 2 && appTypeData[2] !== -2) {
          message.error('至少选择一项公众号类型')
          return false
        }
        this.setState({form})
        this.setState({stype: 'save', isSubmit: true})
      }
    })
  }
  //创建活动事件/重置推广状态
  createEvent = () => {
    let {form, stype} = this.state
    if (stype === 'clear') {
      //this.props.form.resetFields();
      form = Object.assign({
        campaignName: null, //活动名称
        targetGender: null, //粉丝类别
        dateStart: null, //开始时间
        dateEnd: null, //结束时间
        adType: 'article', //活动形式
        missionLimitDay: 5, //活动接单限制【为1时必填】，天数限制（单位天）
        targetGender: 0, //男女比例粉 默认未不限
        targetGenderScale: null,
        targetMediaCategory: [], //行业
        targetArea: [], //地区
        targetAreaArray: [],
        targetMediaCategoryArray: [],
        billingType: 1, //计费方式
        unitPrice: null, //阅读单价
        postAmtTotal: null, //活动预算
        postStatus: 0, //活动状态
        missionLimit: 1, //活动接单限制（1天数限制，2只允许接一次）
        postTimeLimit: 0, //推广时段限制0: 无限制 ，1：限制时间
        hourStart: 0, //开始时段
        hourEnd: 0, //结束时段
        retentionTime: 48, //保留时长
        appArticlePosition: 9, //投放位置
        //公众号类型（1公众号，2订阅号 3公众号、订阅号均可）
        appType: 3,
        fansNumLimit: null, //粉丝数默认2000
        userAppNumLimit: null, //同一用户允许接单公众号个数
        appMissionNumLimit: null, //公众号允许接单数
        remarks: null, //备注
        impImage: undefined
      })
      this.props.form.setFieldsValue({campaignName: null, date: null, unitPrice: null, postAmtTotal: null});
      this.setState({
        form,
        isSubmit: false,
        provinceName: [],
        categoryName: [],
        sexType: 0, 
        areaType: 0,
        categoryType: 0,
        validReading: 0,
        mInfo: {},
        stype: 'save'
      })
    } else {
      const state = this.props.location.state
      if (state !== undefined) {
        let form = Object.assign(this.state.form, {id: state.id})
        form.dateStart = window.common.getDate(form.dateStart)
        form.dateEnd = window.common.getDate(form.dateEnd)
        form.targetArea = form.targetArea !== '[]' ? JSON.parse(form.targetArea) : []
        //form.targetMediaCategory = JSON.parse(form.targetMediaCategory)
        //console.log(form)
        //return false
        edit(form).then(rs => {
          if (rs.success) {
            message.success(rs.message);
            router.push({
              pathname: '/myactivity'
            });
          }
        })
      } else {
        //console.log(form)
        //return false
        add(form).then(rs => {
          if (rs.success) {
            message.success(rs.message);
            router.push({
              pathname: '/myactivity'
            });
          }
        })
      }
    }
  }
  //清空设置
  clearEvent = () => {
    this.setState({stype: 'clear', isSubmit: true})
  }
  goBackEvent = () => {
    const id = this.state.form.postContent;
    router.push({pathname: '/materialinfo', state: {id}});
  }
  disabledEndDate = (current) => {
    // 大于当前日期不能选 time > moment()
    // 小于当前日期不能选 time < moment().subtract(1, “days”)
    // 只能选前7后7 time < moment().subtract(7, “days”) || time > moment().add(7, ‘d’)
    //return time < moment().subtract(7, “days”) || time > moment().add(7, ‘d’)
    return current && current < moment().subtract(1, "days")
  }
  handleEndOpenChange = (open) => {
    let me = this;
    if(open){
      me.currentTime = moment();
    }
    this.setState({currentTime: moment()});
  }
  //显示充值弹层
  saveMoneyEvent = () => {
    let topup = this.state.topup;
    topup = Object.assign(topup, {amount: ''});
    this.setState({rechargeVisible: true, topup, rechargeStep: 0});
  }
  
  //调用子组件的表单事件
  bindValue = (type, e) => {
    let topup = this.state.topup;
    topup = Object.assign(topup, {[type]: e.target.value});
    this.setState({topup});
  }
  //确定要充值
  rechargeEvent = () => {
    const {topup} = this.state;
    const params = {
      ...topup
    };
    const reg = /^[0-9]+([.]{1}[0-9]{1,2})?$/;
    if (!reg.test(params.amount)) {
      message.error('请输入整数或小数(保留后两位)');
      return false;
    }
    native(params).then(rs => {
      if (rs.success) {
        this.setState({
          ...rs.data,
          rechargeStep: 1,
        });
      }
    });
  }
  reload = () => {
    const that = this;
    const timer = setTimeout(function() {
      that.getCaQuery();
      that.setState({rechargeVisible: false});
      clearTimeout(timer);
    }, 3000);
  }
  //保存素材
  saveMateriaEvent = (item) => {
    let {form}= this.state
    form = Object.assign(form, {
      postContent: item.id,
      impImage: item.thumbMediaUrl,
      postUrl: item.contentSourceUrl,
      extrendJson: item.title
    })
    this.setState({form})
  }
  componentWillUnmount () {
    this.setState = (state, callback) => {
      return;
    };
  }
  render() {
    const {
      isDisabled,
      form,
      availableBalance,
      tagVisible,
      areaVisible,
      topup,
      sexType,
      areaType,
      categoryType,
      rechargeVisible,
      provinceName,
      categoryName,
      validReading,
      appTypeData,
      rechargeStep,
      payUrl,
      orderNo,
      isSubmit,
      stype,
      checkAll
    } = this.state;
    const {getFieldDecorator} = this.props.form;
    const maxValue = (rule, value, callback) => {
      if (Number(value) > Number(availableBalance)) {
        callback('可用余额不足，请充值');
      } // 必须总是返回一个 callback，否则 validateFields 无法响应
      let reg = /^([1-9][0-9]*){1,3}|(^[0-9][.][0-9]{1}$)|(^[0-9][.][0-9]{2}$)$/;
      if (!reg.test(value)) {
        callback('请输入预算金额');
      }
      // if (Number(value) < 500) {
      //   callback('总预算最低为500元');
      // }
      callback(); 
    };
    //最低cpc单价
    const minValue = (rule, value, callback) => {
      let reg = /^([1-9][0-9]*){1,3}|(^[0-9][.][0-9]{1}$)|(^[0-9][.][0-9]{2}$)$/
      if (!reg.test(value)) {
        callback('请输入正确的金额')
      }
      if (Number(value) < 0.1) {
        callback('最低单价为0.10元');
      }
      callback(); 
    }
    //最小粉丝数
    const minFansValue = (rule, value, callback) => {
      //console.log(value)
      if (Number(value) < 2000 && form.postAmtTotal >= 5000 && availableBalance >= 5000) {
        callback('预算超5000，粉丝数最少2000');
      }
      callback();
    }
    const hours = (length) => {
      var res = [];
      for(var i = 0; i <= length; i++) {
        res.push(<Option key={i} value={i}>{i}点</Option>);
      }
      return res;
    };
    const getDict = (data) => {
      let arr = [];
      data.map((item, index) => {
        arr.push(<label key={index}>{item}</label>);
      });
      return arr;
    };
    const dateTip = `<div><p>开始日期不可早于当前日期。</p><p>结束日期不可早于开始日期。</p></div>`
    const timeTip = `<div>
      <p>时段需要有间隔，如果开始时间大于结束时间代表当日，</p>
      <p>如果开始时间小于结束时间代表次日。</p>
      <p>例如：10-11点代表 10：00-11：59。</p>
      <p>22-4点代表22：00-次日04：59。</p>
      <p>开始时间不可等于结束时间。</p>
    </div>`
    
    return(
      <div className={style.mypromotion} id="selectmateriaitems">
        <header className="header-style">
          发布广告
        </header>
        <Modal
          visible={rechargeVisible}
          width={400}
          onCancel={this.closeEvent}
          footer={
            rechargeStep === 0 ? 
            <div>
              <Button type="primary" onClick={this.rechargeEvent.bind(this)}>确定</Button>
            </div> : null
          }
        >
          <RechargeModel
            changeFormEvent={this.bindValue.bind(this)}
            reload={this.reload.bind(this)}
            payUrl={payUrl}
            amount={topup.amount}
            orderNo={orderNo}
            rechargeStep={rechargeStep}
            isVisible={rechargeVisible}
          />
        </Modal>
        <Modal
          visible={areaVisible}
          closable={false}
          width={700}
          onCancel={this.closeEvent.bind(this, 'provinceType')}
          onOk={this.getDictionary.bind(this, 'provinceType')}
        >
          <Dictionary type="provinceType" getIndexTag={this.getIndexTag} tagData={form.targetAreaArray} />
        </Modal>
        <Modal
          visible={tagVisible}
          closable={false}
          width={700}
          onCancel={this.closeEvent.bind(this, 'parent_mediatype')}
          onOk={this.getDictionary.bind(this, 'parent_mediatype')}
        >
          <Dictionary type="parent_mediatype" parent="children"  getIndexTag={this.getIndexTag} tagData={form.targetMediaCategoryArray} />
        </Modal>
        <div className={style['steps']}>
          <Steps current={0}>
            <Step title="选择文案及推广设置" />
            <Step title="待审核" />
            <Step title="开始推广" />
          </Steps>
        </div>
        <div className={style.createBlocks}>
            <Form onSubmit={this.isSubmitEvent} className={style.form} name="form" id="form">
              <div>
                <MateriaInfo
                  saveMateriaEvent={this.saveMateriaEvent}
                  clear={stype}
                  postContent={form.postContent}
                />
                <div className={style.items}>
                  <label className={style.labName} style={{verticalAlign: 'top', marginTop: '10px'}}><i>*</i>活动名称：</label>
                  <div>
                    <Form.Item>
                      {getFieldDecorator(
                        'campaignName',
                        {
                          initialValue: form.campaignName,
                          rules: [
                            {required: true, message: '请输入活动名称'}
                          ]
                        }    
                      )(<Input maxLength={50} className={style.ipttxt} placeholder="请输入活动名称" onChange={this.changeFormEvent.bind(this, 'campaignName')} />)
                      }
                    </Form.Item>
                  </div>
                </div>
                <div className={`mb24 ${style.items}`}>
                  <label className={style.labName} style={{verticalAlign: 'top', marginTop: '10px'}}>定向设定：</label>
                  <ul className={style.target}>
                    <li>
                      <div className={style.cell}>
                        <em className={style.lab}>男女</em>
                        <div className={style.item}>
                          <Radio
                            className={style.radio}
                            value={0}
                            checked={sexType === 0 ? true : false}
                            onChange={this.setMadeEvent.bind(this, 'sexType')}
                          >不限</Radio>
                          <Radio
                            className={style.radio} value={1}
                            checked={sexType === 1 ? true : false}
                            onChange={this.setMadeEvent.bind(this, 'sexType')}
                          >设置比例</Radio>
                        </div>
                        {
                          sexType === 1 ? 
                          <div className={`${style.col}`}>
                            <div className="w80" style={{marginBottom: '24px'}}>
                              <Select value={Number(form.targetGender)} onChange={this.changeFormEvent.bind(this, 'targetGender')}>
                                <Option value={1}>男粉</Option>
                                <Option value={2}>女粉</Option>
                              </Select>
                            </div>
                            <em className="mr10" style={{marginTop: '-25px'}}>></em>
                            <div className="w80">
                            <Form.Item>
                              {getFieldDecorator(
                                'targetGenderScale',
                                {
                                  initialValue: form.targetGenderScale * 100 || null,
                                  rules: [
                                    {required: true, message: '请输入粉丝比例'}
                                  ]
                                }    
                              )(<Input className="w80" onChange={this.changeFormEvent.bind(this, 'targetGenderScale')}/>)
                              } %
                            </Form.Item>
                            </div>
                          </div> : null
                        }
                      </div>
                    </li>
                    <li>
                      <div className={style.cell}>
                        <em>地域</em>
                        <div className={style.item}>
                          <Radio
                            className={style.radio}
                            value={0}
                            checked={areaType === 0 ? true : false}
                            onClick={this.setMadeEvent.bind(this, 'areaType')}
                          >不限</Radio>
                          <Radio
                            className={style.radio}
                            value={1}
                            checked={areaType === 1 ? true : false}
                            onClick={this.setMadeEvent.bind(this, 'areaType')}
                          >选择地域</Radio>
                        </div>
                        {
                          areaType === 1 && provinceName.length > 0 ? 
                          <div className={style.selDicTarget}>
                            {getDict(provinceName)}
                          </div> : null
                        }
                      </div>
                    </li>
                    <li className={style.last}>
                      <div className={style.cell}>
                        <em>类别</em>
                        <div className={style.item}>
                          <Radio
                            className={style.radio}
                            value={0}
                            checked={categoryType === 0 ? true : false}
                            onClick={this.setMadeEvent.bind(this, 'categoryType')}
                          >不限</Radio>
                          <Radio
                            className={style.radio}
                            value={1}
                            checked={categoryType === 1 ? true : false}
                            onClick={this.setMadeEvent.bind(this, 'categoryType')}
                          >公众号类别</Radio>
                        </div>
                        {
                          categoryType === 1 && categoryName.length > 0 ?
                          <div className={style.selDicTarget}>
                            {getDict(categoryName)}
                          </div> : null
                        }
                      </div>
                    </li>
                  </ul>
                </div>
                <div className={`mb24 ${style.items}`}>
                  <label className={style.labName} style={{verticalAlign: 'top', marginTop: '10px'}}>公众号设定：</label>
                  <ul className={`${style.setWx} clearfix`}>
                    <li>
                      <Radio
                        value={1}
                        checked={form.missionLimit === 1 ? true : false}
                        onChange={this.changeFormEvent.bind(this, 'missionLimit')}
                      >每个公众号接过我的相似文案后</Radio>
                      <div className={style.col}>
                        <div className="w120">
                          <Select
                            value={form.missionLimitDay}
                            disabled={form.missionLimit === 1 ? false : true}
                            onChange={this.changeFormEvent.bind(this, 'missionLimitDay')}
                          >
                            <Option value={5}>5</Option>
                            <Option value={7}>7</Option>
                            <Option value={10}>10</Option>
                          </Select> 
                        </div>
                        天内不能再接我的广告
                      </div>
                    </li>
                    <li>
                      <Radio 
                        value={2}
                        checked={form.missionLimit === 2 ? true : false}
                        onChange={this.changeFormEvent.bind(this, 'missionLimit')}
                      >每个公众号只可接本文案一次</Radio>
                    </li>
                  </ul>   
                </div>
                <div className={`mb24 ${style.items}`}>
                  <label className={style.labName} style={{verticalAlign: 'top', marginTop: '10px'}}>投放时间：</label>
                  <ul className={`${style.setDate} clearfix`}>
                    <li>
                      <em className="mt10">
                        <i>*</i>推广日期：
                        <Icon type="question-circle" data-tip={dateTip} data-html={true} className={style['icon']}/>
                      </em>
                      <ReactTooltip html={true}/>
                      <div className="top">
                        <Form.Item>
                          {getFieldDecorator(
                            'date',
                            {
                              initialValue: form.dateStart !== null && form.dateEnd !== null ?  [
                                moment(window.common.getDate(form.dateStart), 'YYYY-MM-DD'), 
                                moment(window.common.getDate(form.dateEnd), 'YYYY-MM-DD')
                              ] : '',
                              rules: [
                                {type: 'array', required: true, message: '请选择推广日期'}
                              ]
                            }
                          )(
                            <RangePicker
                              format="YYYY-MM-DD"
                              disabledDate={this.disabledEndDate}
                              className={style.date}
                              style={{width: '260px'}}
                              ranges={{
                                Today: [moment(), moment()]
                              }}
                              onChange={this.changeFormEvent.bind(this, 'date')}
                            />
                          )
                          }
                        </Form.Item>
                      </div>  
                    </li>
                    <li className={style.last}>
                      <em>
                        发文时段：
                        <Icon type="question-circle" data-tip={timeTip} data-html={true} className={style['icon']} />
                      </em>
                      <div className="inlineb">
                        <Radio
                          value={0}
                          className={style.radio}
                          checked={form.postTimeLimit === 0 ? true : false}
                          onChange={this.changeFormEvent.bind(this, 'postTimeLimit')}
                        >不限</Radio>
                        <Radio
                          value={1}
                          className={style.radio}
                          checked={form.postTimeLimit === 1 ? true : false}
                          onChange={this.changeFormEvent.bind(this, 'postTimeLimit')}
                        >选择时段</Radio>
                        <div className={style.time}>
                          <Select
                            value={form.hourStart}
                            onChange={this.changeFormEvent.bind(this, 'hourStart')}
                            disabled={form.postTimeLimit === 0 ? true : false}
                          >
                            {hours(23)}
                          </Select>
                        </div>
                        <em className="inlineb m5">-</em>
                        <div className={style.time}>
                          <Select
                            value={form.hourEnd}
                            onChange={this.changeFormEvent.bind(this, 'hourEnd')}
                            disabled={form.postTimeLimit === 0 ? true : false}
                          >
                            {hours(23)}
                          </Select>
                        </div>
                      </div>
                    </li>
                  </ul>
                </div>
                <div className={`mb24 ${style.items}`}>
                  <label className={style.labName} style={{verticalAlign: 'top', marginTop: '10px'}}>预算：</label>
                  <div className={style.setPrice}>
                    <ul className="clearfix">
                      <li>
                        <em><i>*</i>单价：</em>
                        <div>
                          <Form.Item>
                            {getFieldDecorator(
                              'unitPrice',
                              {
                                initialValue: form.unitPrice,
                                rules: [
                                  //{pattern: /^([1-9][0-9]*){1,3}|(^[0-9][.][0-9]{1}$)|(^[0-9][.][0-9]{2}$)$/, message: ''},
                                  {validator: minValue}
                                ]
                              }    
                            )(<Input className={style['ipttxt']} onChange={this.changeFormEvent.bind(this, 'unitPrice')}/>)
                            }
                          </Form.Item>
                        </div>
                        元 / 阅读
                      </li>
                      <li>
                        <em><i>*</i>总预算：</em>
                        <div>
                          <Form.Item>
                            {getFieldDecorator(
                              'postAmtTotal',
                              {
                                initialValue: form.postAmtTotal,
                                rules: [
                                  //{required: true, message: '请输入预算金额'},
                                  {validator: maxValue}
                                ]
                              }    
                            )(<Input className={style['ipttxt']} onChange={this.changeFormEvent.bind(this, 'postAmtTotal')}/>)
                            }
                          </Form.Item>
                        </div>
                        元
                      </li>
                      <li className={style.last}>
                        <em>可用金额：</em>
                        <div>
                          <label>{availableBalance}<i>元</i></label>
                          <Button type="primary" className={style.btn} onClick={this.saveMoneyEvent.bind(this)}>充值</Button>
                        </div>
                      </li>
                    </ul>
                    <div className={style.readNum}>预算阅读量：<em>{validReading}</em></div>
                  </div>
                </div>
                <div className={`mb24 ${style.items}`}>
                  <label className={style.labName}>投放位置：</label>         
                  <div className={style.adLocal}>
                    <div>
                      <Select
                        value={form.appArticlePosition}
                        onChange={this.changeFormEvent.bind(this, 'appArticlePosition')}
                      >
                        <Option value={9}>不限</Option>
                        <Option value={1}>头条</Option> 
                        <Option value={2}>二条</Option>
                      </Select>      
                    </div>
                    <em>广告最少保留时间</em>
                    <div>
                      <Select
                        value={form.retentionTime}
                        onChange={this.changeFormEvent.bind(this, 'retentionTime')}
                      >
                        <Option value="24">24小时</Option>     
                        <Option value="48">48小时</Option>
                      </Select>
                    </div>
                  </div>         
                </div>
                <div className={style.dividerLine}><em>预算较大，您还可以设定</em></div>
                <div className={`mb24 ${style.items}`}>
                  <label className={style.labName} style={{verticalAlign: 'top'}}>公众号类型：</label>  
                  <ul className={style.pubType}>
                    <li>
                      <div>
                        <Checkbox
                          checked={checkAll}
                          onChange={this.changeFormEvent.bind(this, 'allcheck')}
                          disabled={(form.postAmtTotal >= 5000 && availableBalance >= 5000) ? false : true}
                        >
                          不限
                        </Checkbox>
                      </div>
                      <Checkbox
                        value={2}
                        checked={appTypeData[1] === 2 ? true : false}
                        onChange={this.changeFormEvent.bind(this, 'appType')}
                        disabled={(form.postAmtTotal >= 5000 && availableBalance >= 5000) ? false : true}
                      >仅投认证服务号</Checkbox>
                      <Checkbox
                        value={1}
                        checked={appTypeData[0] === 1 ? true : false}
                        onChange={this.changeFormEvent.bind(this, 'appType')}
                        disabled={(form.postAmtTotal >= 5000 && availableBalance >= 5000) ? false : true}
                      >仅投认证订阅号</Checkbox>
                      <Checkbox
                        value={-1}
                        checked={appTypeData[2] === -2 ? true : false}
                        onChange={this.changeFormEvent.bind(this, 'verifyType')}
                        disabled={(form.postAmtTotal >= 5000 && availableBalance >= 5000) ? false : true}
                      >仅投未认证号</Checkbox>
                    </li>
                  </ul>
                </div>
                <div className={`mb24 ${style.items}`}>
                  <label className={style.labName} style={{verticalAlign: 'top', marginTop: '10px'}}>粉丝数：</label>   
                  <div className={style.fansNum}>
                    <div className={style.ipt}>
                      <Form.Item>
                        {getFieldDecorator(
                          'fansNumLimit',
                          {
                            initialValue: form.fansNumLimit,
                            rules: [
                              {validator: minFansValue}
                            ]
                          })(<div>大于<Input
                              value={form.fansNumLimit}
                              onChange={this.changeFormEvent.bind(this, 'fansNumLimit')}
                              disabled={(form.postAmtTotal >= 5000 && availableBalance >= 5000) ? false : true}
                            />
                          </div>)
                        }
                      </Form.Item>
                    </div>
                    <ul>
                      <li>
                        只允许同一用户下
                        <div className={style.col}>
                          <Select
                            value={form.userAppNumLimit}
                            onChange={this.changeFormEvent.bind(this, 'userAppNumLimit')}
                            disabled={(form.postAmtTotal >= 5000 && availableBalance >= 5000) ? false : true}
                          >
                            <Option value={null}>不限</Option>
                            <Option value={3}>3</Option>
                            <Option value={5}>5</Option>
                            <Option value={10}>10</Option>
                          </Select>
                        </div>个公众号接单
                      </li>
                      <li>
                        只允许接过
                        <div className={style.col}>
                          <Select
                            value={form.appMissionNumLimit}
                            onChange={this.changeFormEvent.bind(this, 'appMissionNumLimit')}
                            disabled={(form.postAmtTotal >= 5000 && availableBalance >= 5000) ? false : true}
                          >
                            <Option value={null}>不限</Option>
                            <Option value={3}>3</Option>
                            <Option value={5}>5</Option>
                            <Option value={10}>10</Option>
                          </Select>
                        </div>单以内的公众号接单
                      </li>    
                    </ul>    
                  </div>
                </div>
                <div className={`mb24 ${style.items}`}>
                  <label className={style.labName} style={{verticalAlign: 'top', marginTop: '10px'}}>备注要求：</label>         
                  <div className={style.describe}>
                    <TextArea
                      rows={4}
                      className={style.txtA}
                      placeholder="请输入备注信息"
                      value={form.remarks}
                      disabled={(form.postAmtTotal >= 5000 && availableBalance >= 5000) ? false : true}
                      onChange={this.changeFormEvent.bind(this, 'remarks')}
                    />
                  </div>
                </div>
              </div>
              <Form.Item className={style['btnItem']}>
                  <Button type="primary" htmlType="submit" onClick={(e) => this.isSubmitEvent(e)} className={`${style.btn} ml30`} disabled={isDisabled}>提交审核</Button>
                  <Button className="ml30" onClick={this.clearEvent.bind(this)}>清空设置</Button>
                  <Modal
                    visible={isSubmit}
                    width={350}
                    closable={false}
                    onOk={this.createEvent.bind(this)}
                    onCancel={this.closeEvent.bind(this)}
                  >
                    {
                      stype === 'clear' ?
                        <div className={style['submitBox']}>
                          <h1><Icon type="info-circle" theme="filled" className={style['icon']}/>确认清空设置条件</h1>
                          <p>该操作将清空当前页面所有设置对全部，</p>
                          <p>推广设计条件和内容</p>
                        </div> :
                        <div className={style['submitBox']}>
                          <h1><Icon type="info-circle"theme="filled"  className={style['icon']}/>确认要提交本条推广</h1>
                          <p>我们将快马加鞭审核您推广广告，</p>
                          <p>且提交审核该推广将不能修改</p>
                        </div>
                    }
                  </Modal>
              </Form.Item>
            </Form>
        </div>
      </div>
    );
  }
}
export default Form.create()(CreateAdvertity);
