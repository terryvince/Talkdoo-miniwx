// pages/wordsCard/wordsCard.js
Page({

  /**
   * 页面的初始数据
   */
  data: {
    imgUrls: [
      'https://images.unsplash.com/photo-1551334787-21e6bd3ab135?w=640',
      'https://images.unsplash.com/photo-1551214012-84f95e060dee?w=640',
      'https://images.unsplash.com/photo-1551446591-142875a901a1?w=640'
    ],
    currentIndex: 0,
    preIndex:null,
    duration: 1000
  },
  
  swiperChange: function (e) {

    this.setData({
      currentIndex: e.detail.current
    })

    // if (e.detail.source == "touch") {
    //   //防止swiper控件卡死
    //   if (this.data.currentIndex == 0 && this.data.preIndex > 1) {//卡死时，重置current为正确索引
    //     this.setData({ currentIndex: this.data.preIndex });
    //   }
    //   else {//正常轮转时，记录正确页码索引
    //     this.setData({ preIndex: this.data.currentIndex });
    //   }
    // }
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {

  },
})