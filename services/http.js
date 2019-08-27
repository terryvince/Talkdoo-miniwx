const app = getApp();
const config_host = require('../config/index.js').api;
const hiVoiceKey = require('../config/index.js').hiVoiceKey;
const md5 = require('../utils/md5.js').md5;
const promisify = require('../utils/promisify.js');
let Promise = require('../utils/es6-promise.min.js');
const qs = require('../utils/qs.js');

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
  },
  //上传文件
  upload(filename, ob) {
    var option = {
      method: ob.method || 'POST',
      name: filename
    };
    option = Object.assign(ob, option);
    return new Promise(function (resolve, reject) {
      wx.uploadFile(Object.assign(option, {
        success: function (res) {
          resolve(res);
        },
        fail: function (res) {
          reject(res);
        }
      }));
    })
  },
  postForm(ob){
    var option = {
      method: ob.method || 'POST',
      data: qs.stringify(ob.data)
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
      console.log(res);
      if (res.data.code == 200) {
        wx.setStorage({
          key: 'openid',
          data: res.data.open_id,
        })
        wx.setStorageSync('localUid', res.data.data.uid)
        wx.setStorageSync('localToken', res.data.data.token)
        wx.setStorageSync('dept_id', res.data.data.dept_id)
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
function register({ tel, code, key, realname = tel.slice(7, 11), nickname = tel.slice(7, 11), birthday = "2000-01-01", gender='1' }) {
  let url = 'memberapp/register';
  return http.publicRequest({
    url,
    data: {
      open_id: wx.getStorageSync('openid'),
      realname,
      nickname,
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

//获取精彩瞬间视频列表
function getFlashList({ video_id}) {
  let url = `video/listflash`;
  //"3478"
  return http.publicRequest({
    url,
    data:{
      video_id
    }
  }).catch(err => {
    console.error(`请求路径：${url},发生错误:`, err);
  })
}

//获取精彩瞬间视频
function getFlashById({ flash_id }) {
  let url = `video/detailflash/`;
  return http.publicRequest({
    url,
    data: {
      flash_id
    }
  }).catch(err => {
    console.error(`请求路径：${url},发生错误:`, err);
  })
}

//获取精彩照片
function getPictureList({ dspid }) {
  let url = `video/piclist`;
  return http.publicRequest({
    url,
    data: {
      dspid
    }
  }).catch(err => {
    console.error(`请求路径：${url},发生错误:`, err);
  })
}

//获取课程视频
function getClassVideo({ video_id }) {
  let url = `video/detail`;
  return http.publicRequest({
    url,
    data: {
      video_id
    }
  }).catch(err => {
    console.error(`请求路径：${url},发生错误:`, err);
  })
}

//获取评价内容
function getComment({ dspid }) {
  let uid = wx.getStorageSync('localUid');
  let url = `summary/get/${dspid}/${uid}/`;
  return http.publicRequest({
    url
  }).catch(err => {
    console.error(`请求路径：${url},发生错误:`, err);
  })
}

//获取课程测评数据
function getClassTest({ dspid }) {
  let uid = wx.getStorageSync('localUid');
  let url = `dispatchclass/get/${dspid}/${uid}/`;
  return http.publicRequest({
    url
  }).catch(err => {
    console.error(`请求路径：${url},发生错误:`, err);
  })
}

//获取练习题的内容
function getExercises({ class_id }) {
  let url = `exercises/get/${class_id}/2/`;
  return http.publicRequest({
    url
  }).catch(err => {
    console.error(`请求路径：${url},发生错误:`, err);
  })
}

//获取单词列表（含正误信息）
function getWordList({ dspid }) {
  let url = `studentexercise/getstudentothervalidexercisesbydsp/${dspid}/`;
  return http.publicRequest({
    url
  }).catch(err => {
    console.error(`请求路径：${url},发生错误:`, err);
  })
}

//获取课程信息
function getClassInfo({ class_id }) {
  let url = `classes/get/${class_id}/`;
  return http.publicRequest({
    url
  }).catch(err => {
    console.error(`请求路径：${url},发生错误:`, err);
  })
}
//获取评价表单模板
function getCommentForm() {
  let url = `summary_tmplate/get/2/`;
  return http.request({
    method:'get',
    url
  }).catch(err => {
    console.error(`请求路径：${url},发生错误:`, err);
  })
}

//学生提交评价内容
// data {
//   dspid: '',
//   uid: wx.getStorageSync('localUid'),
//   summary_type: '2',
//   list: []        //提交的表单数据
// }
function postComment(data) {
  let url = `course_summary_item/update/`;
  return http.request({
    url,
    data
  }).catch(err => {
    console.error(`请求路径：${url},发生错误:`, err);
  })
}

//评价已读  1 学生已读 2老师已读
function commentReaded({ dspid }) {
  const uid = wx.getStorageSync('localUid')
  let url = `summary/addreaded/${dspid}/${uid}/1/`;
  return http.request({
    url
  }).catch(err => {
    console.error(`请求路径：${url},发生错误:`, err);
  })
}

//提交反馈
function addFeedback({ feedback_type_id,feedback_info }) {
  const uid = wx.getStorageSync('localUid')
  let url = `feedback/add/`;
  return http.request({
    url,
    data:{
      feedback_type_id,
      feedback_info,
      uid
    }
  }).catch(err => {
    console.error(`请求路径：${url},发生错误:`, err);
  })
}

//获取反馈类型列表
function getFeedbackTypes() {
  let url = `feedback/getAll/`;
  return http.request({
    url
  }).catch(err => {
    console.error(`请求路径：${url},发生错误:`, err);
  })
}

//获取门店信息（含上课次数）
function getShopInfo() {
  let uid = wx.getStorageSync('localUid')
  let url = `department/getfinished/${uid}/`;
  return http.request({
    url,
    data:{uid}
  }).catch(err => {
    console.error(`请求路径：${url},发生错误:`, err);
  })
}

//获取上课时间
function getClassTime() {
  let uid = wx.getStorageSync('localUid')
  let url = `studenttimttable/gettimetable/${uid}/`;
  return http.request({
    url,
    data: { uid }
  }).catch(err => {
    console.error(`请求路径：${url},发生错误:`, err);
  })
}

//获取zhibo视频
function getLiveVideo() {
  let url = `video/live`;
  return http.request({
    url,
    method: 'get',
  }).catch(err => {
    console.error(`请求路径：${url},发生错误:`, err);
  })
}

//复习获取习题
function getReviewSubject({ class_id}) {
  let url = `exercises/get/${class_id}/-1/`;
  return http.request({
    url,
  }).catch(err => {
    console.error(`请求路径：${url},发生错误:`, err);
  })
}

/**获取测试题练习记录
 *  uid  1体验课 2正式课
 *  test_time 
 *  class_exercises_id  习题id
 */
function getTestRecorder({ test_time, class_exercises_id = '' }) {
  let uid = wx.getStorageSync('localUid');
  let url = `studentexercise/getstudentexercises/`;
  return http.request({
    url,
    data: {
      uid,
      test_time,
      class_exercises_id
    }
  }).catch(err => {
    console.error(`请求路径：${url},发生错误:`, err);
  })
}

//上传录音获取测评结果（云之声接口）filePath 微信录音的临时路径 text 正确答案
function uploadRecord({filePath,text}) {
  let url = `https://edu.hivoice.cn/eval/mp3`;
  return http.upload('voice',{
    url,
    formData:{
      text,
      mode: 'E',
    },
    header: {
      'Session-Id': timestamp,
      'appkey': hiVoiceKey,
      'score-coefficient': '1.3',
      'Wrap-Create-Time': 'true',
    },
    filePath
  }).catch(err=>{
    console.error(`请求路径：${url},发生错误:`, err);
  })
}

/** 保存云之声测评结果到服务器
 * dspid  设备id
 * class_exercises_id 习题id
 * test_time      测试的时间，时间戳
 * detail       云之声返回的测评结果
 * answer_method  习题类型
 * score          习题分数
 * voice_file     用户录音文件
 */
function saveTestResult({ dspid, class_exercises_id, test_time, detail, answer_method,score,voice_file}) {
  let uid = wx.getStorageSync('localUid');
  let url = config_host + '1.0/publicapi/' +`student_exercise/add/`;
  return http.upload('voice_file', {
    url,
    formData: {
      uid,
      dspid,
      class_exercises_id,
      test_time,
      detail:JSON.stringify(detail),
      answer_method,
      score
    },
    header: {
      "Content-Type": "multipart/form-data",
    },
    filePath: voice_file
  }).catch(err => {
    console.error(`请求路径：${url},发生错误:`, err);
  })
}

function saveTestResultNoFile({ dspid, class_exercises_id, test_time, detail, answer_method, score }) {
  let uid = wx.getStorageSync('localUid');
  let url = config_host + '1.0/publicapi/' + `student_exercise/add/`;
  return http.postForm({
    url,
    data: {
      uid,
      dspid,
      class_exercises_id,
      test_time,
      detail: JSON.stringify(detail),
      answer_method,
      score
    },
    header: {
      "Content-Type": "application/x-www-form-urlencoded",
    }
  }).catch(err => {
    console.error(`请求路径：${url},发生错误:`, err);
  })
}

/** 获取复习课程关卡分数
 * test_time 点击复习的时间戳
 */
function getStageScore({ class_id,test_time }) {
  let uid = wx.getStorageSync('localUid');
  let url = `studentexercise/getavgdetailscore/${class_id}/${uid}/${test_time}/`;
  return http.request({
    url
  }).catch(err => {
    console.error(`请求路径：${url},发生错误:`, err);
  })
}

/** 获取复习课程总平均分
 * test_time 点击复习的时间戳
 */
function getTotalScore({ class_id, test_time }) {
  let uid = wx.getStorageSync('localUid');
  let url = `studentexercise/getavgtotalscore/${class_id}/${uid}/${test_time}/`;
  return http.request({
    url,
  }).catch(err => {
    console.error(`请求路径：${url},发生错误:`, err);
  })
}

/** 获取课程列表通过时间段
 * start_date 月份的起始日期
 * end_date   月份结束日期
 */
function getClassByDate({ start_date, end_date }) {
  let uid = wx.getStorageSync('localUid');
  let url = `studentexercise/getClassNmae/${uid}/${start_date}/${end_date}/`;
  return http.request({
    url
  }).catch(err => {
    console.error(`请求路径：${url},发生错误:`, err);
  })
}

/** 获取即将开始的课程
 * start_date 当天日期2019-08-01
 */
function getRecentClass({ start_date}) {
  let uid = wx.getStorageSync('localUid');
  let url = `dispatchclass/findByUserClassName/${uid}/${start_date}/`;
  return http.request({
    url
  }).catch(err => {
    console.error(`请求路径：${url},发生错误:`, err);
  })
}

/** 请假
 * study_history_id 学生的课程进度id
 */
function askForleave({ study_history_id }) {
  let url = `studentaskforleave/save/${study_history_id}/`;
  return http.request({
    url
  }).catch(err => {
    console.error(`请求路径：${url},发生错误:`, err);
  })
}

/**视频点播统计
 * type pv类型 2zhibo访问次数 3点播访问次数
 * total  加数默认为1
 */
function videoCount({ dspid, type,total="1"}){
  let uid = wx.getStorageSync('localUid');
  let url = `playpv/add/`;
  return http.publicRequest({
    url,
    data:{
      uid,
      dspid,
      type,
      total
    }
  }).catch(err => {
    console.error(`请求路径：${url},发生错误:`, err);
  })
}

/**获取所有课包
 * type 1 体验 2正式 3测评
 */
function getClassPackageByType({ type=3}) {
  let uid = wx.getStorageSync('localUid');
  let url = `package/getall/${type}/`;
  return http.request({
    url,
  }).catch(err => {
    console.error(`请求路径：${url},发生错误:`, err);
  })
}

/**获取课程，通过课包id
 * pkg_id 课包id
 */
function getClassByPackageId({ pkg_id }) {
  let uid = wx.getStorageSync('localUid');
  let url = `classes/getall/${pkg_id}/`;
  return http.request({
    url,
  }).catch(err => {
    console.error(`请求路径：${url},发生错误:`, err);
  })
}

/**保存入学测评成绩
 * class_id
 * test_score   总分
 * dept_id
 * phone
 * test_result [{ANSWER_TYPE,answer_score}] 测评各关卡的平均分
 */
function saveEntranceTest({ class_id, test_score, phone, test_result}) {
  let uid = wx.getStorageSync('localUid');
  let dept_id = wx.getStorageSync('dept_id');
  let url = `studenttest/save/`;
  return http.request({
    url,
    data:{
      class_id,
      dept_id,
      test_score,
      phone,
      test_result
    }
  }).catch(err => {
    console.error(`请求路径：${url},发生错误:`, err);
  })
}

/**获取推荐课程
 *  type  1体验课 2正式课
 *  score
 */
function getClassByScore({ type, score, class_id }) {
  let uid = wx.getStorageSync('localUid');
  let url = `classes/getAdviseClassName/`;
  return http.request({
    url,
    data:{
      type,
      score,
      classid:class_id
    }
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
  getFlashList,   //获取精彩瞬间视频
  getFlashById,   //通过id获取剪辑视频
  getPictureList, //获取精彩照片
  getClassVideo,   //获取课程视频
  getComment,      //获取评价内容
  getClassTest,    //获取课程测评数据
  getExercises,    //获取练习题的内容
  getWordList,     //获取单词列表（含正误信息）
  getClassInfo,    //获取课程信息（分享需要）
  getCommentForm,  //获取评价表单模板
  postComment,      //提交评价内容
  commentReaded,    //学生已阅读评论
  addFeedback,      //提交反馈内容
  getFeedbackTypes,   //获取反馈类型列表
  getShopInfo,       //获取门店信息，含上课次数
  getClassTime,      //获取上课时间
  getLiveVideo,       //获取zhibo视频
  getReviewSubject,   //获取复习题
  uploadRecord,       //上传录音获取测评结果
  saveTestResult,     //保存云之声测评结果到服务器
  getStageScore,      //获取复习课程关卡分数
  getTotalScore,      //获取复习课程总平均分数
  getClassByDate,     //通过日期段获取课程列表
  getRecentClass,     //获取即将开始的课程
  askForleave,        //请假
  videoCount,         //zhibo点播统计
  getClassPackageByType,  //获取测评课包
  getClassByPackageId,   //获取某课包的所有课程
  saveEntranceTest,      //保存入学测评结果
  getClassByScore,      //获取推荐课程
  getTestRecorder,      //获取测试题的记录，含录音和分数
  saveTestResultNoFile,  //保存习题记录，表单提交不提交文件
}