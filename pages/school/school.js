// pages/school/school.js
const { getShopInfo} =require('../../services/http.js');
Page({

  /**
   * 页面的初始数据
   */
  data: {
    shopInfo:{
      address:'',
      dept_name:'',     //门店名字
      Tel:'',           //门店电话
    }
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    wx.showLoading({
      title: '拼命加载中...',
    })
    getShopInfo().then(res=>{
      if(res.data.code==200&& res.data.data.dept_name){
        this.setData({
          shopInfo:res.data.data
        })
      }
    }).finally(wx.hideLoading);
  },
})