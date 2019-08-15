// pages/advice/advice.js
const { addFeedback, getFeedbackTypes} = require('../../services/http.js');
Page({

  /**
   * 页面的初始数据
   */
  data: {
    typeList:[
      // { feedback_type_name: '其他', feedback_type_id:'123'},
      // { feedback_type_name: 'BUG', feedback_type_id: '456' },
    ],
    type:'',                    //选择的反馈类型名
    isBtnLoadding:false,        //控制按钮加载指示
    isBtnDisabled:true,         //是否禁用按钮
    formModel:{
      feedback_type_id:'',    //反馈类型id
      feedback_info:'',       //反馈内容
    }
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    wx.showLoading({
      title: '拼命加载中...',
    })
    getFeedbackTypes().then(res=>{
      if (res.statusCode == 200 && res.data.code == 200){
        this.setData({
          typeList:res.data.data
        })
      }
    }).finally(()=>{
      wx.hideLoading();
    })
  },

  postAdvice(){
    
    if (this.data.isBtnLoadding || this.data.isBtnDisabled){
      return;
    }
    this.setData({
      isBtnLoadding:true,
    })

    addFeedback(this.data.formModel).then(res=>{
      if(res.data.code==200){
        wx.showToast({title:'提交成功',duration:1000});
        setTimeout(wx.navigateBack,1000,{delta:1});
      }else{
        wx.showToast({
          title: '提交失败',
          icon:'none'
        })
      }
    }).finally(()=>{
      this.setData({
        isBtnLoadding: false,
      })
    })
  },

  //检测非空
  checkIsNull(){
    const { feedback_info, feedback_type_id} = this.data.formModel;
    this.setData({
      isBtnDisabled:!(feedback_info && feedback_type_id)
    })
  },

  changeType(e){
    let { feedback_type_name, feedback_type_id} = this.data.typeList[e.detail.value];
    this.setData({
      type: feedback_type_name,
      'formModel.feedback_type_id': feedback_type_id
    })
    this.checkIsNull();
  },

  changeAdvice(e){
    this.data.formModel.feedback_info = e.detail.value;
    this.checkIsNull();
  }
})