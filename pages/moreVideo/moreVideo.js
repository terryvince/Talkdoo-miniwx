// pages/moreVideo/moreVideo.js
const { getFlashList } = require('../../services/http.js');
const { secondToTime } = require('../../utils/util.js');
Page({

  /**
   * 页面的初始数据
   */
  data: {
    videoList:[],
    pageOption:{
      dspid:'',         //视频播放页需要
      video_id:0,        //该页需要
      class_id: ''       //视频播放页需要
    }
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this.data.pageOption = {...options};
    wx.showLoading({
      title: '拼命加载中...',
    })
    getFlashList({
      video_id: options.video_id
    }).then(res => {
      if (res.data.code == 200) {
        res.data.data.forEach(v => secondToTime(v.DURATION));   //秒转分钟
        this.setData({
          videoList: res.data.data
        })
        wx.hideLoading();
      }
    })
  },

  play(e) {
    const { id } = e.currentTarget.dataset;
    const { dspid, video_id, class_id } = this.data.pageOption;
    wx.navigateTo({
      url: `../videoPlay/videoPlay?flash_id=${id}&dspid=${dspid}&video_id=${video_id}&class_id=${class_id}`,
    })
  },
})