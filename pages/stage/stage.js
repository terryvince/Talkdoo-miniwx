// pages/stage/stage.js
const { getStageScore, getTotalScore, getReviewSubject} = require('../../services/http.js');
Page({

  /**
   * 页面的初始数据
   */
  data: {
    pageOption:{
      // dspid: 'a66a5f6edcb34f10b935df6c83a187ba',     //复习题，课程详情需要，
      // class_id: 'a7223a86040e4412a3be7bb1073d50c2',  //复习题,本页,课程详情都需要
      // video_id:'',                    //跳课程详情需要
      // test_time: '1566187063225',  //点击复习的时间戳，非必须，如果没传则新建个时间戳
      // fromPage: '',                 //来源页是复习成绩列表页，可跳课程详情 reviewList classDetail
    },
    scoreDetail:{
      total: {            //总平均分
        score:'',
        // textClass:'',     //文字样式
      },        
      follow: {           //跟读平均分
      //   score:null,
      //   textClass:'',
        // answer_type: 1
      },        
      recognize: {           //认读平均分
      },     
      select: {           //选择平均分
      },
      dialog: {           //对话平均分
      },
    }

  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this.setData({
      pageOption:options
    })
    this.data.pageOption.test_time = this.data.pageOption.test_time||(+new Date()); //有测试时间则有成绩，无测试时间开启新复习
  },
  onShow:function(options){
    const { class_id, test_time } = this.data.pageOption;
    let scoreDetail = this.data.scoreDetail;
    console.log(2,test_time);
    // 获取每个关卡平均分数
    getStageScore({         //studentexercise/getavgdetailscore/${class_id}/${uid}/${test_time}/
      class_id,
      test_time
    }).then(res => {
      res.data.forEach(v=>{
        let type = this.getStage(v.answer_mothod);        //取出各关卡分数
        let score = v.score===''? '': ~~v.score;
        this.data.scoreDetail[type].score = score;
        this.data.scoreDetail[type].textClass = this.getTextColor(score);
      })
      return getReviewSubject({ class_id });    //exercises/get/${class_id}/-1/
    }).then(res=>{
      res.data.forEach((v,i) => {
        let type = this.getStage(v.answer_type);        //确定习题有哪些关卡类型
        this.data.scoreDetail[type].answer_type = v.answer_type;    //answer_type 1 跟读   3认读  4选择  5对话
        this.data.scoreDetail[type].score = this.data.scoreDetail[type].score||'';
        if(i==0){
          this.data.scoreDetail[type].isFirst = true;     //是不是第一关，第一关默认解锁
        }
      })
      this.setData({
        scoreDetail: this.data.scoreDetail
      })
    })
    //获取复习课程总平均分
    getTotalScore({
      class_id,
      test_time
    }).then(res => {
      if (res.data.length!=0){
        let score = ~~res.data[0].score;
        this.setData({
          'scoreDetail.total.score': score,
          'scoreDetail.total.textClass': this.getTextColor(score)
        })
      }
    })
  },
  //获取类型对应的关卡
  getStage(type) {
    return { 1: 'follow', 3: 'recognize', 4: 'select', 5: 'dialog' }[type] || 'follow';
  },
  //获取分数对应文字样式
  getTextColor(score){
    if (score < 60) {
      return 'color-orange';
    } else if (score >= 60 && score < 90) {
      return 'color-blue';
    } else if (score >= 90) {
      return 'color-green';
    }
  },
  goReview(e) {
    const type = e.currentTarget.dataset.type;
    let { score, answer_type, isFirst} = this.data.scoreDetail[type];
    if (!isFirst && score===''){
      wx.showModal({
        title: '提示',
        content: '该关卡没有解锁哦！',
      })
      return;
    }
    const { dspid, class_id, test_time, fromPage} = this.data.pageOption;
    wx.navigateTo({
      url: `../review/review?class_id=${class_id}&dspid=${dspid}&test_time=${test_time}&answer_type=${answer_type}&fromPage=${fromPage}`,
    })
  },
  goClassDetail(e){
    const { dspid, class_id, video_id } = this.data.pageOption;
    
    wx.navigateTo({
      url: `../classDetail/classDetail?dspid=${dspid}&video_id=${video_id}&class_id=${class_id}`,
    })
  }
})