import React, { Component } from 'react'
import {Icon} from 'antd'
// 引入 ECharts 主模块
import echarts from 'echarts/lib/echarts'
// 引入柱状图
import 'echarts/lib/chart/line'
import 'echarts/lib/component/tooltip'
//import 'echarts/lib/component/title'
import 'echarts/lib/component/dataZoom'
import style from './component.less'
let num = 0
let upColor = '#00da3c'
let downColor = '#ec0000'
class Echart extends Component {
  constructor(props) {
    super(props)
    this.state = {
      isActive: 0
    }
  }
  async componentDidMount() {
    //await this.initData()
    await this.setState({
      ...this.props,
      isActive: 0
    }, async () => {
      num = 0
      await this.initChart()
    })
  }
  async componentWillReceiveProps(nextProps) {
    //console.log(nextProps)
    await this.setState({
      isActive: 0,
      ...nextProps
    }, () => {
      num = 0
      this.initChart()
    })
  }
  changeEvent = (index) => {
    this.setState({isActive: index})
    num = index 
    this.initChart()
  }
  initChart = () => {
    let myChart = echarts.init(document.getElementById('main'));
    let setOptions = {
      dataZoom: [
      {
        start: 0,
        end: 100,
        show: true,
        realtime: true,
        handleStyle: {
          color: {
            type: 'linear',
            x: 0,
            y: 0,
            x2: 0,
            y2: 1,
            borderColor: '#fff',
            colorStops: [{
              offset: 0, color: 'rgb(102,68,221)' // 0% 处的颜色
            }, {
              offset: 1, color: 'rgb(102,68,221, 0.8)' // 100% 处的颜色
            }],
            global: false // 缺省为 false
          },
          shadowBlur: 3,
          shadowColor: '#fff',
          shadowOffsetX: 2,
          shadowOffsetY: 2
        }
      }],
    }
    //console.log(num)
    num === 0 ? 
      this.setEchart(myChart, setOptions)
    :  this.getRealReadCnt(myChart, setOptions)
  }
  //监控阅读量
  setEchart = (myChart, setOptions) => {
    const {xData, yReadUserVal, yReadUserData} = this.props
    let maxIntevalue = Number(yReadUserData[yReadUserData.length - 1]) / 10 //计算最大间隔值
    let option = {
      toolbox: {
        feature: {
          dataZoom: {
            show: true,
            yAxisIndex: 'none'
          },
          restore: {},
          saveAsImage: {}
        }
      },
      grid: {
        bottom: 80,
      },
      axisPointer: {
        link: {xAxisIndex: 'all'},
        label: {
          backgroundColor: '#777'
        }
      },
      xAxis: {type: 'category', show: false, boundaryGap: false, axisLine: {onZero: false}, data: xData}, //横坐标数据
      //maxInterval: 10, 
      yAxis: {type: 'value', min: 0, max: yReadUserData[yReadUserData.length - 1], maxInterval: parseInt(maxIntevalue), boundaryGap: [0, '100%']},
      tooltip: {
        trigger: 'axis',
        textStyle: {fontSize: 10, fontStyle: 'normal'},
        formatter: '时间：{b}<br />阅读数：{c}',
        axisPointer: {
          type: 'cross',
          animation: false,
          label: {
            backgroundColor: '#505765'
          }
        },
        backgroundColor: 'rgba(0, 0, 0, 0.4)'
      },
      series: [{
        type:'line',
        //animation: false,
        smooth: true,
        lineStyle: {width: 1},
        itemStyle: {
          color: '#64d'
        },
        areaStyle: {
          color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [{
            offset: 0,
            color: 'rgb(102,68,221, 0.2)'
          }, {
            offset: 1,
            color: 'rgb(102,68,221, 0.8)'
          }])
        },
        data: yReadUserVal //纵坐标数据
      }],
      ...setOptions
    };
    // 绘制图表
    if (option && typeof option === "object") {
        myChart.setOption(option, true);
    }
  }
  //监控阅读增量
  getRealReadCnt = (myChart, setOptions) => {
    const {yDifVal, yDifValData} = this.props
    let maxInterValue = Number(yDifValData[yDifValData.length - 1]) / 5
    //console.log(maxInterValue)
    myChart.setOption({
      tooltip: {
        trigger: 'axis',
        textStyle: {fontSize: 10, fontStyle: 'normal'},
        formatter: '时间：{b}<br />阅读增量：{c}',
        axisPointer: {
          type: 'cross',
          animation: false,
          label: {
            backgroundColor: '#505765'
          }
        },
        backgroundColor: 'rgba(0, 0, 0, 0.4)'
      },
      yAxis: {
        splitLine: {
          show: false
        },
        type: 'value', min: 0, max: yDifValData[yDifValData.length - 1], maxInterval: parseInt(maxInterValue), boundaryGap: [0, '100%']
      },
      toolbox: {
        left: 'center',
        feature: {
          dataZoom: {
            yAxisIndex: 'none'
          },
          restore: {},
          saveAsImage: {}
        }
      },
      visualMap: {
        top: 10,
        right: 10,
        pieces: [{
          gt: 0,
          lte: 50,
          color: '#096'
        }, {
          gt: 50,
          lte: 100,
          color: '#ffde33'
        }, {
          gt: 100,
          lte: 150,
          color: '#ff9933'
        }, {
          gt: 150,
          lte: 200,
          color: '#cc0033'
        }, {
          gt: 200,
          lte: 300,
          color: '#660099'
        }, {
          gt: 300,
          color: '#7e0023'
        }],
        outOfRange: {
          color: '#999'
        }
      },
      brush: {
        xAxisIndex: 'all',
        brushLink: 'all',
        outOfBrush: {
          colorAlpha: 0.1
        }
      },
      visualMap: {
        show: false,
        seriesIndex: 5,
        dimension: 2,
        pieces: [{
            value: 1,
            color: downColor
        }, {
            value: -1,
            color: upColor
        }]
      },
      series: {
        type:'line',
        start: 0, //控制起始位置
        end: 10,
        data: yDifVal, //.map(function (item) {return item;})
        itemStyle: {
          color: '#64d'
        },
        areaStyle: {
          color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [{
            offset: 0,
            color: 'rgb(102,68,221, 0.2)'
          }, {
            offset: 1,
            color: 'rgb(102,68,221, 0.5)'
          }])
        }
      },
      ...setOptions
    }); 
  }
  render() {
    const {
      isActive,
      alias,
      realPostArticleTime,
      monitorDateStart,
      monitorDateEnd
    } = this.state
    const items = this.props.missionItems
    return(
      <div className={style['charts']}>
        <ul className={style['charts-menu']}>
          <li className={style['wxaccount']}>
            <img src={items.headImg} />
            {items.appNickName}
            <div>{alias}</div>
          </li>
          <li>
            <a
              className={isActive === 0 ? style['active'] : null}
              onClick={this.changeEvent.bind(this, 0)}
            >阅读数趋势</a>
            <a
              className={isActive === 1 ? style['active'] : null}
              onClick={this.changeEvent.bind(this, 1)}
            >阅读增量</a>
          </li>
        </ul>
        <div  className={style['charts-map']}>
            <div className={style['time']}>
              <span>发文时间：{realPostArticleTime}</span>
              <span>监控周期：
              {monitorDateStart} ~ {monitorDateEnd}</span>
              <span>文章位置：{window.common.advertLocal[items.appArticlePosition - 1]}</span>
              {
                this.props.monitorStatus === 3 ? 
                <label className={`${style['status']} ${style['ongoing']}`}>
                  <Icon type="monitor" className={style['ico']}/>
                  监控中
                </label> :
                <label className={`${style['status']} ${style['finish']}`}>
                  <Icon type="monitor" className={style['ico']}/>
                  监控完成
                </label>
              }
            </div>
            <div id="main" className={style['simple']}></div>
        </div>
      </div>
    )
  }
}
export default Echart