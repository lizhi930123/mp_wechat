// pages/quanzi_list/quanzi_list.js
var app = getApp();
Page({

  /**
   * 页面的初始数据
   */
  data: {
    val1:'',
    val2:'',
    val3:'',
    fo1:false,
    fo2:false
  },
  //检测圈子口令
  checkval1:function(event){
    this.data.val1=event.detail.value;
    if(this.data.val1.length==1){
      this.setData({
        fo1:true
      })
    }
  },
  checkval2: function (event) {
    this.data.val2 = event.detail.value;
    if (this.data.val2.length == 1) {
      this.setData({
        fo2: true
      })
    }
  },
  checkval3: function (event) {
    this.data.val3 = event.detail.value
  },
  //提交进入
  enter:function(){
    wx.showLoading({
      title: '正在验证...',
    })
    var val = this.data.val1 + this.data.val2 + this.data.val3;
    wx.request({
      url: app.data.url + 'circle/join',
      data: {
        access_token: app.data.token,
        circleid:app.data.circleid,
        password:val
      },
      header: {
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      method: 'post',
      dataType: 'json',
      success: function (res){
        console.log(res)
        console.log(app.data.circleid)
        if(res.data.result){
          wx.showToast({
            title: '验证成功',
            icon:'success',
            duration:1000,
            mask: true
          })
          setTimeout(function(){
            wx.reLaunch({
              url: '../index/index',
            })
          },1000)
        }else{
          wx.showToast({
          title: '口令错误',
          image: '../../image/fail.png',
          duration: 1000
          })
        }
        //网络连接  获取数据之后的操作
      },
      fail: function (res) {
        wx.showToast({
          title: '网络连接崩溃',
          icon: 'error',
          image: '',
          duration: 1000,
          mask: true,
          success: function (res) { },
          fail: function (res) { },
          complete: function (res) { },
        })
      },
      complete: function (res) { },
    })
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

  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {

  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function () {

  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function () {

  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () {

  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {

  },

  /**
   * 用户点击右上角分享
   */
  // onShareAppMessage: function () {

  //   return {
  //     title: '自定义转发标题',
  //     path: '/pages/index?id=123',
  //     success: function (res) {
  //       // 转发成功
  //       console.log("转发成功")
  //     },
  //     fail: function (res) {
  //       // 转发失败
  //       console.log("转发失败")
  //     }
  //   }
  // }
})