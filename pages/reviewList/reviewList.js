// pages/reviewList/reviewList.js
const { getReviewList} = require('../../services/http.js');
Page({

  /**
   * 页面的初始数据
   */
  data: {
    list:[
      // {
      //   textStyle:'',    //控制文本样式，自己加的属性
      //   class_name:'',    //课程名字
      //   test_time_local:'', //格式化好的测试时间
      //   score:''            //分数
      // }
    ],
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    wx.showLoading({
      title: '拼命加载中...',
    })
    this.getList(function(){
      wx.hideLoading();
    });
  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () {
    wx.showNavigationBarLoading();
    this.getList(function(){
      // 隐藏导航栏加载框
      wx.hideNavigationBarLoading();
      // 停止下拉动作
      wx.stopPullDownRefresh();
    });
  },

  getList(callback){
    getReviewList().then(res=>{
      callback && callback();
      if(res.data.length!=0){
        res.data.forEach(v => {
          v.score = Math.ceil(v.score);
          if (v.score > 89) {
            v.textStyle = 'color-green';
            return;
          }
          if(v.score>59){
            v.textStyle = 'color-blue';
            return;
          }
          v.textStyle = 'color-orange';
        })
        
        this.setData({
          list:res.data
        })
      }
    })
  }


})