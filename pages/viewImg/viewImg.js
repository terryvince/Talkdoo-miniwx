// pages/viewImg/viewImg.js
const { getClassInfo } = require('../../services/http.js');
Page({

  /**
   * 页面的初始数据
   */
  data: {
    pageOption: {
      imgUrl:'',                                   //图片地址
      class_id: '',                                //分享独有
      fromShare: false,                            //保留选项，来自分享
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
    const { class_id, imgUrl} = options;
    this.data.pageOption = {...options};

    if(options.fromShare){
      this.setData({
        'pageOption.fromShare':true
      })
    }
    this.setData({
      'pageOption.imgUrl': decodeURIComponent(imgUrl),
      'pageOption.class_id': class_id
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

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {
    let { imgUrl, class_id} = this.data.pageOption;
    imgUrl = encodeURIComponent(imgUrl);
    this.data.shareInfo.path = `/pages/viewImg/viewImg?imgUrl=${imgUrl}&class_id=${class_id}&fromShare=true`;
    return this.data.shareInfo;
  }
})