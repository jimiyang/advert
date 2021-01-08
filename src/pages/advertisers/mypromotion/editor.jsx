import React, {Component} from 'react';
import style from './style.less';
class Editor extends Component {
  constructor(props) {
    super(props);
    this.state = {
      id: null,
      iframeHeight: 800,
      employeeId: null,
      merchantCode: null,
      type: 'materiallist',
      loginName: null,
      activityId: null
    };
  }
  componentDidMount() {
    const state = this.props.location.state;
    if (state) {
      this.setState({id: state.id, type: state.type, activityId: state.activityId});
    }
    const loginInfo = JSON.parse(window.localStorage.getItem('login_info'));
    this.setState({
      iframeHeight: document.documentElement.clientHeight - 130,
      employeeId:  loginInfo.data.employeeId,
      merchantCode: loginInfo.data.merchantCode,
      loginName: loginInfo.data.loginName
    });
  }
  render() {
    const {
      id,
      iframeHeight,
      employeeId,
      merchantCode,
      type,
      loginName,
      activityId
    } = this.state;
    let params;
    if (id !== undefined) {
      params = `merchantCode=${merchantCode}&id=${id}&userId=${employeeId}&lttType=${type}&loginName=${loginName}`;
    } else if (activityId !== undefined){
      params = `merchantCode=${merchantCode}&userId=${employeeId}&lttType=${type}&loginName=${loginName}&activityId=${activityId}`;
    } else {
      params = `merchantCode=${merchantCode}&userId=${employeeId}&lttType=${type}&loginName=${loginName}`;
    }
    //console.log(params)
    return (
      <div className={style.mypromotion}>
        <div className={style.content}>
          <iframe className={style.iframe} src={`${window.common.articleUrl}/fshstatic/editor.html?${params}`} height={iframeHeight}></iframe>
        </div>
      </div>
    );
  }
}
export default Editor;