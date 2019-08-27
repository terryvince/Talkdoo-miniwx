//app.js
const { wxlogin} = require('./services/http.js');

App({
  onLaunch: function (options) {
    console.log(wx.getSystemInfoSync());  
    // 登录
    // console.log(options);    //分享进入，不执行登录绑定账号流程，只执行wx.login不发送code
    if(!this.globalData.isBindAccount){
      wxlogin().then(() => {
        //登录成功
        this.globalData.isBindAccount = true;
      }).catch(err => {
        if (err.code == -2) {
          this.globalData.isBindAccount = false;
        }
      }).finally(() => {
        this.globalData.callback && this.globalData.callback();
      })
    }
  },
  globalData: {
    isBindAccount:'',  //登录状态 false 未登录，null未初始化，true已登录      不给初值会报错
    callback:'',       //登录回调，给依赖登录状态的页面同步状态使用
  }
})