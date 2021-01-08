import React, {Component} from 'react'
import {Icon, message} from 'antd'
import style from '@/pages/public/authentication/index.less'
class ViewPic extends Component {
  constructor(props) {
    super(props)
    this.state = {
      current: 0,
      visible: false
    }
  }
  async componentDidMount() {
    await this.setState({
      visible: this.props.isImgVisible
    })
  }
  componentWillReceiveProps(nrops) {
    this.setState({
      visible: nrops.isImgVisible,
      current: 0,
      mt: 24
    })
  }
  //旋转图片
  roateEvent = () => {
    let current = this.state.current
    current = (current + 90) % 360
    this.setState({current, mt: current === 90 || current === 270 ? 190 : 24})
  }
  //下载图片
  downEvent = () => {
    let src = this.props.imgUrl,
        canvas = document.createElement('canvas'),
        img = document.createElement('img');
    const cDate = new Date()
    const time = cDate.getFullYear() + String(cDate.getMonth() + 1)+ String(cDate.getDate()) + String(cDate.getHours())
    img.onload = function(e) {
      canvas.width = img.width;
      canvas.height = img.height;
      var context = canvas.getContext('2d');
      context.drawImage(img, 0, 0, img.width, img.height);
      canvas.getContext('2d').drawImage(img, 0, 0, img.width, img.height);
      canvas.toBlob((blob)=>{
        let link = document.createElement('a');
        link.href = window.URL.createObjectURL(blob);
        link.download = time; 
        link.click();  
      }, "image/jpeg");
      message.success('图片下载成功')
    }
    img.setAttribute("crossOrigin",'Anonymous');
    img.src = src;
  }
  closeEvent = () => {
    this.setState({visible: false})
    this.props.closeEvent()
  }
  render() {
    const {current, visible, mt} = this.state
    return(
      <div className={`style['pic']  ${visible === true ? '' : 'hide'}`}>
        <div className={style['pic-mask']}></div>
        <div className={`${style['pic-close']} ${current === 90 || current === 270 ? style['pic-closey'] : style['pic-closex']}`}>
          <Icon
            type="close-circle"
            theme="filled"
            className={style['ico']}
            onClick={() => this.closeEvent()}
          />
        </div>
        <div className={`${style['pic-content']} ${style['pic-xw']}`} style={{transform: `rotate(${current}deg)`, marginTop: mt + 'px'}}>
          <div className={style['img']} >
            <img src={this.props.imgUrl} />
          </div>
        </div>
        <div className={`${style['pic-btn']} ${(current === 90 || current === 270) ? style['pic-yt'] : style['pic-xt']}`}>
          <div>
            <span onClick={() => this.roateEvent()}><Icon type="retweet" />旋转</span>
            <span onClick={() => this.downEvent()}><Icon type="download" />下载</span>
          </div>
        </div>
      </div>
    )
  }
}
export default ViewPic