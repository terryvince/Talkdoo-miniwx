// pages/review/review.js
const { getReviewSubject, uploadRecord, saveTestResult, saveTestResultNoFile, getTestRecorder} = require('../../services/http.js');
const { query,checkIsAuth} = require('../../utils/util.js');
Page({

  /**
   * 页面的初始数据
   */
  data: {
    animationData:'',
    systemInfo: wx.getSystemInfoSync(),
    slideWidth:0,
    isShowPage:false,     //是否显示页面
    pageOption:{          //页面参数
      // dspid:'a66a5f6edcb34f10b935df6c83a187ba',
      // class_id:'a7223a86040e4412a3be7bb1073d50c2',
      // test_time:'1509355151533',  //点击复习的时间戳
      // fromPage: '',                  //来源页,如果来自测评页，完成复习后跳测评成绩页面
      // answer_type:1,              //关卡跳关类型,默认跟读
    },
    testSubjects: [],     //测试题 answer_type 1 跟读   3认读  4选择  5对话
    oldSubjects: [],         //从复习成绩列表进入显示以前复习的状态
    curSubjectIndex:0,   //当前习题索引
    stage: {              //关卡信息
      number:1,           // 1-5  按顺序排序关卡提示，跳关用
      stageNumber:1,      //不跳关用
      imgUrls:[
        'http://media.talkdoo.com/appletstudent/review/listenAndRepeat_icon.svg',
        'http://media.talkdoo.com/appletstudent/review/recognition_icon.svg',
        'http://media.talkdoo.com/appletstudent/review/choose_icon.svg',
        'http://media.talkdoo.com/appletstudent/review/conversation_icon.svg',
        'http://media.talkdoo.com/appletstudent/review/complete_icon.svg'
      ],         //关卡的图片
      title:['跟读题','认读题','选择题','对话题','完成']
    },
    testAudios:[
      'http://media.talkdoo.com/appletstudent/review/pronunciation_default_btn.svg',
      'http://media.talkdoo.com/appletstudent/animate/pronunciation_btn.gif',    //正在播放单词音频
    ],
    isRecording:false,      //是否正在录音
    isPlaying:false,         //是否正在播放 单词音频
    isPlayRecord:false,     //是否正在播放录音
    audioCtx: null,          //习题播放器
    audioRecordCtx:null,     //录音播放器
    recorderManager:null,    //录音管理器
    tempFilePath:null,       //保存当前的录音
    test_time:null,          //进入复习的时间戳
    selectResult:'',         //选择题的回答结果提示
    lastAnswerType:'',       //上一题习题类型
    animationCanHide:false,   //是否隐藏动画，避免动画导致屏幕宽度溢出一屏

  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this.setData({
      pageOption:options
    })
    const { class_id, answer_type, test_time } = this.data.pageOption;
    this.data.test_time = test_time;
    checkIsAuth('scope.record', '我们将使用您的录音用作测评分数！');     //检测录音权限

    this.data.audioCtx=wx.createInnerAudioContext();       //初始化播放器
    this.data.audioCtx.onPause(() => {
      this.setData({
        isPlaying: false,
      })
    })
    this.data.audioCtx.onEnded(() => {
      this.setData({
        isPlaying: false,
      })
    })

    this.data.recorderManager = wx.getRecorderManager();    //初始化录音管理器
    this.data.audioRecordCtx = wx.createInnerAudioContext();  //初始化录音播放器
    this.data.audioRecordCtx.onPause(() => {
      this.setData({
        isPlayRecord: false,
      })
    })
    this.data.audioRecordCtx.onEnded(() => {
      this.setData({
        isPlayRecord: false,
      })
    })

    // 获取习题
    getReviewSubject({ class_id}).then(res=>{
      if (res.statusCode==200 && res.data){
        let pretype,num=1;
        res.data.forEach((v,i)=>{
          v.answer_type == 4 && v.question_list.forEach(x=>x.class=''); //初始化选择题
          v.result_class='';
          v.score = '';
          v.recorder='';
          if(i==0){
            pretype = v.answer_type;
          }else{
            if(pretype!=v.answer_type){
              num++;
              pretype = v.answer_type;
            }
            if(answer_type == v.answer_type){     //如果存在跳关的情况，设置跳关数
              this.setData({
                'stage.stageNumber':num
              })
            }
          }
        })
        let id = res.data.findIndex(v=>v.answer_type == answer_type); //找到跳关索引
        this.data.curSubjectIndex = id>=0?id:0;
        this.data.testSubjects = res.data;
      }
      return getTestRecorder({ class_id, test_time })   //获取习题记录
    }).then(res=>{
      if (res.data.code == 200 && res.data.data.length!=0) {
        res.data.data.forEach(v=>{
          this.data.testSubjects.forEach(k=>{
            if (v.class_exercises_id == k.class_exercises_id){
              k.score = parseInt(v.score)||'';
              k.result_class = '';
              if (v.score || v.score==0) {
                k.result_class = 'color-orange';
              } else if (k.score >= 60 && k.score < 90) {
                k.result_class = 'color-blue';
              } else if (k.score >= 90) {
                k.result_class = 'color-green';
              }
              k.recorder = v.answer_voice;
              if(k.answer_type==4){                 //选择题，复习时，选择结果需要赋值
                k.question_list.forEach(t=>{
                  t.class = t.is_correct?'right':'wrong';
                  k.score = v.score;
                  k.selectResult = k.score == 100 ? '恭喜你，回答正确' : '很遗憾，回答错误';
                })
              }
            }
          })
        })
      }
      this.setData({
        oldSubjects: res.data.data,
        testSubjects: this.data.testSubjects,
        curSubjectIndex: this.data.curSubjectIndex
      })
      this.onGetSubject && this.onGetSubject();   //取得习题后，执行完成回调
    })
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {
    let me = this;
    this.stageAnimationStatus = true;       //转场动画标记初始化

    //设置起始关卡和转场动画
    if(this.data.testSubjects.length==0){
      this.onGetSubject = function(){       //没有习题，注册事件，等待请求返回
        this.init()
      }
    }else{        //有习题
      this.init()
    }
  },

  /**
   * 选择题
   */
  select(e){
    const {id} = e.currentTarget.dataset;
    let {testSubjects,curSubjectIndex} = this.data;
    if (testSubjects[curSubjectIndex].score >= 0 && testSubjects[curSubjectIndex].score!==''){
      return;
    }
    const { class_exercises_id, answer_type } = testSubjects[curSubjectIndex];
    let isCorrect = testSubjects[curSubjectIndex].question_list[id].is_correct;
    testSubjects[curSubjectIndex].question_list.forEach(v=>{
      v.class = '';
    });
    testSubjects[curSubjectIndex].question_list[id].class = isCorrect ? 'right' : 'wrong';
    this.data.testSubjects[curSubjectIndex].score = isCorrect ? 100 : 0;
    this.data.testSubjects[curSubjectIndex].selectResult = isCorrect ? '恭喜你，回答正确' : '很遗憾，回答错误';
    this.setData({
      testSubjects : testSubjects
    })
    const { dspid, class_id,fromPage } = this.data.pageOption;
    const test_time = this.data.test_time;
    if (fromPage=='test'){
      // 记录入学测评成绩到内存，最后结算
      this.data.testSubjects[curSubjectIndex].score=isCorrect?100:0;
      return;
    }
    // this.autoNext();
    // 保存习题测评数据
    saveTestResultNoFile({
      dspid,
      class_id,
      class_exercises_id,
      test_time,
      detail: '',
      score: this.data.testSubjects[curSubjectIndex].score,
      answer_method: answer_type
    })
  },

  /**
   * 上一个习题
   */
  last(){
    let { curSubjectIndex} = this.data;
    let lastAnswerType = this.data.testSubjects[curSubjectIndex].answer_type;
    if(curSubjectIndex==0){
      wx.showToast({
        title: '这是第一道习题了哦',
        icon:'none'
      })
      return;
    }
    this.setData({
      lastAnswerType: lastAnswerType
    })
    this.data.curSubjectIndex = --curSubjectIndex;
    this.changeStage();
  },

  //下一个习题
  next(){
    let { curSubjectIndex, pageOption, testSubjects } = this.data;
    let {fromPage,testType,class_id} = pageOption;
    let lastAnswerType = testSubjects[curSubjectIndex].answer_type;
    if (curSubjectIndex == testSubjects.length-1) {   //最后一关
      this.setData({
        'stage.number': 5,
      })
      this.stageSafeMove();
      setTimeout(()=>{
        if (fromPage=='classDetail'){  //课程详情，跳选关页看成绩
          wx.navigateBack({
            delta: 1
          })
        }else if(fromPage == 'test'){ //入学测评跳测评结果页
          this.goTestRuslt();
        }
      },4000);
      return;
    }
    this.setData({
      lastAnswerType: lastAnswerType
    })
    this.data.curSubjectIndex = ++curSubjectIndex;
    this.changeStage();
  },

  // 计算平均分，跳入学测评结果页
  goTestRuslt(){
    const { testSubjects} = this.data;
    let result = {
      total: {            //总平均分
        score: null,
      },
      follow: {           //跟读平均分
        score: null,
        answer_type: 1
      },
      recognize: {           //认读平均分
        score: null,
        answer_type: 3
      },
      select: {           //选择平均分
        score: null,
        answer_type: 4
      },
      dialog: {           //对话平均分
        score: null,
        answer_type: 5
      },
    }
    let lastType = testSubjects[0].answer_type;
    let onlykey = { '1': 'follow', '3': 'recognize', '4': 'select', '5': 'dialog' }[lastType];
    let totalScore, stageScore; //totalScore 总分 stageScore 关卡平均分
    result.total.score = result[onlykey].score = totalScore = stageScore = testSubjects[0].score; //初始化分数

    for (let i = 1, num = 2; i < testSubjects.length; i++ , num++) {     //多于两个习题时求平均分
      let v = testSubjects[i];
      totalScore += v.score;
      if (lastType == v.answer_type) {    // 同一关卡
        stageScore += v.score;
      } else {          //切换关卡时求平均分，并初始化下一关卡数据
        let key = { '1': 'follow', '3': 'recognize', '4': 'select', '5': 'dialog' }[lastType];
        result[key].score = ~~(stageScore / num);
        num = 1;
        stageScore = v.score;
        lastType = v.answer_type;
      }
      if (i + 1 == testSubjects.length) { //最后一题单独给分
        let key = { '1': 'follow', '3': 'recognize', '4': 'select', '5': 'dialog' }[lastType];
        result[key].score = ~~(stageScore / num);
      }
    }
    result.total.score = totalScore / testSubjects.length;/*取得总分*/
    const { testType, class_id} = this.data.pageOption;
    wx.navigateTo({
      url: `../testResult/testResult?testType=${this.data.pageOption.testType}&class_id=${class_id}&scoreDetail=${JSON.stringify(result)}`,
    })
  },

  //返回成绩列表
  goReviewList(){
    wx.navigateBack({
      delta:2
    });
  },

  //更换习题或关卡
  changeStage(){
    const { curSubjectIndex, testSubjects, lastAnswerType } = this.data;

    this.stopAudio();

    if (lastAnswerType == testSubjects[curSubjectIndex].answer_type) {     //未变更习题类型，未切换关卡
      setTimeout(() => {
        this.setData({
          curSubjectIndex: curSubjectIndex
        })
        this.playAudio();
      }, 500)
    } else {                //切换关卡
      this.setData({
        'stage.number': this.getStage(testSubjects[curSubjectIndex].answer_type),
        'stage.stageNumber': this.getStage(testSubjects[curSubjectIndex].answer_type)
      })
      this.stageSafeMove();
      setTimeout(() => {
        this.setData({
          curSubjectIndex: curSubjectIndex,
        })
        setTimeout(this.playAudio, 4000);
      }, 1000);
    }
  },

  //首次进入初始化
  init(){
    const {answer_type} = this.data.pageOption;
    this.setData({
      'stage.number': this.getStage(answer_type||this.data.testSubjects[0].answer_type),    //设置首次关卡
    })
    this.stageMove();
    setTimeout(() => {
      this.setData({
        isShowPage: true,
      });
      setTimeout(() => {            //页面显示后获取进度条宽度，隐藏元素获取宽度为0
        //取得进度条总宽
        query('.x-slide').then(res => {
          this.setData({
            slideWidth: res.width
          })
        })
        setTimeout(()=>{
          this.playAudio();
        },4000);
      }, 100)
    }, 1000);
  },

  // 开始录音
  recordStart(){
    let recorderManager = this.data.recorderManager;
    const options = {
      duration: 10000,
      sampleRate: 16000,
      numberOfChannels: 1,
      encodeBitRate: 96000,
      format: 'mp3',
      frameSize: 50,
    }
    this.setData({
      isRecording:true
    });
    wx.showToast({
      title: "正在录音...",
      icon: "none",
      duration: 60000
    });
    recorderManager.start(options);
  },
// 停止录音
  recordStop(){
    wx.hideToast();
    let recorderManager = this.data.recorderManager;
    const { english, class_exercises_id, answer_type} = this.data.testSubjects[this.data.curSubjectIndex];
    const test_time = this.data.test_time;
    this.setData({
      isRecording:false
    })
    recorderManager.onStop(res=>{
      let tempFilePath = res.tempFilePath;
      this.setData({
        tempFilePath
      });
      // 上传录音获取测评数据
      uploadRecord({filePath:tempFilePath, text:english}).then(res=>{
        let testResult = JSON.parse(res.data);
         console.log(testResult);
        let score=this.data.testSubjects[this.data.curSubjectIndex].score = parseInt(testResult.EngineResult.score);
        this.data.testSubjects[this.data.curSubjectIndex].wordList = testResult.EngineResult.lines[0].words;
        if(score<60){
          this.data.testSubjects[this.data.curSubjectIndex].result_class = 'color-orange';
        }else if(score>=60 && score<90){
          this.data.testSubjects[this.data.curSubjectIndex].result_class = 'color-blue';
        }else if(score>=90){
          this.data.testSubjects[this.data.curSubjectIndex].result_class = 'color-green';
        }
         this.setData({
           testSubjects:this.data.testSubjects
         })
        const { dspid, class_id,fromPage} = this.data.pageOption;
        if (fromPage == 'test') {    //来自入学测评，参与最后结算
          return;
        }
        // 自动检测切换关卡
        // this.autoNext();
        // 保存测评数据
        console.log('保存题的',test_time)
        saveTestResult({
          dspid,
          class_id,
          class_exercises_id,
          test_time,
          detail: testResult,
          answer_method: answer_type,
          score: parseInt(this.data.testSubjects[this.data.curSubjectIndex].score)||'',
          voice_file: tempFilePath
        })
      })
    });
    recorderManager.stop();
  },
  //停止所有正在播放的音频
  stopAudio(){
    this.data.audioCtx.stop();
    this.data.audioRecordCtx.stop();
    this.setData({
      isPlayRecord: false,
      isPlaying: false
    })
  },

  //自动检测切换下一关
  autoNext(){
    if (this.data.curSubjectIndex + 1 != this.data.testSubjects.length) {
      let curType = this.data.testSubjects[this.data.curSubjectIndex].answer_type;
      let nextType = this.data.testSubjects[this.data.curSubjectIndex + 1].answer_type;
      if (curType != nextType) {
        this.next();
      }
    }else{
      this.next();
    }
  },

  //播放习题音频
  playAudio(){
    if(this.data.isPlayRecord){     //停止录音播放
      this.data.audioRecordCtx.stop();
      this.setData({
        isPlayRecord:false
      })
    }
    //习题播放
    let audioCtx = this.data.audioCtx;
    
    if (this.data.testSubjects[this.data.curSubjectIndex].answer_type==5){  //对话
      audioCtx.src = this.data.testSubjects[this.data.curSubjectIndex].question_voice_url;
    }
    else{
      audioCtx.src = this.data.testSubjects[this.data.curSubjectIndex].voice_url;
    }
    this.setData({
      isPlaying: true,
    })

    if(audioCtx.paused){
      audioCtx.play();
      return;
    }
    audioCtx.play();
  },

  //播放录音
  playRecord(){
    if(this.data.isPlaying){
      this.data.audioCtx.stop();
    }
    let audio = this.data.audioRecordCtx;
    audio.src = this.data.testSubjects[this.data.curSubjectIndex].recorder || this.data.tempFilePath; //优先取历史录音
    this.setData({
      isPlayRecord:true,
      isPlaying:false
    })
    audio.play();
  },

  //取得该类型对应第几关
  getStage(type){
    return {1:1,3:2,4:3,5:4}[type]||1;
  },

// 安全调用关卡提示转场动画
  stageSafeMove(){
    if (this.stageAnimationStatus) {        //转场动画未被占用
      this.stageMove();
    } else {
      this.stageAnimationComplete = this.stageMove; //转场动画被占用，注册事件，释放后再调用
    }
  },
  /**
   * stageAnimationStatus  true 表示动画可以执行，false表示动画被占用
   * stageAnimationComplete 转场动画完成时执行的回调。
   */
  stageMove(){
    if(!this.stageAnimationStatus){          //动画被占用，return
      return;
    }
    this.stageAnimationStatus = false;
    const { screenWidth } = this.data.systemInfo;

    var animation = wx.createAnimation({
      duration: 1000,
      timingFunction: 'ease',
      delay: 0
    })

    this.animation = animation;

    return new Promise((resolve)=>{
      this.animation.translate3d(0, 0, 0).step()      //耗时一秒，左滑进入屏幕

      this.setData({
        animationCanHide: false,
        animationData: this.animation.export()
      })

      setTimeout(function () {
        this.animation.translate3d(-screenWidth, 0, 0).step()   //耗时一秒，左滑离开屏幕
        this.setData({
          animationData: this.animation.export()
        })
      }.bind(this), 4000)

      // 动画重置
      setTimeout(() => {
        animation = wx.createAnimation({
          duration: 0,
          timingFunction: 'step-start',
          delay: 0
        })
        this.animation = animation;
        this.animation.translate3d(2*screenWidth, 0, 0).step();   //重置动画状态
        this.setData({
          animationData: this.animation.export(),
          animationCanHide:true,
        })
        setTimeout(()=>{
          this.stageAnimationStatus =true;
          this.stageAnimationComplete && this.stageAnimationComplete();   //转场动画完成时触发该事件
          this.stageAnimationComplete = null; //执行完成后清空事件绑定
          resolve();
        },100);    //给时间完成setData，否则动画会倒退
      }, 5000)
    })
  },
})