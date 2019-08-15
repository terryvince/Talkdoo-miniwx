// pages/comment/comment.js
const { getCommentForm, postComment} = require('../../services/http.js');
let htmlFormat = {
  escape: function (text) {
    return text.replace(/[<>"&]/g, function (match) {
      switch (match) {
        case '<':
          return '&lt;';
        case '>':
          return '&gt;';
        case '&':
          return '&amp;';
        case '"':
          return '&quot;';
      }
    });
  },
  unescape: function (text) {
    return text.replace(/(&lt;)|(&gt;)|(&amp;)|(&quot;)/g, function (match) {
      switch (match) {
        case '&lt;':
          return '<';
        case '&gt;':
          return '>';
        case '&amp;':
          return '&';
        case '&quot;':
          return '"';
      }
    });
  }
};
Page({

  /**
   * 页面的初始数据
   */
  data: {
    listFormTmp: [],
    postData: {
      dspid: '',
      uid: wx.getStorageSync('localUid'),
      summary_type: '2',
      list: []        //提交的表单数据
    },
    pageOption:{        //页面参数
      dspid:'',
      class_name:''
    },
    isCheckNull: true,   //验证表单非空
    curStarIndex:-1,
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {

    this.setData({
      pageOption: { ...options }
    });
    this.data.postData.dspid= options.dspid;

    wx.showLoading({
      title: '拼命加载中...',
    })
    // 获取评价表单模板
    getCommentForm().then(res=>{
      if(res.data.code==200 && res.data.data.length!=0){
        var data = res.data.data;
        this.data.listFormTmp = data.sort((a, b)=> a.display_order - b.display_order);
        this.data.listFormTmp.forEach(function (v) {
          v.content = ''
        })
        this.setData({
          listFormTmp:this.data.listFormTmp
        })
      }
    }).finally(()=>{
      wx.hideLoading();
    })

  },
  // 提交评价
  post(){
    if (this.data.isCheckNull) {
      wx.showToast({
        title: '请完善所有信息后提交！',
        icon:'none'
      })  
      return;
    }
    this.data.postData.list.forEach(function (v) {
      v.answer = htmlFormat.escape(v.answer);     //转义处理
    });
    wx.showLoading({
      title: '正在提交...',
    })
    postComment(this.data.postData).then(res=>{
      if(res.data.code==200){
        wx.showToast({
          title:'提交评价成功！',
          duration:1000
        })
        setTimeout(wx.navigateBack,1000,{delta:1});
      }
    }).finally(()=>{
      wx.hideLoading();
    })

  },
  // 星级变化
  starChange(e) {
    const {index , itemIndex} = e.currentTarget.dataset;
    this.data.listFormTmp[itemIndex].content = index+1;
    this.setData({
      curStarIndex:index
    })
    this.checkIsNull();
  },
  //文本变化
  textChange(e){
    const { itemIndex } = e.currentTarget.dataset;
    this.data.listFormTmp[itemIndex].content = e.detail.value;
    this.checkIsNull();
  },
  //检测非空
  checkIsNull: function () {
    let me = this;
    let i = 0;
    this.data.postData.list = [];
    this.data.listFormTmp.forEach(function (v, index) {
      var ob = {};
      v.content = ('' + v.content).trim();
      v.content = v.content.replace(/\uD83C[\uDF00-\uDFFF]|\uD83D[\uDC00-\uDE4F]/g, "");  //屏蔽表情
      if (!v.content) {
        i++;
      }
      // ob.answer=v.tmplate_content+':'+v.content;   弃用，不再用：分隔评价标题和内容，直接传内容
      ob.answer = '' + v.content;
      ob.summary_tmplate_id = v.summary_tmplate_id;
      me.data.postData.list.push(ob)
    });
    this.setData({
      isCheckNull: i > 0
    })

  },

})