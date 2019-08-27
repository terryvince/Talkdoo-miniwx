// pages/testType/testType.js
const { getClassPackageByType, getClassByPackageId, getReviewSubject } = require('../../services/http.js');
Page({

  /**
   * 页面的初始数据
   */
  data: {
    experienceClass:{},
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    
  },

  goTestClass(e){
    const type = e.currentTarget.dataset.id;
    //取课包
    getClassPackageByType({}).then(res => {
      if (res.data.code == 200 && res.data.data.length != 0) {
        let pkg_id = res.data.data.find(v => v.test_type == type).pkg_id;
        return getClassByPackageId({ pkg_id });   //获取课程
      }
    }).then(res => {
      if (res && res.data) {
        const { class_id } = res.data[0];
        if(res.data.length==1){         //1个课程直接跳
          //获取习题，看有无习题
          getReviewSubject({ class_id }).then(res => {
            console.log(res.data);
            if (res.data.length == 0) {
              wx.showModal({
                title: '提示',
                content: '该课程暂无复习题哦',
                confirmText: "确定",
                showCancel: false,
              })
              return;
            }
            wx.navigateTo({
              url: `../review/review?class_id=${class_id}&fromPage=test&testType=${type}`,
            })
          })
        }else{                    //两个以上课程去选择
          wx.navigateTo({
            url: `../testClass/testClass?type=${type}`,
          })
        }
      }else{
        console.error('没有课程')
      }
    })
  }
})