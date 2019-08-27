// components/input/input.js
Component({
  behaviors: ['wx://form-field'],
  externalClasses: ['my-class'],
  /**
   * 组件的属性列表
   */
  properties: {
    placeholder: {
      type: String,
      value: ''
    },

    type: {
      type: String,
      value: 'text'
    },
    isPassword: {
      type: Boolean,
      value: false
    },
    confirmType: {
      type: String,
      value: 'done'
    },
    disabled: {
      type: Boolean,
      value: false
    },
    focus: {
      type: Boolean,
      value: false
    },
    maxlength:{
      type:Number,
      value: -1
    },
    value: String,
    cursor: Number
  },

  /**
   * 组件的初始数据
   */
  data: {
    isClearShow: false

  },

  /**
   * 组件的方法列表
   */
  methods: {
    inputListener: function (e) {
      let currentValue = e.detail.value;
      let cursor = e.detail.cursor;
      if (
        currentValue === null ||
        currentValue === undefined ||
        currentValue.length === 0
      ) {
        this.setData({
          isClearShow: false,
          value: currentValue
        });
      } else {
        this.setData({
          isClearShow: true,
          value: currentValue
        });
      }
      let detail = {
        value: currentValue,
        cursor: cursor
      };
      this.triggerEvent('input', detail);
    },
    inputBindFoucs: function (e) {
      let currentValue = e.detail.value;
      let detail = {
        value: currentValue
      };
      if (currentValue){
        this.setData({
          isClearShow: true
        });
      }
      this.triggerEvent('focus', detail);
    },

    inputConfirm: function (e) {
      let currentValue = e.detail.value;
      let detail = {
        value: currentValue
      };
      this.setData({
        value: currentValue,
        isClearShow: false
      });
      this.triggerEvent('confirm', detail);
    },
    //失去焦点事件
    inputBindblur(e) {
      let currentValue = e.detail.value;
      this.setData({
        //value: currentValue,
        isClearShow: false
      });
      this.triggerEvent('blur', currentValue);
    },

    clearTap: function () {
      this.setData({
        isClearShow: false,
        value: ''
      });
    }
  }
});