// pages/study/study.js
const app = getApp();
const { formatTime, countdown} = require('../../utils/util.js');
const { getClassByDate, getRecentClass, askForleave} = require('../../services/http.js');

Page({

  /**
   * 页面的初始数据
   */
  data: {
    isBind: null,     //null 表示在登录请求前的状态，true登录成功的状态，false表示未登录的状态
    datePicker:{
      endDate: formatTime(new Date(), 'date'),              //日期选择器的初始化参数
      curDate: formatTime(new Date(), 'date')
    },
    params:{          //请求参数
      start_date:'',
      end_date:''
    },
    list:[],
    recentClass:[],
    countdownOb:{},
    showMonth: formatTime(new Date(), 'YYYY年MM月'),
    isShowExplain:false,   //倒计时弹框
    is404:false,
  },

  /**
   * 生命周期函数--监听页面加载
   */ 
  onLoad: function (options) {
    wx.showLoading({
      title: '拼命加载中...',
    })
    let date = new Date();
    let month = date.getMonth();
    let year = date.getFullYear();
    this.data.params.start_date = formatTime(new Date(year,month,1),'date');
    this.data.params.end_date = formatTime(new Date(year, month+1, 0), 'date');
    this.checkLogin().then(res=>{
      this.setData({
        isBind: res
      })
      if(res){        //已登录取数据
        this.getClass();
        this.getRecent().finally(wx.hideLoading);
      }else{
        wx.hideLoading();
      }
    })
  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {

  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () {
    wx.showNavigationBarLoading();
    let count =0;
    this.getClass().finally(() => {
      count++;
      if(count>1){
        // 隐藏导航栏加载框
        wx.hideNavigationBarLoading();
        // 停止下拉动作
        wx.stopPullDownRefresh();
      }
    })
    this.getRecent().finally(()=>{
      count++;
      if (count > 1) {
        // 隐藏导航栏加载框
        wx.hideNavigationBarLoading();
        // 停止下拉动作
        wx.stopPullDownRefresh();
      }
    })
  },

  addMonth(){
    let { start_date} = this.data.params;
    let maxMonth = new Date(this.data.datePicker.endDate).getMonth();
    let date1 = new Date(start_date);
    let date2 = new Date(start_date);
    console.log(date1.getMonth(), maxMonth);
    if(date1.getMonth() == maxMonth){
      wx.showToast({
        title: '不能选择未来的课程哦',
        icon:'none'
      })
      return;
    }
    date1.setMonth(date1.getMonth()+1);
    date1.setDate(1);
    date2.setMonth(date2.getMonth()+2);
    date2.setDate(0);
    this.setData({
      'datePicker.curDate':formatTime(date1,'date'),
      showMonth: formatTime(date1, 'YYYY年MM月'),
      params: { start_date: formatTime(date1, 'date'), end_date: formatTime(date2, 'date') }
    })
    this.getClass();
  },

  subMonth(){
    let { start_date } = this.data.params;
    let date1 = new Date(start_date);
    let date2 = new Date(start_date);
    date1.setMonth(date1.getMonth() -1);
    date1.setDate(1);
    date2.setMonth(date2.getMonth());
    date2.setDate(0);
    console.log(date1.toLocaleString(), date2.toLocaleString())
    this.setData({
      'datePicker.curDate': formatTime(date1, 'date'),
      showMonth: formatTime(date1, 'YYYY年MM月'),
      params: { start_date: formatTime(date1, 'date'), end_date: formatTime(date2, 'date') }
    })
    this.getClass();
  },

// 日期改变
  changeDate(e){
    let strs = e.detail.value.split('-').map(Number);
    let date1 = new Date(strs[0], strs[1]-1,1);   //月份第一天日期对象，month 0-11，所以month需要减一
    let date2 = new Date(strs[0], strs[1], 0);  //月份最后一天的日期对象，day填0月份-1，day变成该月最后一天
    let start_date = formatTime(date1,'date');
    let end_date = formatTime(date2,'date');
    this.setData({
      'datePicker.curDate': start_date,
      showMonth: formatTime(date1, 'YYYY年MM月'),
      params: { start_date, end_date}
    })
    this.getClass();
  },

// 获取课程列表
  getClass(){
    return getClassByDate(this.data.params).then(res => {
      if (res.data.code == 200 && res.data.data.length != 0 ) {
        res.data.data.forEach(v=>{
          let startDate = v.startdate || v.test_time_local;
          startDate = startDate.replace(/-/g,'/');        //ios不支持-日期
          let date = new Date(startDate);
          v.time = formatTime(date,'time');
          v.date = formatTime(date,'MM月DD日');
        })
        this.setData({
          list: res.data.data
        })
      } else {
        this.setData({
          list: []           //清空无课程
        })
      }
    }).catch(error=>{
      this.setData({
        is404: true
      })
      console.error('获取历史课程列表接口异常,error:',error)
    })
  },
  //获取今天要上课的课程
  getRecent(){
    const { endDate } = this.data.datePicker;
    return getRecentClass({ start_date: endDate}).then(res=>{
      if (res.data.code == 200 && Object.keys(res.data.data[0]).length != 0) {
        res.data.data.forEach(v => {
          v.start_date = v.start_date.replace(/-/g, '/');
          let date = new Date(v.start_date);
          v.time = formatTime(date, 'time');
          v.date = formatTime(date, 'date');
        })
        this.setCountDown(new Date(res.data.data[0].start_date));
        this.setData({
          recentClass: res.data.data           //取第一个要上课的课程
        })
      }
    }).catch(error => {
      console.error('获取即将开课列表接口异常:',error)
    })
  },
  // 请假
  askLeave(){
    if (this.data.recentClass[0].ask == 1){
      return;
    }
    let me = this;
    wx.showModal({
      title: '请假确认',
      content: '课程将顺延至下周',
      confirmText:'请假',
      success(res){
        if (res.confirm){
          askForleave({
            study_history_id: me.data.recentClass[0].study_history_id
          }).then(res => {
            // 修改请假状态
            me.setData({
              'recentClass[0].ask':1
            })
            res.data.code == 200 && wx.showToast({
              title: '请假提交成功',
              icon: 'none'
            })
          })
        }
      }
    })
  },

  //倒计时
  setCountDown(date){
    clearInterval(timer);
    let timer = setInterval(()=>{
      this.setData({
        countdownOb: countdown(date)
      })
    },1000);
  },

  // 检测登录态
  checkLogin() {
    return new Promise((resolve) => {
      if (app.globalData.isBindAccount !== '') {
        resolve(app.globalData.isBindAccount);
      } else {
        app.globalData.callback = function () {
          resolve(app.globalData.isBindAccount);
        }
      }
    })
  },

  goClassDetail(e){
    let { dspid, videoid, classid, finish_flag, start_date, startdate, ask, test_time} = this.data.list[e.currentTarget.dataset.index];
    let ask_start_date;
    if(ask==1){
      ask_start_date = start_date||startdate;
    }
    test_time = test_time||+new Date();     //存在测试时间，则用测试时间去复习页面取记录，否则视为新测试
    if(finish_flag==0){
      wx.showModal({
        title: '',
        content: '该课程未上课,暂无视频',
        confirmText: "确定",
        cancelText: "取消",
        showCancel: false,
        success: function (res) {
          if (res.confirm) {
            console.log('确定')
          } else if (res.cancel) {
            console.log('取消')
          }
        }
      })
      return;
    }
    console.log(test_time);
    wx.navigateTo({
      url: `../classDetail/classDetail?dspid=${dspid}&video_id=${videoid}&class_id=${classid}&ask_start_date=${ask_start_date}&test_time=${test_time}`,
    })
  },

  displayExplain(){
    this.setData({
      isShowExplain: !this.data.isShowExplain
    })
  },
  goLogin() {
    wx.reLaunch({
      url: '../login/login',
    })
  },
  disabledScroll(e){
    return false;
  }
})