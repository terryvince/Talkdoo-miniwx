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
      if(res.data.code==200 && res.data.data){
        let arr = Object.keys(res.data.data)
                        .filter(k=>k.indexOf('week')>-1)    //取出含week的键
                        .map(k=>{                           //组成课程时间数组
                          return {
                            week_name : { week1: '每周一', 
                                          week2: '每周二', 
                                          week3: '每周三',
                                          week4: '每周四',
                                          week5: '每周五',
                                          week6: '每周六',
                                          week7: '每周日' }[k],
                            course_time:res.data.data[k]
                          }
                        })
        this.setData({
          timeList: arr
        })
      }
    }).finally(wx.hideLoading);
  },
})