//app.js
const { wxlogin} = require('./services/http.js');

App({
  onLaunch: function () {
    // 登录
    if(!this.globalData.isBindAccount){
      wxlogin().then(() => {
        //登录成功
        this.globalData.isBindAccount = true;
        this.globalData.callback && this.globalData.callback();
      }).catch(err => {
        if (err.code == -2) {
          this.globalData.isBindAccount = false;
          this.globalData.callback && this.globalData.callback();
        }
      })
    }
  },
  globalData: {
    isBindAccount:null,  //登录状态 false 未登录，null未初始化，true已登录
    callback:null,       //登录回调，给依赖登录状态的页面同步状态使用
  }
})