import React, {Component} from 'react'
import {Button, Modal, message, Popconfirm} from 'antd'
import style from '../style.less'
import {
  queryDetailsByAppId,
  batchAuditWechatAccount,
  saveOrUpdateTag
} from '@/api/api'
import Dictionary from  '@/components/dictionary' //字典标签
import Dict from '@/components/Dict' //字典标签
const dict = new Dict()
class ViewDetail extends Component {
  constructor(props) {
    super(props)
    this.state = {
      activeIndex: 1,
      form: {
        targetMediaCategory: [], //行业标签
        targetArea: [], //地域
      },
      campaignId: null,
      type: 0,//判断是查看活动页面[0]还是审核接单页面[1]
      missionData: [],
      pagination: {
        size: 'small',
        showSizeChanger: true,
        total: 0,
        currentPage: 1,
        limit: 5,
        pageSize: 5,
        onChange: this.changePage,
        onShowSizeChange: this.onShowSizeChange
      },
      provinceData: [],
      mediaData: [],
      areaVisible: false,
      tagVisible: false,
      selAreaData: [],
      selCategoryData: []
    }
  }
  async componentDidMount() {
    const state = this.props.location.state
    if (!state.appId) return false
    await this.setState({
      appId: state.appId
    })
    this.initForm()
  }
  initForm = () => {
    let {appId, form} = this.state
    const params = {
      appId
    }
    queryDetailsByAppId(params).then(rs => {
      if (rs.success) {
        form = Object.assign(form, rs.data)
        dict.loadData('provinceType', form.targetAreaList).then(res => {
          this.setState({selAreaData: res})
        })
        dict.loadData('parent_mediatype', form.wechatAccountTypeList).then(res => {
          this.setState({selCategoryData: res})
        })
        this.setState({form})
      }
    })
  }
  changePage = (page) => {
    page = page === 0 ? 1 : page
    const pagination = Object.assign(this.state.pagination, {currentPage: page})
    this.setState({pagination})
    this.loadList()
  }
  //改变每页条数事件
  onShowSizeChange = (current, size) => {
    let p = this.state.pagination
    p = Object.assign(p, {currentPage: current, limit: size, pageSize: size})
    this.setState({pagination: p})
    this.loadList()
  }
  changeFormEvent = (type, e) => {
    const params = Object.assign(this.state.params, {[type]: e.target.value})
    this.setState({params})
  }
  checkEvent = (appId) => {
    const params = {
      appIdList: [appId]
    }
    batchAuditWechatAccount(params).then(rs => {
      if(rs.success) {
        message.success(rs.message)
        window.history.go(-1)
      }
    })
  }
  //关闭充值弹层
  closeEvent = () => {
    this.setState({tagVisible: false, areaVisible: false});
  }
  //打标签
  updateTag = (type) => {
    const {form} = this.state
    const obj = type === 2 ? {wechatAccountTypeList: form.targetMediaCategory} : {targetAreaList: form.targetArea}
    const params = {
      appIdList: [form.appId],
      ...obj,
      tagType: type
    }
    saveOrUpdateTag(params).then(rs => {
      if (rs.success) {
        message.success(rs.message)
        document.location.reload()
      }
    })
  }
  getDictionary = (type) => {
    const {form, dictData} = this.state;
    let arr = [], obj = {};
    let arr2 = type === 2 ? form.targetMediaCategory : form.targetArea
    arr2.map(item => {
      dictData.map(node => {
        if (item === node.value) {
          arr.push(node.label);
        }
      });
    });
    if (type === 2) {
      obj = {selCategoryData: arr, tagVisible: false};
    } else {
      obj = {selAreaData: arr, areaVisible: false};
    }
    this.setState({...obj});
    this.updateTag(type)
  } 
  //选择标签
  getIndexTag = (item, data, type) => {
    let form = this.state.form;
    const tagType = type === 'parent_mediatype' ? 'targetMediaCategory' : 'targetArea';
    form = Object.assign(form, {[tagType]: item});
    this.setState({form, dictData: data});
  }
  setTargetEvent = (type) => {
    let form = this.state.form, obj
    switch (type) {
      case 1:
        obj = {areaVisible: true};
      break;
      case 2:
        obj = {tagVisible: true};
      break;
    }
    this.setState({...obj, form});
  }
  componentWillUnmount () {
    this.setState = (state, callback) => {
      return;
    };
  }

  render() {
    const {
      form,
      selAreaData,
      selCategoryData,
      areaVisible,
      tagVisible
    } = this.state
    return (
      <div className={style.administrator}>
        <header className="header-style">公众号详情</header>
        <Modal
          visible={areaVisible}
          width={700}
          onCancel={this.closeEvent}
          onOk={() => this.getDictionary(1)}
        >
          <Dictionary type="provinceType" atype="account" getIndexTag={this.getIndexTag} tagData={form.targetAreaList} />
        </Modal>
        <Modal
          visible={tagVisible}
          width={500}
          onCancel={this.closeEvent}
          onOk={() => this.getDictionary(2)}
        >
          <Dictionary type="parent_mediatype" atype="account"  parent="parent" getIndexTag={this.getIndexTag} tagData={form.wechatAccountTypeList} />
        </Modal>
        <ul className={style.detaillist}>
          <li><em>公众号：</em><div>{form.nickName}</div></li>
          <li><em>公众号状态：</em><div>{Number(form.verifyTypeInfo) === -1 ? '未认证' : '已认证'}</div></li>
          <li><em>授权时间：</em><div>{window.common.getDate(form.authDate, true)}</div></li>
          <li><em>审核状态：</em><div>{window.common.weChatstatus[form.status - 1]}</div></li>
          <li><em>商户编号：</em>
            {
              form.company !== undefined ?
              <div>
                {form.company.map((item, index)=> (
                  (index === form.company.length - 1) ?
                  <label key={index}>{item.companyName}({item.agencyCode})</label>
                  :
                  <label key={index}>{item.companyName}({item.agencyCode})、</label>
                ))}
              </div>
              : null
            }
          </li>
          <li><em>类型：</em><div>{Number(form.serviceTypeInfo) === 0 || Number(form.serviceTypeInfo) === 1 ? '订阅号' : '服务号'}</div></li>
          <li><em>认证信息：</em><div>{form.principalName}</div></li>
          <li><em>粉丝量：</em><div>{form.userTotal}</div></li>
          <li><em>月发文数：</em><div>{form.totalMsgIdCount}</div></li>
          <li><em>平均阅读：</em><div>{form.avgTotalReadUser}</div></li>
          <li><em>地域：</em>
            <div className={style['box']}>
              {
                selAreaData.length === 0 ? '不限制' : selAreaData.join(',')
              }
            </div>
            <Button className={style.setBtn} onClick={() => this.setTargetEvent(1)}>设置标签</Button>
          </li>
          <li><em>公众号分类：</em>
              <div className={style['box']}>
                {
                  selCategoryData.length === 0 ? '不限制' : selCategoryData.join(',')
                }
              </div>
              <Button className={style.setBtn} onClick={() => this.setTargetEvent(2)}>设置标签</Button>
          </li>
          <li><em>男粉：</em><div>{form.manUserRatio}%</div></li>
          <li><em>女粉：</em><div>{form.woManUserRatio}%</div></li>
          <li><em>未知：</em><div>{form.noUserRatio}%</div></li>
          <li style={{width: '100%'}} className="block g-tc">
            <div className="g-tc">
              {
                Number(form.status) === 1 ? 
                <Popconfirm
                  title="确认要【通过】这条信息吗?"
                  onConfirm={() => this.checkEvent(form.appId)}
                  okText="是"
                  cancelText="否"
                >
                  <Button style={{marginLeft: '100px'}} type="primary" className="ml30" >审核通过</Button>
                </Popconfirm> : null
              }
              <Button
                className="ml30"
                onClick={() => {window.history.go(-1)}}
              >返回</Button>
            </div>
          </li>
        </ul>
      </div>
    ) 
  }
}
export default ViewDetail