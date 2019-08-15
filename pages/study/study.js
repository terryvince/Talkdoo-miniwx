// pages/study/study.js
Page({

  /**
   * 页面的初始数据
   */
  data: {
    isShowExplain:false
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {

  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {

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

  },

  displayExplain(){
    this.setData({
      isShowExplain: !this.data.isShowExplain
    })
  },
  disabledScroll(e){
    return false;
  }
})