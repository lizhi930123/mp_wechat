// pages/quanzi_list/quanzi_list.js
var app = getApp();
Page({

  /**
   * 页面的初始数据
   */
  data: {
    // 专区列表
    items: false,
    //专区数量
    count: 0,
    //当前用户
    cur_user: {},
    //当前所在专区
    cur_roomid: '',
    //是否有更多的专区
    pagemore: false,
    pagenumber:2,
    touch_start: 0,
    touch_end: 0
  },
  see_code: function(){
    if (this.data.items[0].owner){
      app.data.my_circle = this.data.items[0].circle
      wx.navigateTo({
        url: '../share/share',
      })
    }else{
      wx.showToast({
        title: '您还没有创建过圈子',
        image:'../../image/fail.png',
        mask:true
      })
    }
  },
  create_quanzi:function() {
    if (this.data.items && this.data.items.length==0) {
      app.data.actuser=false;
      wx.reLaunch({
        url: '../../pages/index/index',
      })
    }else {
      if (this.data.items[0].owner) {
        wx.showToast({
          title: '你已创建过圈子',
          icon: 'success',
          // image: '../../image/fail.png',
          duration: 1000,
          mask: true
        })
      }else  {
        app.data.actuser = false;
        wx.reLaunch({
          url: '../../pages/index/index',
        })
      }
    }
    
  },
  f_delete_quanzi(event) {
    var qid = event.currentTarget.dataset.qid;
    wx.showModal({
      title: '删除圈子提示',
      content: '确定删除该圈子?',
      showCancel: true,
      cancelText: '取消',
      cancelColor: 'green',
      confirmText: '确定删除',
      confirmColor: 'red',
      success: function (res) {
        if (res.confirm) {
          console.log("确定删除该圈子: " + qid)
          wx.showLoading({
            title: '删除操作中',
            mask: true,
            success: function (res) { },
            fail: function (res) { },
            complete: function (res) { },
          })
          setTimeout(function () {
            wx.hideLoading();
            wx.showToast({
              title: '删除成功',
              icon: 'success',
              image: '',
              duration: 1000,
              mask: true,
              success: function (res) { },
              fail: function (res) { },
              complete: function (res) { },
            })
          }, 2000)
        } else if (res.cancel) {
          console.log("你取消了该删除圈子操作")
        }
      },
      fail: function (res) { },
      complete: function (res) { },
    })
  },
  f_enter_quanzi(e) {
    // 点击某一圈子 进入圈子
    //console.log(event.currentTarget.dataset.qid);
    //触摸时间距离页面打开的毫秒数  
    var touchTime = this.data.touch_end - this.data.touch_start;

    if (touchTime < 350) {
      var qid = e.currentTarget.dataset.qid;
      app.data.circleid = qid;
      wx.reLaunch({
        url: '../../pages/home/home',
      })
    }
  },
  //按下事件开始  
  mytouchstart: function (e) {
    let that = this;
    that.setData({
      touch_start: e.timeStamp
    })
    console.log(e.timeStamp + '- touch-start')
  },
  //按下事件结束  
  mytouchend: function (e) {
    let that = this;
    that.setData({
      touch_end: e.timeStamp
    })
    console.log(e.timeStamp + '- touch-end')
  },
  delete_clrcle: function (event) {
    console.log(event)
    // wx.showModal({
    //   title: '确定删除该圈子？',
    //   content: '删除',
    //   showCancel: true,
    //   cancelText: '取消',
    //   cancelColor: 'red',
    //   confirmText: '确定',
    //   confirmColor: 'green',
    //   success: function (res) {
    //     if (res.confirm) {

    //     }else {
          
    //     }
    //    },
    //   fail: function (res) { },
    //   complete: function (res) { },
    // })
  },
  //获取更多
  get_more_items: function () {
    if(res.data.pagemore){
      wx.showLoading({
        title: '加载中',
        mask: true
      })
      var that = this;
      wx.request({
        url: app.data.url + 'circle/list',
        data: {
          access_token: app.data.token,
          page: that.data.pagenumber
        },
        header: {
          'Content-Type': 'application/x-www-form-urlencoded'
        },
        method: 'post',
        dataType: 'json',
        success: function (res) {
          wx.hideLoading()
          if(res.data.items){
            console.log(res.data)
            var data = res.data;
            that.setData({
              count: data.count,
              items: that.data.items.concat(data.items),
              pagemore: data.pagemore,
            })
            that.data.pagenumber++;
          }else{
            wx.showToast({
              title: '获取失败，请重试',
              image: '../../image/fail.png',
              duration: 1000,
              mask: true
            })
          }
        },
        fail: function (res) {
          wx.showToast({
            title: '网络连接失败，请重试',
            image: '../../image/fail.png',
            duration: 1000,
            mask: true
          })
        },
        complete: function (res) { },
      })
    }
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    // 获取所有的专区
    var that = this;
    wx.showLoading({
      title: '加载中',
      mask: true
    })
    wx.request({
      url: app.data.url + 'circle/list',
      data: {
        access_token: app.data.token,
        page: 1
      },
      header: {
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      method: 'post',
      dataType: 'json',
      success: function (res) {
        wx.hideLoading()
        if(res.data.items){
          console.log(res.data)
          var data = res.data;
          that.setData({
            count: data.count,
            items: data.items,
            pagemore: data.pagemore,
          })
        }else{
          wx.showToast({
            title: '网络连接失败，请重试',
            image: '../../image/fail.png',
            duration: 1000,
            mask: true
          })
        }
        //网络连接  获取数据之后的操作
      },
      fail: function (res) {
        wx.showToast({
          title: '网络连接失败，请重试',
          image: '../../image/fail.png',
          duration: 1000,
          mask: true
        })
      },
      complete: function (res) { },
    })
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
})