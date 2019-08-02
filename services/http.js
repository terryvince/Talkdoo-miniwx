const app = getApp();
const config_host = require('../config/index.js').api;
const md5 = require('../utils/md5.js').md5;
const promisify = require('../utils/promisify.js');

function getTimestamp(){
  var now = new Date();
  var year = now.getFullYear();
  var month = now.getMonth() + 1 < 10 ? "0" + (now.getMonth() + 1) : now.getMonth();
  var day = now.getDate() < 10 ? "0" + now.getDate() : now.getDate();
  var h = now.getHours() < 10 ? "0" + now.getHours() : now.getHours();
  var m = now.getMinutes() < 10 ? "0" + now.getMinutes() : now.getMinutes();
  var s = now.getSeconds() < 10 ? "0" + now.getSeconds() : now.getSeconds();
  var nowDate = year + '/' + month + '/' + day + ' ' + h + ':' + m + ':' + s;
  return Date.parse(nowDate) - 8 * 60 * 60 * 1000;
}
const timestamp = getTimestamp();

//封装wx.request
const http = {
  //带签名请求
  request(ob) {
    var uid = wx.getStorageSync('localUid');
    var token = wx.getStorageSync('localToken');
    var signature = md5(uid + timestamp + token);
    var option = {
      url: config_host + '1.0/api/' + ob.url,
      method: ob.method || 'POST',
      header: {
        timestamp,
        uid,
        signature
      }
    };
    option = Object.assign(ob, option);
    return new Promise(function (resolve, reject) {
      wx.request(Object.assign(option, {
        success: function (res) {
          resolve(res);
        },
        fail: function (res) {
          reject(res);
        }
      }));
    })

  },
  //不带签名请求
  publicRequest(ob) {
    var option = {
      url: config_host + '1.0/publicapi/' + ob.url,
      method: ob.method || 'POST',
    };
    option = Object.assign(ob, option);
    return new Promise(function (resolve, reject) {
      wx.request(Object.assign(option, {
        success: function (res) {
          resolve(res);
        },
        fail: function (res) {
          reject(res);
        }
      }));
    })
  }
}

//登录
function wxlogin(){
  const url = 'memberapp/bind';
  return new Promise((resolve,reject)=>{
    promisify(wx.login)().then(res => {
      return http.publicRequest({         //code发给服务器换取openid以及token
        url,
        data: {
          code: res.code
        }
      })
    }).then(res => {
      if (res.data.code == 200) {
        wx.setStorage({
          key: 'openid',
          data: res.data.open_id,
        })
        wx.setStorageSync('localUid', res.data.data.uid)
        wx.setStorageSync('localToken', res.data.data.token)
      } else if (res.data.code == -2) {     //该微信未绑定账号，可选择跳到登录去绑定手机号
        wx.setStorage({
          key: 'openid',
          data: res.data.open_id,
        })
        reject({
          code:-2,
          msg: `请求路径：${url},该微信未绑定账号！`
        })
      }
      else if (res.data.code == -1) {
        reject({
          code: -1,
          msg: `请求路径：${url},参数错误！`
        })
      }
      else if (res.data.code == -3) {
        reject({
          code: -3,
          msg: `请求路径：${url},code换取openid失败！`
        })
      }
      else if (res.data.code == -4) {
        reject({
          code: -4,
          msg: `请求路径：${url},获取token失败！`
        })
      }
      else if (res.data.code == 0) {
        reject({
          code: -4,
          msg: `请求路径：${url},系统错误！`
        })
      }
      resolve();
    })
  })
}

//检测验证码，并将手机号与微信进行绑定 tel 手机号 code输入的验证码 key验证码返回值里的key
function checkVerify({tel,code,key}){
  let url = 'memberapp/checkverify'
  return http.publicRequest({
    url,
    data:{
      open_id:wx.getStorageSync('openid'),
      tel,
      code,
      key
    }
  }).catch(err=>{
    console.error(`请求路径：${url},发生错误:`,err);
  })
}

// 注册账号 tel手机号 必须 code验证码 必须 key验证码key 必须，其他可缺省
function register({ tel, code, key, realName = tel.slice(7, 11), nickName = tel.slice(7, 11), birthday = "2000-01-01", gender='1' }) {
  let url = 'memberapp/register';
  return http.publicRequest({
    url,
    data: {
      open_id: wx.getStorageSync('openid'),
      realName,
      nickName,
      birthday,
      gender,
      tel,
      code,
      key
    }
  }).catch(err => {
    console.error(`请求路径：${url},发生错误:`, err);
  })
}

//发送验证码
function sendCode(tel){
  let url = 'member/verify';
  return http.publicRequest({
    url,
    data:{
      tel
    }
  }).catch(err => {
    console.error(`请求路径：${url},发生错误:`, err);
  })
}

//获取用户信息
function getProfile() {
  let url = 'member/info';
  return http.request({
    method:'GET',
    url
  }).catch(err => {
    console.error(`请求路径：${url},发生错误:`, err);
  })
}

//编辑用户信息
function profileEdit({ realname, nickname, birthday,gender}) {
  let url = 'member/edit';
  return http.request({
    url,
    data:{
      uid: wx.getStorageSync('localUid'),
      realname,
      nickname,
      birthday,
      gender,       //1 男 2女
    }
  }).catch(err => {
    console.error(`请求路径：${url},发生错误:`, err);
  })
}

//解绑账号，退出登录
function unbind(){
  let url = 'member/unbind';
  return http.request({
    url,
    data: {
      wxid:wx.getStorageSync('openid'),
      uid: wx.getStorageSync('localUid')
    }
  }).catch(err => {
    console.error(`请求路径：${url},发生错误:`, err);
  })
}

//获取复习成绩列表（未分页）
function getReviewList() {
  let uid = wx.getStorageSync('localUid');
  let url = `studentexercise/getallstudentscore/${uid}/`;
  return http.request({
    url
  }).catch(err => {
    console.error(`请求路径：${url},发生错误:`, err);
  })
}

module.exports = {
  http,
  wxlogin,        //登录并检测有没有绑定账号
  checkVerify,    //检测验证码，并绑定账号
  register,       //注册账号
  sendCode,       //发送验证码
  getProfile,     //获取个人信息
  profileEdit,    //编辑个人信息
  unbind,         //解绑账号，退出登录
  getReviewList,  //获取复习成绩列表
}