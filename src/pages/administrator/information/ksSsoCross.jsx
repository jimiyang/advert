import React, { Component } from 'react';
class ksSSo extends Component {
  constructor(props) {
    super(props)
    this.state = {
      height: null
    }
  }
  componentDidMount() {
    const height = document.body.offsetHeight - 130
    this.setState({height})
  }
  render() {
    const token = window.localStorage.getItem('token')
    return(
      <div id="content">
        <header className="header-style">客商提现</header>
        <div style={{height: this.state.height}}>
          <iframe style={{width: '100%', height: '100%', border: 'none'}} src={`${window.common.hostName}/ksSsoCross/?token=${token}`}></iframe>
        </div>
      </div>
    )
  }
}
export default ksSSo