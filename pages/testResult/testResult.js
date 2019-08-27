// pages/testResult/testResult.js
const { saveEntranceTest, getClassByScore} = require('../../services/http.js');
Page({
  /*页面的初始数据*/
  data: {
    typeList: [{
      'src': 'http://media.talkdoo.com/appletstudent/index/result_selectType_icon.svg',
      'text': '选择题',
      'val': ''
    },
    {
      'src': 'http://media.talkdoo.com/appletstudent/index/result_distinguishType_icon.svg',
      'text': '认读题',
      'val': ''
    },
    {
      'src': 'http://media.talkdoo.com/appletstudent/index/result_chatType_icon.svg',
      'text': '对话题',
      'val': ''
    }],
    score: '',
    mid_4_tit: '简餐-小小营业员（高阶）',
    mid_4_msg: '简餐店里有什么？咖啡、汉堡还是热狗呢?小朋友可以在简餐店里买吃的，还可以变身当小小店员卖商品~',
    phone: '',
    isFormal:true,   //是不是正式版测评
    pageOption:{
      testType:'',      //测评类型 1体验 2正式
      class_id:'',
      scoreDetail: {  //关卡分数以及总分
        total: {            //总平均分
          score: 0,
        },
        follow: {           //跟读平均分
          score: 0,
          answer_type: 1
        },
        recognize: {           //认读平均分
          score: 0,
          answer_type: 3
        },
        select: {           //选择平均分
          score: 0,
          answer_type: 4
        },
        dialog: {           //对话平均分
          score: 0,
          answer_type: 5
        },
      } 
    },
    recommentClass:{}
  },

  /*生命周期函数--监听页面加载*/
  onLoad: function (options) {
    // 取得页面参数
    this.data.pageOption = options;
    this.data.pageOption.scoreDetail = JSON.parse(this.data.pageOption.scoreDetail);
    let { testType, class_id, scoreDetail } = this.data.pageOption;
    scoreDetail.total.score = ~~scoreDetail.total.score;
    this.data.typeList[0].val = scoreDetail.select.score;
    this.data.typeList[1].val = scoreDetail.recognize.score;
    this.data.typeList[2].val = scoreDetail.dialog.score;
    this.setData({
      pageOption: { type:testType, class_id, scoreDetail},
      isFormal:testType==2,
      typeList:this.data.typeList,
      score: scoreDetail.total.score
    })

    getClassByScore({ type: testType, score: scoreDetail.total.score, class_id}).then(res=>{
      if(res.data.code==200){
        this.setData({
          recommentClass:res.data.data[0]
        })
      }
    })
  },
  
  back(){
    wx.navigateBack({
      delta:2
    });
  },

  //手机
  phone: function (e) {
    this.setData({
      phone: e.detail.value
    })
  },

  //预约
  save: function (e) {
    let { phone, pageOption} = this.data;
    let { testType, class_id, scoreDetail} = pageOption;
    let test_result = [{
      ANSWER_TYPE:scoreDetail.select.answer_type,
      answer_score:scoreDetail.select.answer_score
    }, 
    {
      ANSWER_TYPE: scoreDetail.recognize.answer_type,
      answer_score: scoreDetail.recognize.answer_score
    },
    {
      ANSWER_TYPE: scoreDetail.dialog.answer_type,
      answer_score: scoreDetail.dialog.answer_score
    }];
    //保存测评数据
    saveEntranceTest({
      class_id,
      phone,
      test_score:scoreDetail.total.score,
      test_result
    }).then(res=>{
      if(res.data.code==200){
        let title = testType==1?'预约成功':'保存成功';
        let content = testType == 1 ? 'TalkDoo门店老师将会安排体验课程':'已为您保存';
        wx.showModal({
          title,
          content,
          confirmText: "知道了", //确定
          showCancel: false
        })
      }else{
        let title = testType == 1 ? '预约失败' : '保存失败';
        let content = this.data.phone+'已经是其他校区用户';
        wx.showModal({
          title,
          content,
          confirmText: "知道了", //确定
          showCancel: false
        })
      }
    })
  },
})