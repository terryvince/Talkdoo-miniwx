// pages/profile/profile.js
const { formatTime, debounce} = require('../../utils/util.js');
const { getProfile, profileEdit, unbind} = require('../../services/http.js');
const app = getApp();
Page({

  /**
   * 页面的初始数据
   */
  data: {
    endDate:formatTime(new Date(),'date'),
    profileModel:{
      realname:'',
      nickname: '',
      birthday: '',
      gender: '',     //1男 2女
    },
    recorder:{
      key:'',
      value:''
    },      //输入框聚焦时，记录原始值
  },

  recordValue(e){
    this.data.recorder.value = e.detail.value;
    this.data.recorder.key = e.currentTarget.dataset.key;
  },

  changeName: debounce(function (e) {
    this.data.profileModel.realname = e.detail.value;
  }, 500,false),

  changeNick: debounce(function (e) {
    this.data.profileModel.nickname = e.detail.value;
  }, 500, false),

  changeSex(e){
    let me = this;
    wx.showActionSheet({
      itemList: ['男','女'],
      itemColor:' #007AFF',
      success(res){
        me.setData({
          'profileModel.gender':res.tapIndex+1
        })
        me.updateProfile();
      }
    })
  },

  changeBirthday(e){
    this.setData({
      'profileModel.birthday': e.detail.value
    })
    this.updateProfile();
  },

  //退出登录
  logout(){
    wx.showModal({
      title: '退出确认',
      content: '是否退出当前账号',
      confirmColor:'#02BB00',
      success({ confirm, cancel}){
        if(confirm){
          wx.showLoading({
            title: '正在退出...',
          });
          unbind().then(res => {
            if (res.data.code == 200) {
              wx.removeStorageSync('localUid');
              wx.removeStorageSync('localToken');
              wx.removeStorageSync('dept_id');
              app.globalData.isBindAccount=false;
              wx.hideLoading();
              wx.showToast({
                title: '退出成功！',
                icon: 'none',
                duration: 1000
              })
              setTimeout(wx.reLaunch, 1000, { url: '../login/login', })
            } else {
              wx.showToast({
                title: '退出失败！',
                icon: 'none',
                duration: 1000
              })
            }
          })
        }
      }
    })
  },

  //修改信息
  updateProfile(e){
    let value = e.detail;
    if(this.data.recorder.value==value){      //没有修改，不发送请求
      return;
    }
    console.log(value)
    if(!value){
      wx.showToast({
        title: '个人信息不能为空',
        icon:'none'
      })
      this.data.profileModel[this.data.recorder.key] = this.data.recorder.value;
      this.setData({
        'profileModel':this.data.profileModel
      })
      return;
    }
    profileEdit(this.data.profileModel).then(res=>{
      if(res.data.code==200){
        wx.showToast({
          icon:'none',
          title: '修改成功！',
          duration:1000
        })
      }else{
        wx.showToast({
          icon: 'none',
          title: '修改失败！',
          duration: 1000
        })
      }
    });
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    wx.showLoading({
      title: '拼命加载中...',
    })
    getProfile().then(res=>{
      wx.hideLoading();
      if(res.data.code==200){
        let { real_name, nick_name, birthday, gender} = res.data.data;
        this.setData({
          profileModel:{
            realname:real_name,
            nickname:nick_name,
            birthday,
            gender
          }
        })
      }
    })
  },
})