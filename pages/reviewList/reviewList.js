// pages/reviewList/reviewList.js
const { getReviewList, getReviewSubject} = require('../../services/http.js');
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
    canReview: false,           //是否可以复习，有复习题可以复习
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    wx.showLoading({
      title: '拼命加载中...',
    })
    
    this.getList().finally(() => {
      wx.hideLoading();
    });
  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () {
    wx.showNavigationBarLoading();
    this.getList().finally(()=>{
      // 隐藏导航栏加载框
      wx.hideNavigationBarLoading();
      // 停止下拉动作
      wx.stopPullDownRefresh();
    })
  },

  getList(){
     return getReviewList().then(res=>{
      if(res.data.data.length!=0&&res.data.code==200){
        res.data.data.forEach(v => {
          v.score = Math.ceil(v.score)||0;
          if (v.differ>=0){
            v.showNumber = '↑ ' + Math.abs(v.differ);
          }
          if (v.differ < 0){
            v.showNumber = '↓ ' + Math.abs(v.differ);
          }
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
          list:res.data.data
        })
      }
    })
  },

  goStage(e){
    let index = e.currentTarget.dataset.id;
    let { class_id, dspid, videoid, test_time,state } = this.data.list[index];
    //获取习题，看有无习题
    console.log(videoid);
    getReviewSubject({ class_id }).then(res => {
      if (res.data.length == 0) {
        wx.showModal({
          title: '提示',
          content: '该课程暂无复习题哦',
          confirmText: "确定",
          showCancel: false,
        })
        return;
      }
      test_time = test_time || (+new Date());
      if(state==1){
        wx.navigateTo({
          url: `../stage/stage?class_id=${class_id}&dspid=${dspid}&video_id=${videoid}&test_time=${test_time}&fromPage=reviewList`,
        })
      }else{              //未复习过，按正常复习流程走
        wx.navigateTo({
          url: `../stage/stage?class_id=${class_id}&dspid=${dspid}&video_id=${videoid}&test_time=${test_time}&fromPage=classDetail`,
        })
      }
      
    });
  },


})