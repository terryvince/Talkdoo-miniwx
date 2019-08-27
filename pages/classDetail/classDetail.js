// pages/classDetail/classDetail.js
const { getFlashList, getPictureList, getClassVideo, getComment, getClassTest, getExercises, getWordList, getClassInfo, postComment, commentReaded, getLiveVideo, getReviewSubject, videoCount} = require('../../services/http.js');
const host = require('../../config/index.js').api;
const { limitString,secondToTime } = require('../../utils/util.js');
Page({

  /**
   * 页面的初始数据
   */
  data: {
    tabIndex:1,             //1介绍 2达成度 3评价
    teacher_comment:'',     //老师的评价，用于视频播放页
    comment: { student: [], teacher: [] },
    videoDetail: {},         //视频详情
    countData: {},           //统计数据和单词
    wordList: [],            //单词列表
    videoList: [],           //精彩瞬间视频列表
    imgList: [],             //精彩瞬间照片列表
    // isShowShare: false,      //是否显示分享引导，可按钮分享，暂时弃用
    isShare:false,           //是否是分享的页面
    pageOption:{
      // dspid: '9834c0214cd647059cedcd74913eeaeb',          //页面参数
      // video_id:3286,
      // test_time:           //有测试时间
      // class_id:'6c086c0c14ea40b2a11ff2c073054a81',
      // uid:'',                                     //分享独有
      // fromShare:false,                            //是否来自分享
      //  ask_start_date                        //请假的课程时间，不是非必须，只是为了在后端取不到课程时间的时候用上一个页面的时间，后端的锅
    },
    shareInfo:{
      title:'',
      desc:'',
      imageUrl:'',
      ask_start_date:''             //同上
    },
    class_info: {
      class_name:'',
      class_desc:''
    },
    canReview:false,           //是否可以复习，有复习题可以复习
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    wx.showLoading({
      title: '拼命加载中...',
    })
    //处理页面参数
    if(options.fromShare){
      this.setData({
        isShare:true
      })
      wx.setStorageSync('localUid', options.uid);
    }
    this.data.pageOption = {...options}

    let { dspid, video_id, class_id, ask_start_date} = this.data.pageOption;
    ask_start_date = ask_start_date == 'undefined' ? '' : ask_start_date;   //页面参数被转成了字符串，要对比字符串判断有无值
    

    let type = '3'; //pv类型，用于zhibo和点播的统计

    //获取习题，看有无习题
    getReviewSubject({class_id}).then(res=>{
      this.setData({
        canReview:res.data.length>0
      })
    })

    // 获取精彩视频
    getFlashList({
      video_id
    }).then(res=>{
      if(res.data.code==200){
        res.data.data.forEach(v => secondToTime(v.DURATION));   //秒转分钟
        this.setData({
          videoList:res.data.data
        })
      }
    })

    //获取精彩照片
    getPictureList({dspid}).then(res=>{
      if(res.data.code==200 && res.data.data.length!=0){
        res.data.data.forEach(v => v.image_url=host+v.image_url); //补全图片url
        this.setData({
          imgList:res.data.data
        })
      }
    })

    //获取课程视频
    let videoData;
    getClassVideo({video_id}).then(res=>{
      if(res.data.code==200){
        videoData = res.data.data
        this.setData({
          videoDetail: videoData
        })
      }
      type = '3';
      return videoCount({ type, dspid });
    })

    //获取课程名字和描述


    //获取测评数据
    getClassTest({dspid}).then(res=>{
      // is_pushed 1 已推流  0未推流   is_over 0 课程未开始  1正在上课  2已结束
      let { is_pushed, is_over, class_name, defeated_percent, correct_total, start_time, video_url, start_date} = res.data;
      is_pushed == 1 && this.setData({ tabIndex: 2 });
      this.data.countData = { is_pushed, is_over, class_name, defeated_percent, correct_total, start_time, video_url, start_date, ask_start_date};
      if (video_url){
        this.setData({
          'videoDetail.video_url': video_url
        })
      }
      return getExercises({class_id})
    }).then(res=>{
      let optionNum = 0;               //可选单词数量，非必须
      let totalnum = 0;                //总的知识点数量
      let optionWord = "";            //所有可选单词
      let totalWord = "";             //所有必学单词
      let wordStr = "";                 //总的单词拼接的字符串
      for (var i = 0; i < res.data.length; i++) {
        if (res.data[i].is_option == 1) {
          optionNum = optionNum + 1;
          optionWord += res.data[i].english + '/';              //累加可选单词
        }
        else {
          totalnum = totalnum + 1;
          if (i < 8) {
            totalWord += "," + res.data[i].english;
          }
        }
      }
      if (optionNum > 1) {
        totalnum = totalnum + 1;
      }
      wordStr += optionWord + totalWord;
      if (res.length > 5) {
        wordStr += '......';
      }
      if (wordStr[0] == ',') {
        wordStr = wordStr.slice(1);         //去除首个逗号
      }
      this.data.countData.wordStr = wordStr.replace('/,', ','); //去除可选必答冲突连接符
      this.data.countData.totalnum = totalnum;
      this.data.countData.mastery = Math.ceil(this.data.countData.correct_total / totalnum * 100) || '0';
      this.setData({
        countData:this.data.countData
      })
    })

    //单词列表
    getWordList({ dspid}).then(res=>{
      this.setData({
        wordList:res.data
      })
    })

    //获取课程信息（用于分享）
    getClassInfo({class_id}).then(res=>{
      let { main_title, sub_title, picurl, class_name, class_desc} = res.data;
      this.data.shareInfo= {
        title:main_title,
        desc:sub_title,
        imageUrl:picurl,
        ask_start_date:ask_start_date
      }
      this.setData({
        class_info:{
          class_name,
          class_desc
        }
      });
    })

  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {
    //获取评价内容
    getComment({ dspid:this.data.pageOption.dspid }).then(res => {
      if (res.statusCode == 200) {
        res.data.teacher.forEach(v => {
          if (v.answer_type == 1) {
            v.content = v.content.slice(0, 1) || 0;   //截取数字’1 星‘
          }
          v.tmplate_content = limitString(v.tmplate_content, 22);  //截取字符串长度
        })

        res.data.student.forEach(v => {
          if (v.answer_type == 1) {
            v.content = v.content.slice(0, 1) || 0;   //截取数字’1 星‘
          }
          if (v.answer_type == 3) {
            this.data.teacher_comment = v.content;      //提取老师的评价
          }
          v.tmplate_content = limitString(v.tmplate_content, 22);  //截取字符串长度
        })
        this.setData({
          comment:res.data
        })
      }
    })
  },
  onReady() {
    wx.hideLoading();
  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {
    const uid = wx.getStorageSync('localUid');
    const { dspid, video_id, class_id } = this.data.pageOption;
    this.data.shareInfo.path = `/pages/classDetail/classDetail?dspid=${dspid}&video_id=${video_id}&class_id=${class_id}&uid=${uid}&fromShare=true`;
    return this.data.shareInfo;
  },

  // 分享引导 可按钮分享 暂时弃用
  // displayShare(){
  //   this.setData({
  //     isShowShare:!this.data.isShowShare
  //   })
  // },
  play(e){
    const { id } = e.currentTarget.dataset;
    const { dspid, video_id, class_id} = this.data.pageOption;
    let content = encodeURIComponent(this.data.teacher_comment);
    wx.navigateTo({
      url: `../videoPlay/videoPlay?content=${content}&flash_id=${id}&dspid=${dspid}&video_id=${video_id}&class_id=${class_id}`,
    })
  },
  scrollTop(){
    wx.pageScrollTo({
      scrollTop: 0,
    })
  },

  goMore(){
    const { dspid, video_id, class_id } = this.data.pageOption;
    wx.navigateTo({
      url: `../moreVideo/moreVideo?dspid=${dspid}&video_id=${video_id}&class_id=${class_id}`,
    })
  },
  goStage(){
    if (!this.data.canReview){
      wx.showModal({
        title: '提示',
        content: '该课程暂无复习题哦',
        confirmText: "知道了",
        showCancel: false,
      })
      return;
    }
    let { dspid, video_id, class_id, test_time } = this.data.pageOption;
    if(!video_id){
      wx.showModal({
        title: '提示',
        content: '没有视频的课程不能复习哦', //没有是视频复习后没有成绩
        confirmText: "知道了",
        showCancel: false,
      })
      return;
    }
    test_time = test_time || (+new Date());
    wx.navigateTo({
      url: `../stage/stage?class_id=${class_id}&dspid=${dspid}&video_id=${video_id}&test_time=${test_time}&fromPage=classDetail`,
    })
  },

  viewImage(e){
    let { url} = e.currentTarget.dataset;
    url = encodeURIComponent(url);
    wx.navigateTo({
      url: `../viewImg/viewImg?imgUrl=${url}&class_id=${this.data.pageOption.class_id}`,
    })
  },

  goComment(){
    const { dspid } = this.data.pageOption;
    const class_name = this.data.class_info.class_name;
    wx.navigateTo({
      url: `../comment/comment?dspid=${dspid}&class_name=${class_name}`,
    })
  },

  switchTab(e){
    const {index} = e.currentTarget.dataset;
    this.setData({
      tabIndex:index
    })
    if (index == 3 && this.data.comment.is_readed==0 && this.data.comment.student.length!=0){    //评价已读
      this.setData({
        'comment.is_readed': 1
      })
      commentReaded({
        dspid:this.data.pageOption.dspid
      }).then(res=>{
        if(res.data.code!=200){
          console.error('已读请求提交失败！');
        }
      })
    }
  }
})