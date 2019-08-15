// pages/review/review.js
Page({

  /**
   * 页面的初始数据
   */
  data: {
    animationData:'',
    systemInfo: wx.getSystemInfoSync()
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {

  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {
    this.stageAnimationStatus=true;       //转场动画标记初始化
    this.stageMove();
  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {
    // this.stageSafeMove();
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
          animationData: this.animation.export()
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