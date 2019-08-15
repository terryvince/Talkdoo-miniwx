// pages/classTime/classTime.js
const { getClassTime} = require('../../services/http.js');
Page({

  /**
   * 页面的初始数据
   */
  data: {
    timeList:[]
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    wx.showLoading({
      title: '拼命加载中...',
    })
    getClassTime().then(res=>{
      if(res.data.code==200){
        res.data.time.forEach(v => v.week_name = { 1: '每周一', 2: '每周二', 3: '每周三', 4: '每周四', 5: '每周五', 6: '每周六', 7: '每周日' }[v.week_day]);
        this.setData({
          timeList:res.data.time
        })
      }
    }).finally(wx.hideLoading);
  },
})