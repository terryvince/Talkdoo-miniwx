// pages/videoPlay/videoPlay.js
const { getClassVideo, getClassInfo, getClassTest, getFlashById} = require('../../services/http.js');
Page({

  /**
   * 页面的初始数据
   */
  data: {
    videoDetail:{},           //课程视频信息
    flashVideo:{},            //剪辑的视频
    userInfo:{},              //用户信息
    isShare: false,           //是否是分享的页面
    pageOption: {
      dspid: '',          //页面参数
      content:'',         //老师的评价内容
      video_id: 0,
      flash_id:0,
      class_id: '',
      uid: '',                                     //分享独有
      fromShare: false,                            //是否来自分享
    },
    shareInfo: {
      title: '',
      desc: '',
      imageUrl: ''
    }
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    wx.showLoading({
      title: '拼命加载中...',
    })
    //处理页面参数
    if (options.fromShare) {
      this.setData({
        isShare: true
      })
      wx.setStorageSync('localUid', options.uid);
    }

    this.data.pageOption = {...options};
    this.setData({
      'pageOption.content': decodeURIComponent(options.content)||''
    })

    const { dspid, video_id, class_id, flash_id } = this.data.pageOption;

    //获取课程视频信息
    getClassVideo({ video_id }).then(res => {
      if (res.data.code == 200) {
        this.setData({
          videoDetail: res.data.data
        })
      }
    })

    //获取剪辑视频
    getFlashById({ flash_id }).then(res => {
      console.log(res);
      if (res.data.code == 200) {
        console.log(res.data.data,222);
        this.setData({
          flashVideo: res.data.data
        })
      }
    })

    //获取测评数据(主要取其中的用户信息)
    getClassTest({ dspid }).then(res => {
      const { student_name, teacher_name } = res.data;
      this.setData({
        userInfo: { student_name, teacher_name }
      })
    })

    //获取课程信息（用于分享）
    getClassInfo({ class_id }).then(res => {
      let { main_title, sub_title, picurl } = res.data;
      this.data.shareInfo = {
        title: main_title,
        desc: sub_title,
        imageUrl: picurl
      }
    })
  },
  onReady(){
    wx.hideLoading();
  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {
    const uid = wx.getStorageSync('localUid');
    let { dspid, video_id, class_id, content, flash_id } = this.data.pageOption;
    content = encodeURIComponent(content);
    this.data.shareInfo.path = `/pages/videoPlay/videoPlay?content=${content}&dspid=${dspid}&flash_id=${flash_id}&video_id=${video_id}&class_id=${class_id}&uid=${uid}&fromShare=true`;
    return this.data.shareInfo;
  }
})