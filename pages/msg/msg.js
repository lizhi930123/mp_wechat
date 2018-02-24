// pages/quanzi_xiaoxi/quanzi_xiaoxi.js
var app = getApp();
Page({

  /**
   * 页面的初始数据
   */
  data: {
    pagemore:false,
    items:false,
    pagenumber:2
  },
  f_see_detail: function () {
    wx.navigateTo({
      url: '/pages/post_detail/post_detail',
      success: function (res) { },
      fail: function (res) { },
      complete: function (res) { },
    })
  },
  
  f_delete_xiaoxi:function(event) {
    var id=event.target.dataset.msgid,index=event.target.dataset.index;
    var that = this;
    wx.showModal({
      title: '删除提示',
      content: '确定删除该消息?',
      showCancel: true,
      success: function (res) {
        if (res.confirm) {
          wx.showLoading({
            title: '删除消息中',
            mask: true,
            success: function (res) { },
            fail: function (res) { },
            complete: function (res) { },
          })
          //删除该动态
          wx.request({
            url: app.data.url + 'message/delete',
            data: {
              access_token:app.data.token,
              messageid:id
            },
            method: 'post', // OPTIONS, GET, HEAD, POST, PUT, DELETE, TRACE, CONNECT
            header: {
              'Content-Type': 'application/x-www-form-urlencoded'
            }, // 设置请求的 header
            success: function (res) {
              // success
              if(res.data.result){
                that.data.items.splice(index, 1);
                that.setData({
                  items: that.data.items
                })
                wx.hideLoading();
                wx.showToast({
                  title: '删除成功',
                  icon: 'success',
                  duration: 1000,
                  mask: true
                })
              }else if(res.data.error){
                wx.showToast({
                  title: res.data.error,
                  image:'../../image/fail.png',
                  duration: 1000,
                  mask: true
                })
              }
            }
          })
          // 处理删除的网络请求
        } else if (res.cancel) {
        }
      },
      fail: function (res) {
        wx.showToast({
          title:'删除失败，请检查网络',
          image: '../../image/fail.png',
          duration: 1000,
          mask: true
        })
      },
      complete: function (res) { },
    })
  },

  /**
   * 生命周期函数--监听页面加载
   */
  //进入帖子详情
  f_see_detail:function(event){
    var feed_id=event.currentTarget.dataset.feedid;
    wx.navigateTo({
      url: '../../pages/details/details?feed_id=' + feed_id
    })
  },
  get_more_items: function () {
    console.log(this.data.pagemore)
    if (this.data.pagemore) {
      this.data.pagemore = false;
      var that = this;
      wx.showLoading({
        title: '加载中',
        mask: true
      })
      wx.request({
        url: app.data.url + 'message/list',
        data: {
          access_token: app.data.token,
          circleid:app.data.circleid,
          page: that.data.pagenumber
          // no: that.data.current_user.no,
          // userid: that.data.current_user._id
        },
        method: 'post', // OPTIONS, GET, HEAD, POST, PUT, DELETE, TRACE, CONNECT
        header: {
          'Content-Type': 'application/x-www-form-urlencoded'
        },  // 设置请求的 header
        success: function (res) {
          // success
          if(res.data.items){
            wx.hideLoading()
            console.log(res)
            var items = res.data.items, newTime = new Date().getTime();
            that.data.pagemore = res.data.pagemore;
            that.data.pagenumber++;
            items = app.checktime(items, app, newTime);
            that.data.items = that.data.items.concat(items);
            console.log(that.data.items)
            // items[9].comments[0].b=1;
            that.setData({
              items: that.data.items
            })
          } else {
            wx.showToast({
              title: '加载失败',
              icon: 'success',
              duration: 2000,
              mask: true
            })
          }
          //   setTimeout()
        },
        fail: function () {
          // fail
          wx.showToast({
            title: '网络连接失败，请重试',
            icon: 'success',
            duration: 2000,
            mask: true
          })
        },
        complete: function () {
          // complete
        }
      })
    }
  },
  onLoad: function (options) {
    var that=this;
    wx.showLoading({
      title: '正在加载'
    })
    wx.request({
      url: app.data.url + 'message/list',
      data: {
        access_token: app.data.token,
        circleid:app.data.circleid,
        page:1
      },
      method: 'post', // OPTIONS, GET, HEAD, POST, PUT, DELETE, TRACE, CONNECT
      header: {
        'Content-Type': 'application/x-www-form-urlencoded'
      }, // 设置请求的 header
      success: function (res) {
        // success
        if(res.data.items){
          setTimeout(() => {
            wx.hideLoading()
          }, 300)
          app.data.readmsg=true;
          wx.stopPullDownRefresh()
          var items = res.data.items;
          that.data.pagemore=res.data.pagemore;
          items = app.checktime(items, app, new Date().getTime())
          that.setData({
            items: res.data.items
          })
        }else{
          wx.showToast({
            title: '请求失败，请下拉刷新',
            image: '../../image/fail.png',
            duration: 2000,
            mask: true
          })
        }
      },
      fail:function(){
        wx.showToast({
          title: '网络链接失败，请稍后重试',
          image: '../../image/fail.png',
          duration: 2000,
          mask: true
        })
      },
    })
  },
  onReachBottom: function () {
    this.get_more_items();
  },
  onPullDownRefresh: function () {
    this.onLoad();
  },
})