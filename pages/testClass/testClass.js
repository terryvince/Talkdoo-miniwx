// pages/testClass/testClass.js
const { getClassPackageByType, getClassByPackageId, getReviewSubject} = require('../../services/http.js');
Page({

  /**
   * 页面的初始数据
   */
  data: {
    pageOption:{
      type: null,      // 1体验 2正式
    },
    list:[],          //课程列表
    canReview:false,
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this.data.pageOption = options;
    const {type} = this.data.pageOption;
    // 获取课包
    getClassPackageByType({}).then(res=>{
      if(res.data.code==200&& res.data.data.length!=0){
        let pkg_id = res.data.data.find(v => v.test_type == type).pkg_id;
        return getClassByPackageId({pkg_id});   //获取课程
      }
    }).then(res=>{
      if(res && res.data){
        this.setData({
          list:res.data
        })
      }
    })
  },
  goReview(e){
    const { index } = e.currentTarget.dataset;
    const { class_id } = this.data.list[index];
    const { type } = this.data.pageOption;
    //获取习题，看有无习题
    getReviewSubject({ class_id }).then(res => {
      this.setData({
        canReview: res.data.length > 0
      })
      if (!this.data.canReview) {
        wx.showModal({
          title: '提示',
          content: '该课程暂无复习题哦',
          confirmText: "确定",
          showCancel: false,
        })
        return;
      }
      wx.navigateTo({
        url: `../review/review?class_id=${class_id}&fromPage=test&testType=${type}`,
      })
    })
  }
})