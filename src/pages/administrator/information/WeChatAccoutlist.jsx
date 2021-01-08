import React, { Component } from 'react'
import { Input, Button, Table, message, Popconfirm, Modal ,Tooltip, Icon, Popover, notification} from 'antd'
import style from '../style.less'
import Link from 'umi/link'
import Dictionary from '@/components/dictionary' //字典标签
import {
  accountList,
  listReadCnt,
  batchAuditWechatAccount,
  saveOrUpdateTag,
  updateAppBlackStatus,
  checkIsBlack
} from '@/api/api'
class TaskList extends Component {
  constructor(props) {
    super(props)
    this.state = {
      loginName: null,
      search: {
        nickName: null,
        isBlack: null
      },
      pagination: {
        size: 'small',
        pageSize: 10, //每页显示多少条
        currentPage: 1,
        current: 1,
        total: 0,
        showSizeChanger: true,
        onChange: this.changePage,
        onShowSizeChange: this.onShowSizeChange
      },
      activityData: [],
      selectedRowKeys: [],
      allchk: false,
      ischecked: [],
      isDisabled: false,
      isSubmit: false,
      placement: 'right',
      isVisible: false,
      missionTotal: 0,
      missionNotRelease: 0,
      readData: [],
      areaVisible: false,
      tagVisible: false,
      form: {
        targetMediaCategory: [], //行业标签
        targetArea: [], //地域
      },
      loading: false,
      blackData: [
        {id: null, name: '全部' },
        {id: 0, name: '白名单' },
        {id: 1, name: '黑名单' },
      ]
    }
  }
  async componentDidMount() {
    const loginInfo = JSON.parse(window.localStorage.getItem('login_info'))
    //console.log(loginInfo)
    await this.setState({ loginName: loginInfo.data.loginName })
    this.loadList()
  }
  loadList = async () => {
    let { pagination, search } = this.state
    const params = {
      ...search,
      limit: pagination.pageSize,
      currentPage: pagination.currentPage,
      current: pagination.currentPage
    }
    this.setState({ loading: true })
    //console.log(params)
    await accountList(params).then(rs => {
      this.setState({ loading: false })
      if (rs.success) {
        const p = Object.assign(pagination, { total: rs.data.totalNum })
        this.setState({ activityData: rs.data.items, pagination: p })
      }
    })

  }
  getSettleData = (data) => {
    let arr = []
    if (data !== undefined || data.length !== 0) {
      data.map((item) => {
        if (item.missionStatus === 13) {
          arr.push(item)
        }
      })
    }
    return arr
  }
  changePage = (page) => {
    page = page === 0 ? 1 : page
    const pagination = Object.assign(this.state.pagination, { currentPage: page, current: page })
    this.setState({ pagination, ischecked: false, allchk: false })
    this.loadList()
  }
  //改变每页条数事件
  onShowSizeChange = (current, size) => {
    let p = this.state.pagination
    p = Object.assign(p, { currentPage: current, current, pageSize: size })
    this.setState({ pagination: p, ischecked: false, allchk: false })
    this.loadList()
  }
  changeFormEvent = (e, type, value) => {
    let search = this.state.search
    let obj = {}
    switch (type) {
      case 'nickName':
        obj = { [type]: e.target.value }
        break
      default:
        obj = { [type]: e.target.value }
        break
    }
    search = Object.assign(search, obj)
    //console.log(search)
    this.setState({ search })
  }
  searchEvent = () => {
    const pagination = Object.assign(this.state.pagination, { currentPage: 1, current: 1 })
    this.setState({ pagination })
    this.loadList()
  }
  clearEvent = () => {
    let search = this.state.search
    search = Object.assign(
      search,
      {
        nickName: null,
        isBlack: null
      }
    )
    const pagination = Object.assign(this.state.pagination, { currentPage: 1, current: 1 })
    this.setState({ search, pagination })
    this.loadList()
  }
  viewDataEvent = (item) => {
    const { loginName } = this.state
    const params = {
      limit: 10,
      loginName,
      missionId: item.missionId
    }
    listReadCnt(params).then(rs => {
      if (rs.success) {
        this.setState({ readData: rs.data, isVisible: true })
      }
    })
  }
  onSelectChange = selectedRowKeys => {
    this.setState({ selectedRowKeys });
  };
  batchAudit = (params) => {
    const { selectedRowKeys } = this.state
    batchAuditWechatAccount(params).then(rs => {
      if (rs.success) {
        message.success(rs.data)
        this.setState({
          selectedRowKeys: []
        })
        selectedRowKeys.length = 0
        this.loadList()
      }
    })
  }
  getCheckIsBlack = async (appIdList) => {
    let flag = false
    await checkIsBlack({appIdList}).then(rs => {
      if(rs.success && rs.data) {
        this.info()
        flag = true
      }
    })
    return flag
  }
  info = (isSingle) => {
    const title = isSingle === 'y' ? '无法审核该公众号' : '无法批量审核公众号'
    const content = isSingle === 'y' ? '当前公众号已被加入黑名单，无法审核，请先将该公众号移出黑名单再审核' : '批量选择的公众号中包含黑名单公众号，请先将公众号移出黑名单或在批量选择中取消选择黑名单公众号'
    Modal.error({
      title,
      content: (
        <div className="f12">
          <p>{content}</p>
        </div>
      ),
      onOk() {},
      okText:'我知道了'
    });
  }
  //批量审核
  checkEvent = () => {
    const { selectedRowKeys } = this.state
    if (selectedRowKeys.length === 0) {
      message.error('请选择要审核的公众号')
      return false
    } else {
      this.getCheckIsBlack(selectedRowKeys).then(rs => {
        if(!rs) {
          const params = {
            appIdList: selectedRowKeys
          }
          this.batchAudit(params)
        }
      })
    }
  }
  //单条审核
  singlecheckEvent = (appId, isBlack) => {
    if (isBlack === 1) {
      this.info('y')
      return false
    }
    this.batchAudit({appIdList: [appId]})
  }
  openNotification = (isBlack, str)=>{
    //使用notification.success()弹出一个通知提醒框 
    notification.open({
      message: (<span className="f14">公众号{isBlack === 0 ? '移出' : '加入'}黑名单设置完成</span>),
      description: str,
      duration: 5, //1秒
      icon: <Icon type="info-circle" theme="filled" className="purple-color" />
    })
  }
  //移除和加入黑名单
  accountBlackEvent = (isBlack) => {
    const { selectedRowKeys } = this.state
    const content = isBlack === 0 ? '请选择要移出黑名单的公众号' : '请选择要加入黑名单的公众号'
    if (selectedRowKeys.length === 0) {

      message.error(content)
      return false
    }
    const params = {
      appIdList: selectedRowKeys,
      isBlack
    }
    updateAppBlackStatus(params).then(rs => {
      if(rs.success) {
        const str = (<span className="f12">
            成功<em className="purple-color m5 bold">{rs.data.successNum}</em>个, 
            失败<em className="purple-color m5 bold">{rs.data.failureNum}</em>个
          </span>)
        this.openNotification(isBlack, str)
        this.setState({
          selectedRowKeys: []
        })
        selectedRowKeys.length = 0
        this.loadList()
      }
    })
    //console.log(params)
  } 
  setTargetEvent = (type, item) => {
    let form = this.state.form, obj, obj2 = {}
    //console.log(type)
    switch (type) {
      case 1:
        obj = { areaVisible: true }
        obj2 = { targetArea: item.targetAreaList }
        break;
      case 2:
        obj = { tagVisible: true };
        obj2 = { targetMediaCategory: item.wechatAccountTypeList }
        break;
    }
    form = Object.assign(form, obj2, { appId: item.appId })
    this.setState({ ...obj, form });
    //console.log(form.targetMediaCategory)
  }
  //打标签
  updateTag = (type) => {
    const { form } = this.state
    const obj = type === 2 ? { wechatAccountTypeList: form.targetMediaCategory } : { targetAreaList: form.targetArea }
    const params = {
      appIdList: [form.appId],
      ...obj,
      tagType: type
    }
    saveOrUpdateTag(params).then(rs => {
      if (rs.success) {
        message.success(rs.message)
        //document.location.reload()
        this.loadList();
      }
    })
  }
  //选择标签
  getIndexTag = (item, data, type) => {
    let form = this.state.form;
    const tagType = type === 'parent_mediatype' ? 'targetMediaCategory' : 'targetArea';
    form = Object.assign(form, { [tagType]: item });
    this.setState({ form, dictData: data });
  }
  getDictionary = (type) => {
    //console.log(type)
    const { form, dictData } = this.state;
    let arr = [], obj = {};
    let arr2 = type === 2 ? form.targetMediaCategory : form.targetArea
    //console.log(arr2)
    arr2.map(item => {
      dictData.map(node => {
        if (item === node.value) {
          arr.push(node.label);
        }
      });
    });
    if (type === 2) {
      obj = { selCategoryData: arr, tagVisible: false };
    } else {
      obj = { selAreaData: arr, areaVisible: false };
    }
    this.setState({ ...obj });
    this.updateTag(type)
  }

  closeEvent = () => {
    this.setState({ isVisible: false, areaVisible: false, tagVisible: false })
  }
  selTagEvent = (isBlack) => {
    let search = this.state.search
    search = Object.assign(search, {isBlack})
    this.setState({search}, () => {
      this.loadList()
    })
  }
  
  render() {
    const {
      search,
      activityData,
      pagination,
      isDisabled,
      areaVisible,
      tagVisible,
      form,
      loading,
      blackData
    } = this.state
    const content = (
      <ul className={style['select-txt']}>
        {
          blackData.map((item, index) => (
            <li className="cur" key={index} onClick={() => this.selTagEvent(item.id)}>{item.name}</li>
          ))
        }
      </ul>
    )
    const columns = [
      {
        title: (
          <div>
            公众号
            <Popover placement="bottom" content={content} trigger="click">
              <Icon type="funnel-plot" theme="filled" className="cur m5 f14" />
            </Popover>
          </div>),
        key: 'headImg',
        render: (record) => (
          <div>
            <img src={record.headImg} style={{ width: '60px', height: '60px' }} />
            <span className="ml10">
              {record.nickName}
              {
                Number(record.isBlack) === 1 ? 
                <Tooltip title="平台黑名单账号，所有商户下的广告均不可接">
                  <Icon type="exclamation-circle" className="red-color ml10"/> 
                </Tooltip>
                : '' 
              }
            </span>
          </div>
        )
      },
      {
        title: '授权时间',
        key: 'authDate',
        render: (record) => (
          <div>
            {window.common.getDate(record.authDate, true)}
          </div>
        )
      },
      {
        title: '类型',
        key: 'serviceTypeInfo',
        render: (record) => (
          <div>
            {Number(record.serviceTypeInfo) === 0 || Number(record.serviceTypeInfo) === 1 ? '订阅号' : '服务号'}
          </div>
        )
      },
      {
        title: '认证信息',
        key: 'verifyTypeInfo',
        render: (record) => (
          <div>
            {record.verifyTypeInfo === -1 ? '未认证' : '已认证'}
          </div>
        )
      },
      {
        title: '粉丝量',
        key: 'userTotal',
        render: (record) => (
          <div>
            {record.userTotal ? record.userTotal : <Tooltip placement="top" title={'由于微信限制，未认证号请到微信后台查看粉丝数'}>
              {record.appTotalUserCnt ? record.appTotalUserCnt : '--'}
            </Tooltip>}
          </div>
        )
      },
      {
        title: '状态',
        key: 'missionReadCnt',
        render: (record) => (
          <div>
            {window.common.weChatstatus[Number(record.status) - 1]}
          </div>
        )
      },
      {
        title: '操作',
        key: 'adEstimateCost',
        width: 120,
        render: (record) => (
          <div>
            <span className="block purple-color cur" onClick={() => this.setTargetEvent(1, record)}>设置地域</span>
            <span className="block purple-color cur" onClick={() => this.setTargetEvent(2, record)}>设置分类</span>
            {
              Number(record.status) === 1 ?
                <Popconfirm
                  title="确认要【通过】这条信息吗?"
                  onConfirm={() => this.singlecheckEvent(record.appId, record.isBlack)}
                  okText="是"
                  cancelText="否"
                >
                  <span className="block purple-color cur">审核通过</span>
                </Popconfirm> : null
            }
            <Link to={{ pathname: '/accountView', state: { appId: record.appId } }}>详情</Link>
          </div>
        )
      }
    ]
    const rowSelection = {
      onChange: this.onSelectChange
    };
    const height = document.body.offsetHeight - 130 - 250
    //console.log(height)
    return (
      <div className={style.administrator}>
        <header className="header-style">公众号列表</header>
        <Modal
          visible={areaVisible}
          width={700}
          onCancel={this.closeEvent}
          onOk={() => this.getDictionary(1)}
        >
          <Dictionary type="provinceType" atype="account"  getIndexTag={this.getIndexTag} tagData={form.targetArea} />
        </Modal>
        <Modal
          visible={tagVisible}
          width={500}
          onCancel={this.closeEvent}
          onOk={() => this.getDictionary(2)}
        >
          <Dictionary type="parent_mediatype"  atype="account" parent="parent" getIndexTag={this.getIndexTag} tagData={form.targetMediaCategory} />
        </Modal>
        <ul className={style.search}>
          <li>
            公众号名称
            <Input className={style['ml10']} value={search.nickName}  onChange={(e) => this.changeFormEvent(e, 'nickName')} />
          </li>
          <li>
            <Button type="primary" onClick={() => this.searchEvent()}>查询</Button>
            <Button className="ml10" onClick={() => this.clearEvent()}>重置</Button>
          </li>
        </ul>
        <div className={style.all}>
          <Button className="mr10" onClick={() => this.accountBlackEvent(1)}>加入黑名单</Button>
          <Button type="primary" className="mr10" onClick={() => this.accountBlackEvent(0)}>移出黑名单</Button>
          <Popconfirm
            title="是否批量审核公众号?"
            onConfirm={() => this.checkEvent()}
            okText="是"
            cancelText="否"
          >
            <Button type="primary" disabled={isDisabled}>批量审核公众号</Button>
          </Popconfirm>
        </div>
        <Table
          dataSource={activityData}
          columns={columns}
          pagination={pagination}
          rowSelection={rowSelection}
          rowKey={record => record.appId}
          loading={loading}
          scroll={{y: height}}
          className="mt20"
        />
      </div>
    )
  }
}
export default TaskList