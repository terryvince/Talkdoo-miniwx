// pages/login/login.js
const {check} = require('../../utils/regex.js');
const { sendCode, checkVerify, register} = require('../../services/http.js');
const app = getApp();
Page({

  /**
   * 页面的初始数据
   */
  data: {
      params:{
        tel:'',             //手机号
        code:'',            //验证码
        key:''              //验证码接口返回key
      },
      codeStatus:{
        tip:'获取验证码',
        canCode:true,      //是否可发送验证码
        startTime:0,       //开始倒计时时间戳
      },
      isLogin:false,         //是否可登录
      isShowArg:false,      //是否显示协议弹层
      isBtnLoadding:false,
  },

  //切换显示协议弹层
  displayArg() {
    this.setData({
      isShowArg: !this.data.isShowArg
    })
  },

  changePhone(e){
    this.data.params.tel = e.detail.value;
    this.checkIsNull();
  },
  
  changeCode(e) {
    this.data.params.code = e.detail.value;
    this.checkIsNull();
  },

  getCode(){
    if(!this.data.codeStatus.canCode)
    {
      return;
    }
    if (!check(this.data.params.tel,'phone'))
    {
      wx.showToast({
        title: '请填写正确的手机号码！',
        icon:'none',
        duration:1000
      })
      return;
    }
    this.setTimer();
    sendCode(this.data.params.tel).then(res=>{
      if(res.data.code==200){
        this.data.params.key = res.data.key;
        wx.showToast({
          title: '验证码已发送！',
          icon:'none'
        })
      }else if(res.data.code==-2){
        wx.showModal({
          title: '提示',
          content: '120秒内只能发送一次验证码！',
          showCancel:false
        })
      } else{
        wx.showModal({
          title: '提示',
          content: '发送失败！',
          showCancel: false
        })
      }
    })
  },

  login(){
    if(!this.data.isLogin){
      return;
    }
    if (!check(this.data.params.tel, 'phone')){
      wx.showToast({
        title: '请填写正确的手机号码！',
        icon: 'none',
        duration: 1000
      })
      return;
    }
    if(!this.data.params.key){
      wx.showToast({
        title: '请先发送验证码！',
        icon: 'none',
        duration: 1000
      })
      return;
    }
    this.setData({
      isBtnLoadding:true
    })
    checkVerify(this.data.params).then(res=>{
      if(res.data.code==200){
        this.setData({
          isBtnLoadding: false
        })
        wx.showToast({
          title: '登录成功！',
          duration:1000
        })
        app.globalData.isBindAccount = true;
        wx.setStorageSync('localUid', res.data.data.uid);
        wx.setStorageSync('localToken', res.data.data.token);
        setTimeout(wx.switchTab, 1000, { url: '../index/index'});
      }else if (res.data.code==-2){
        this.setData({
          isBtnLoadding: false
        })
        wx.showToast({
          title: '请输入正确的验证码',
          icon:'none'
        })
      } else if (res.data.code == -4) {
        register(this.data.params).then(res=>{
          this.setData({
            isBtnLoadding: false
          })
          if(res.data.code==200){
            wx.showToast({
              title: '登录成功！',
              icon: 'success',
              duration: 1000,
              success: function () {
                app.globalData.isBindAccount = true;
                wx.setStorageSync('localUid', res.data.data.uid)
                wx.setStorageSync('localToken', res.data.data.token)
                setTimeout(wx.switchTab, 1000, { url: '../index/index' });
              }
            })
          }else{
            console.error('注册数据异常!')
          }
        })
      }else{
        this.setData({
          isBtnLoadding: false
        })
        console.error('登录系统错误或参数错误！')
      }
    })
  },

  checkIsNull(){
    this.setData({
      isLogin: this.data.params.tel && this.data.params.code
    })
  },

  //设置验证码计时器
  setTimer(){
    let { canCode,tip} = this.data.codeStatus;
    let countdown = 60;
    this.setData({
      'codeStatus.canCode':false,
      'codeStatus.tip':`重新发送(${countdown})`,
      'codeStatus.startTime':+new Date()
    })
    let timer = setInterval(()=>{
      let endTime = + new Date();
      let timeScope = endTime - this.data.codeStatus.startTime;
      if (timeScope>60*1000){       //倒计时完毕
        this.setData({
          'codeStatus.canCode': true,
          'codeStatus.tip': `获取验证码`
        })
        clearInterval(timer);
        return;
      }
      countdown = Math.ceil(60-timeScope/1000);       //设置倒计时
      this.setData({
        'codeStatus.tip': `重新发送(${countdown})`
      })
    },1000)
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
})