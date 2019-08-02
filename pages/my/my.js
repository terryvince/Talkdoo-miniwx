// pages/my/my.js
const app = getApp();
const { getProfile } = require('../../services/http.js');
Page({

  /**
   * 页面的初始数据
   */
  data: {
    isBind: null,     //null 表示在登录请求前的状态，true登录成功的状态，false表示未登录的状态
    profile:{
      real_name:'',
      nick_name:'',
      phone:''
    }
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    
  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {
    let me = this;
    wx.showLoading({
      title: '拼命加载中...',
    })
    if(app.globalData.isBindAccount){       //存在登录态
      getProfile().then(res => {
        wx.hideLoading();
        if (res.data.code == 200) {
          this.setData({
            profile: res.data.data,
            isBind:app.globalData.isBindAccount
          })
        }
      })
      return;
    }else{
      wx.hideLoading();
    }
    app.globalData.callback = function(){   //不存在则等待app.js返回登录态后执行操作
      if (app.globalData.isBindAccount){
        getProfile().then(res => {
          if(res.data.code==200){
            me.setData({
              profile:res.data.data
            })
          }
        })
      }
      me.setData({
        isBind: app.globalData.isBindAccount
      })
      wx.hideLoading();
    }
  },
  goProfile(){
    wx.navigateTo({
      url: '../profile/profile',
    })
  },
  goScholl(){
    wx.navigateTo({
      url: '../school/school',
    })
  },
  goReviewList(){
    wx.navigateTo({
      url: '../reviewList/reviewList',
    })
  },
  goLogin(){
    wx.reLaunch({
      url: '../login/login',
    })
  },
  goCollectWords(){
    wx.navigateTo({
      url: '../collectWords/collectWords',
    })
  },
  goAdvice(){
    wx.navigateTo({
      url: '../advice/advice',
    })
  }
})