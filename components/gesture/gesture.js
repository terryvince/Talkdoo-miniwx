// component/gesture.js
Component({
  /**
   * 组件的属性列表
   */
  properties: {
  },

  /**
   * 组件的初始数据
   */
  data: {
    startX:0,
    endX:0,
    moveFlag:true   //是否启用滑动监听
  },

  /**
   * 组件的方法列表
   */
  methods: {
    // 触摸开始事件  
    touchStart: function (e) {
      this.data.startX = e.touches[0].pageX; // 获取触摸时的原点
      this.data.moveFlag = true;
    },
    // 触摸移动事件  
    touchMove: function (e) {
      this.data.endX = e.touches[0].pageX; // 获取触摸时的原点

      if (this.data.moveFlag) {

        if (this.data.endX - this.data.startX > 30) {     //右滑
          this.triggerEvent('swiperight', {
            startX: this.data.startX,
            endX: this.data.endX
          }, {});
          this.data.moveFlag = false;

        }

        if (this.data.startX - this.data.endX > 30) {     //左滑
          this.triggerEvent('swipeleft', {
            startX: this.data.startX,
            endX: this.data.endX
          }, {});
          this.data.moveFlag = false;

        }

      }
    },
    // 触摸结束事件  
    touchEnd: function (e) {
      this.data.moveFlag = true; // 回复滑动事件
    },  

  }
})
