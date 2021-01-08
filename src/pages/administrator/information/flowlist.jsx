import React, {Component} from 'react'
import style from '../style.less'
import MerchantList from './merchantlist' //商户列表
class FlowList extends Component{
  constructor(props) {
    super(props)
    this.state = {
      adData: [],
      operatorLoginName: '',
      isAddVisible: false,
      search: {
        merchantName: null,
        merchantCode: null,
        status: null,
        type: 2 //流量主类型
      },
      pagination: {
        size: 'small',
        showQuickJumper: true,
        showSizeChanger: true,
        total: 0,
        currentPage: 1,
        current: 1,
        limit: 10,
        onChange: this.changePage,
        onShowSizeChange: this.onShowSizeChange
      },
      addForm: {
        merchantName: null,
        contactName: null,
        mobile: null,
        loginName: null,
        password: null
      }
    }
  }
  render() {
    return (
      <div className={style.administrator}>
        <header className="header-style">流量主商户列表</header>
        <MerchantList type={2} />  
      </div>
    )
  }
}
export default FlowList