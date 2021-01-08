import React, {Component} from 'react'
import { Checkbox } from 'antd'
import {
  getDictByType
} from '@/api/api'
let num = 1;
const CheckboxGroup = Checkbox.Group;
class Dictionary extends Component {
  constructor(props) {
    super(props);
    this.state = {
      type: 'parent_mediatype',
      checkedList: [],
      mediaTypeLabel: [],
      selmediaValData: [],
      flag: false,
      checkAll: [],
      parent: null
    };
  }
  componentDidMount() {
    this.loadData(this.props.type);
    const checkedList = this.props.type === 'parent_mediatype' && this.props.parent === 'children' ? this.echoData(this.props.tagData) : this.props.tagData
    this.setState({
      checkedList,
      type: this.props.type,
      parent: this.props.parent
    });
  }
  componentWillReceiveProps(nextProps) {
    if(num < 2) {//首次进入为1
      this.setState({type: nextProps.type, parent: nextProps.parent});
      this.loadData(nextProps.type);
      num++;
    }
    if (nextProps.atype !== 'account') {
      this.setState({
        checkedList: nextProps.tagData
      });
    }
  }
  echoData = (data) => {
    let arr = [[], [], [], [], [], []]
    if (data.length > 0) {
      data.map(item => {
        //console.log(item.substr(0, 1))
        let index = Number(item.substr(0, 1)) - 1
        arr[index].push(item)
      })
    }
    return arr
  }
  loadData = async (type) => {
    await getDictByType({type}).then(rs => {
      if (rs.success) {
        this.setState({mediaTypeLabel: rs.data, selmediaValData: new Array(rs.data.length)});
        num = 2;
      }
    });
  }
  //选择
  selTagEvent = (item) => {
    this.setState({
      checkedList: item
    });
    num = 2;
    this.props.getIndexTag(item, this.state.mediaTypeLabel, this.props.type);
  }
  getLabelEvent = (item, index) => {
    let checkedList = this.state.checkedList;
    checkedList[index] = item;
    this.setState({
      checkedList
    });
    num = 2;
    this.props.getIndexTag(this.state.checkedList, this.state.mediaTypeLabel, this.props.type);
  }
  render() {
    let {mediaTypeLabel, checkedList, type, parent} = this.state;
    //console.log(this.state.checkedList)
    //console.log(this.props.tagData)
    checkedList = this.props.tagData
    return (
      <div className="tags">
        <h1 className="title">{type === 'provinceType' ? '请选择需要推广地域' : '请选择需要推广的公众号类别'}</h1>
          {
            type === 'provinceType' ?
            <CheckboxGroup
              options={mediaTypeLabel}
              value={checkedList}
              onChange={e => this.selTagEvent(e)}
            /> :
            this.state.parent === 'children' && this.state.parent !== null ? 
              <dl className="dict-list">
                {
                  mediaTypeLabel.map((item, index) => (
                    <dd key={index}>
                      <h2>{item.label}</h2>
                      <CheckboxGroup
                        options={item.dictChildList}
                        value={checkedList[index]}
                        onChange={(e) => this.getLabelEvent(e, index)}
                      />
                    </dd>
                  ))
                }
              </dl> : 
              <CheckboxGroup
                options={mediaTypeLabel}
                value={checkedList}
                onChange={e => this.selTagEvent(e)}
              />
          }
      </div>
    );
  }
}
export default Dictionary;
