// pages/my/my.js
const app = getApp();
const { getProfile, getShopInfo } = require('../../services/http.js');
Page({

  /**
   * 页面的初始数据
   */
  data: {
    isBind: null,     //null 表示在登录请求前的状态，true登录成功的状态，false表示未登录的状态
    profile:{
      real_name:'',
      nick_name:'',
      phone:'',
      account_type:null    //4表示门店人员登录，出现入学测评入口
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

    this.checkLogin().then(res=>{
      this.setData({
        isBind: res
      })
      if(res){              //已登录，发出请求
        // 获取个人信息
        getProfile().then(res => {
          if (res.data.code == 200) {
            this.setData({
              profile: res.data.data,
            })
          }
        })
        // 获取门店信息，主要取的上课次数
        getShopInfo().then(res => {
          if (res.data.code == 200) {
            this.setData({
              'profile.count': res.data.data.finished_total||0,
            })
          }
        }).finally(wx.hideLoading);
      }else{
        wx.hideLoading();
      }
    })
  },
  // 检测登录态
  checkLogin(){
    return new Promise((resolve)=>{
      if (app.globalData.isBindAccount!==''){
        resolve(app.globalData.isBindAccount);
      }else{
        app.globalData.callback=function(){
          resolve(app.globalData.isBindAccount);
        }
      }
    }).catch(err=>{
      console.log(err);
    })
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
  goTestType(){
    wx.navigateTo({
      url: '../testType/testType',
    })
  },
  // 收藏单词 废弃
  // goCollectWords(){
  //   wx.navigateTo({
  //     url: '../collectWords/collectWords',
  //   })
  // },
  goAdvice(){
    wx.navigateTo({
      url: '../advice/advice',
    })
  },
  goClassTime(){
    wx.navigateTo({
      url: '../classTime/classTime',
    })
  }
})