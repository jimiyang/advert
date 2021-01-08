import React, {Component} from 'react';
import {Icon, Tooltip, Popover, Modal} from 'antd';
import style from './style.less'
import QRCode from 'qrcode.react'; //二维码
import Materia from './selectmateria' //弹层 文章列表
import {
  articleList,
  getArticleById
} from '@/api/api';//接口地址
let num = 1
class MateriaInfo extends Component {
  constructor(props) {
    super(props)
    this.state = {
      isHide: true,
      form: {
        postContent: null
      }
    }
  }
  async componentDidMount() {
    await this.setState({
      stype: this.props.clear
    })
  }
  componentWillReceiveProps(nprops) {
    this.setState({stype: nprops.clear, postContent: nprops.postContent})
    if (this.state.stype === 'clear') {
      num = 2
      let form = Object.assign(this.state.form, {
        postContent: undefined,
        impImage: null,
        postUrl: undefined,
        extrendJson: undefined
      })
      this.setState({
        form
      })
    }
    if (this.props.postContent !== nprops.postContent) {
      //console.log(nprops.postContent)
      this.initForm(nprops.postContent)
    }
  }
  initForm = (id) => {
    getArticleById({id}).then(rs => {
      if (rs.success) {
        let f = Object.assign(this.state.form, {
          impImage: rs.data.thumbMediaUrl,
          postContent: rs.data.id,
          postUrl: rs.data.contentSourceUrl,
          extrendJson: rs.data.title
        })
        this.setState({
          mInfo: rs.data,
          form: f
        })
      }
    })
  }
  //选择素材
  showMateriaList = async () => {
    //console.log(num, this.state.stype)
    const rs = await articleList()
    let form = this.state.form
    if (rs.success) {
      if (form.impImage === null && this.state.stype === 'clear') {
        form = Object.assign(form, {impImage: null})
      }
      this.setState({isMateriaShow: true, stype: 'save', count: rs.data.totalNum, form})
    }
   // this.props.showMateriaList()
  }
  //获取素材信息
  getMateriaInfoEvent = (item) => {
    num = 1
    this.setState({mInfo: item})
  }
  //保存素材
  saveMateriaEvent = () => {
    let {form, mInfo}= this.state
    form = Object.assign(form, {
      postContent: mInfo.id,
      impImage: mInfo.thumbMediaUrl,
      postUrl: mInfo.contentSourceUrl,
      extrendJson: mInfo.title
    })
    this.setState({form, isMateriaShow: false})
    this.props.saveMateriaEvent(mInfo)
  }
  //展示预览按钮
  viewEvent = () => {
    this.setState({isHide: false})
  }
  leaveEvent = () => {
    this.setState({isHide: true})
  }
  //关闭素材层
  closeEvent = () => {
    this.setState({isMateriaShow: false})
  }
  render() {
    const {
      isHide,
      form,
      mInfo,
      isMateriaShow,
      count,
      stype
    } = this.state
    const uploadButton = (
      <div className={style['uploadBtn']}>
        <Icon type={this.state.loading ? 'loading' : 'plus'} />
      </div>
    );
    const content = (
      <div>
        <h2>微信扫码直接手机预览</h2>
        {
          form.postContent ?     
            <QRCode
              value={`${window.common.articleUrl}/fshstatic/view.html?id=${form.postContent}`} //value参数为生成二维码的链接
              size={135} //二维码的宽高尺寸
              fgColor="#000000" //二维码的颜色
            /> : null
        }
      </div>
    )
    return (
      <div>
        <Modal
          title="选择文案推广"
          visible={isMateriaShow}
          width={800}
          onCancel={this.closeEvent.bind(this)}
          onOk={this.saveMateriaEvent.bind(this)}
        >
          <Materia count={count} getMateriaInfoEvent={this.getMateriaInfoEvent} num={num} state={stype} impImage={form.impImage} />
        </Modal>
        <div className={`${style.items} mb24`}>
            <label className={style.labName} style={{verticalAlign: 'top', marginTop: '10px'}}><i>*</i>选择文案：</label>
            <div
              className={style['mImage']}
              onClick={isHide === false ? null : this.showMateriaList.bind(this)}
            >
            {
              form.impImage ?
              <div
                className={style['title']}
                onMouseEnter={this.viewEvent.bind(this)}
                onMouseLeave={this.leaveEvent.bind(this, 'true')}
              >
                <img src={form.impImage} />
                <h1>{form.extrendJson}</h1>
                <div className={isHide === false ? '' : 'hide'}>
                  <div className={style['layer']}></div>
                    <div className={style['icon']}>
                      <p>
                        <Tooltip title="浏览文案">
                          <a target="_blank" href={`${window.common.articleUrl}/fshstatic/view.html?id=${form.postContent}`}>
                            <Icon type="eye" className={style['ico-eye']} /> 
                          </a>
                        </Tooltip>
                        <Popover placement="bottom" content={content} trigger="hover">
                          <span className="ml10 cur" >
                            <Icon type="mobile" className={style['ico-eye']} /> 
                          </span>
                        </Popover>
                      </p>
                    </div>
                </div>
              </div>
              :
              uploadButton
            }
            </div>
            {
            form.impImage? 
              <div className={style['changeM']} onClick={this.showMateriaList.bind(this)}>更换文案</div>
            : null
            }
        </div>
        {
          (form.impImage && mInfo.digest) ? 
          <div className={`${style.items} mb24`}>
            <label className={style.labName}>文章摘要：</label>
            <div>{mInfo.digest}</div>
          </div> : null
        }
        {
          form.postUrl ? 
          <div className={`${style.items} mb24`}>
            <label className={style.labName}>原文链接：</label>
            <div>{form.postUrl}</div>
          </div> : null
        }
      </div>
    )
  }
}
export default MateriaInfo