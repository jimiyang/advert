
const utils = {
  //广告主活动订单/订单状态21、22、27、28、29、30
  orderStatus: ['审核中', '审核驳回', '投放中', '暂停', '停止', '活动完成'],
  //下拉列表活动状态
  postStatus: [
    { id: 21, name: '待审核' },
    { id: 22, name: '审核驳回' },
    { id: 27, name: '投放中' },
    { id: 28, name: '暂停' },
    { id: 29, name: '停止' },
    { id: 30, name: '活动完成' },
  ],
  //订单状态10：待审核 16：审核驳回 11：待发文 12：已发文 15：订单取消 13：待结算 
  //14：订单完成 17, 结算失败,结算打款异常 18, 结算失败，发送订单已超活动截止日期 //19取消
  missionStatus: ['待审核', '待发文', '已发文', '待结算', '结算完成', '过期未发文', '审核驳回', '结算失败'],
  //订单监控状态//1不监控(默认)2待监控 3 监控中 4 监控完成
  monitorStatus: ['未监控', '待监控', '监控中', '监控完成'],
  //广告主文章所在位置
  advertLocal: ['头条', '二条','三条','四条','五条','六条','七条','八条'],
  //男女粉丝设置
  targetGender: ['男粉', '女粉'],
  //公众号审核状态
  weChatstatus: ['待审核', '审核完成', '审核失败'],
  //活动管理审核状态
  activityStatusData: ['审核不通过', '审核通过'],
  payOrderStatus: ['未支付', '支付中', '支付完成', '支付失败'],
  //认证管理状态
  authStatus: ['待审核', '审核通过', '审核驳回', '未认证'],
  //提现状态
  cashstatusData: ['待审核', '驳回', '待支付', '成功', '付款失败', '处理中'],
  articleUrl: (window.location.hostname === 'localhost' || window.location.hostname === 'testht.liantuotui.com' ? 'http://test.fensihui.com' : 'http://houtai.fensihui.com'), //文章预览地址 
  hostName: (window.location.hostname === 'localhost' || window.location.hostname === 'testht.liantuotui.com' ? 'http://testht.liantuotui.com' : 'http://houtai.liantuotui.com'), //hostName地址
  //删除数组中为空的元素
  removeEmptyArrayEle(arr) {
    for (let i = 0; i < arr.length; i++) {
      if (arr[i] === undefined) {
        arr.splice(i, 1);
        i = i - 1; // i - 1 ,因为空元素在数组下标 2 位置，删除空之后，后面的元素要向前补位，
        // 这样才能真正去掉空元素,觉得这句可以删掉的连续为空试试，然后思考其中逻辑
      }
    }
    return arr;
  },
  //获取时间
  getDate(time, flag) {
    const date = new Date(time);
    const y = date.getFullYear();
    let m = date.getMonth() + 1;
    m = m < 10 ? (`0${m}`) : m;
    let d = date.getDate();
    d = d < 10 ? (`0${d}`) : d;
    let h = date.getHours();
    h = h < 10 ? (`0${h}`) : h;
    let minute = date.getMinutes();
    let second = date.getSeconds();
    minute = minute < 10 ? (`0${minute}`) : minute;
    second = second < 10 ? (`0${second}`) : second;
    const str = flag ? `${y}-${m}-${d} ${h}:${minute}:${second}` : `${y}-${m}-${d} `;
    return str;
  },
  //时间格式化
  getTime() {
    let d = new Date();
    let year = d.getFullYear();
    let month = d.getMonth() + 1 > 10 ? d.getMonth() + 1 : `0${d.getMonth() + 1}`;
    let day = d.getDate() > 10 ? d.getDate() : `0${d.getDate()}`;
    let hour = d.getHours() > 10 ? d.getHours() : `${d.getHours()}`;
    let minute = d.getMinutes() > 10 ? d.getMinutes() : `0${d.getMinutes()}`;
    let second = d.getSeconds() > 10 ? d.getSeconds() : `0${d.getSeconds()}`;
    const time = `${year}-${month}-${day} ${hour}:${minute}:${second}`;
    return time;
  },
  // 日期对比，得出天数 
  dateDiff(sDate1, sDate2) {
    let oDate1, oDate2, iDays;
    oDate1 = new Date(sDate1);
    oDate2 = new Date(sDate2);
    iDays = parseInt(Math.abs(oDate1 - oDate2) / 1000 / 60 / 60 / 24) + 1;
    return iDays;
  },
  getStartAndEndDate(diffNum) {
    const curDate = new Date().getTime()
    const minDate = curDate - (24 * 3600 * 1000 * diffNum)
    let start = this.getDate(minDate), end = this.getDate(curDate)
    const arrTime = [start.replace(/\s*/g,""), end.replace(/\s*/g,"")]
    return arrTime
  },
  getAdType(type) { //活动形式
    let typeName = '';
    switch (type) {
      case 'link':
        typeName = 'H5支付后广告';
        break;
      case 'banner':
        typeName = 'banner广告';
        break;
      case 'miniapp':
        typeName = '小程序广告';
        break;
      case 'article':
        typeName = '公众号软文';
        break;
      case 'section':
        typeName = '软文贴片广告';
        break;
      default:
        typeName = 'H5支付后广告';
        break;
    }
    return typeName;
  },
  activityStatus(status) {
    let name;
    switch (Number(status)) {
      case 21:
        name = '待审核';
        break;
      case 22:
        name = '审核驳回';
        break;
      case 27:
        name = '投放中';
        break;
      case 28:
        name = '暂停';
        break;
      case 29:
        name = '停止';
        break;
      case 30:
        name = '活动完成';
        break;
      default:
        name = '';
        break;
    }
    return name;
  },
  wxAccountType(type) {
    let name;
    switch (type) {
      case 2:
        name = '公众号';
        break;
      case 1:
        name = '订阅号';
        break;
      case 3:
        name = '公众号、订阅号均可';
        break;
      default:
        name = '公众号、订阅号均可';
        break;
    }
    return name;
  },
  mergeArray(data) {
    return [].concat.apply([], data);
  },
  formatNumber(count) {
    let source = String(count).split(".");//按小数点分成2部分
    source[0] = source[0].replace(new RegExp('(\\d)(?=(\\d{3})+$)', 'ig'), "$1,");//只将整数部分进行都好分割
    return source.join(".");//再将小数部分合并进来
  },
  // 上传图片之前判断图片大小
  beforeUpload(file, msg, size) {
    const typeArr = ['image/jpeg', 'image/jpg', 'image/png', 'image/bmg'];
    let isJPG = 'image/jpeg';
    typeArr.map(item => {
      if (item === file.type) {
        isJPG = item;
      }
    });
    if (!isJPG) {
      msg.error(`请上传${isJPG}格式图片！`);
    }
    const isLt2M = size === undefined ?  file.size / 1024 / 1024 < 2 : file.size / 1024 < 1024;
    //console.log(file.size < 1024)
    if (!isLt2M) {
      msg.error(`请上传小于${size === undefined ? 2 : size}M的图片!`);
    }
    return isJPG && isLt2M;
  },
  //正则表达式
  regExps(type, value) {
    let flag, reg
    switch(type) {
      case 'idCard':
        reg = /^[1-9][0-9]{5}(19|20)[0-9]{2}((01|03|05|07|08|10|12)(0[1-9]|[1-2][0-9]|31)|(04|06|09|11)(0[1-9]|[1-2][0-9]|30)|02(0[1-9]|[1-2][0-9]))[0-9]{3}([0-9]|x|X)$/
        flag = reg.test(value)
      break
    }
    return flag
  },
  //替换***
  reaplceStar(content, type) {
    if (content !== null && content !== undefined && content.length > 1) {
      switch(type) {
        case 'certificateNumber':
          content = content.replace(/^(.{0})(?:\w+)(.{4})$/, "$1**************$2")
        break
        case 'accountHolder':
          let str = "*", max = content.length == 2 ? content.length : content.length - 1
          for(let i = 0; i < max - 2; i++) {
            str += '*'
          }
          content = content.substring(0, 1) + str + content.substring(max, content.length);
        break
        case 'bankCardNumber':
          content = content.replace(/^(.{0})(?:\w+)(.{4})$/, "$1**************$2")
        break
        case 'phone':
          content = content.replace(/^(.{3})(?:\w+)(.{4})$/, "$1****$2")
        break
        default:

        break
      }
    }
    return content
  },
  //粉丝数替换**万+
  reaplceFansNum(number) {
    return number.length >= 5 ? number.substring(0, 1) + '万+' : number
  },
  monitorReadNum(style, status) {
    let className
    switch (status) {
      case 2:
        className = 'wait'
      break;
      case 3:
        className = 'ongoing'
      break;
      case 4:
        className = 'finish'
      break;
    }
    return <em className={style[className]}>{this.monitorStatus[status - 1]}</em>
  }
};
export default utils;