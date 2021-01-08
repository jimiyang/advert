import React, { Component } from "react";
class List extends Component {
    constructor(props) {
        super(props);
        this.state = {
          value: []
        };
    }
    componentWillMount() {
      this.setState({
        value: this.props.location.query.value
      });
    }
    componentWillReceiveProps(props) {
      this.setState({
        value: props.location.query.value
      });
    }
    render() {
      return ( 
        <div>
          <ul><li>跳转成功{this.state.value}</li></ul>
        </div>
      );
    }
}
export default List;