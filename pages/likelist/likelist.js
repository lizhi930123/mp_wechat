// pages/zan/zan.js
var app = getApp();
Page({

  /**
   * 页面的初始数据
   */
  data: {
    pagemore:false,
    pagenumber:2,
    items:[],
    me:false,
    feedid:'',
    count:0,
    // feedid:'595b10b3e138234955ee8e28'

    // 做 同步点赞删除记录到主页中使用
    feed_index:false,
  },
  f_delete_zan: function (event) {
    var user = event.target.dataset.user, index = event.target.dataset.index,that=this;
    wx.showModal({
      title: '删除记录',
      content: '确定删除该点赞记录?',
      showCancel: true,
      success: function (res) {
        if (res.confirm) {
          //删除该动态
          wx.showLoading({
            title: '删除点赞记录中',
            mask: true,
            success: function (res) { },
            fail: function (res) { },
            complete: function (res) { },
          })
          wx.request({
            url: app.data.url + 'like/delete',
            data: {
              'access_token': app.data.token,
              'feedid': that.data.feedid,
              'userid': user._id,
              'no':user.no
            },
            method: 'post', // OPTIONS, GET, HEAD, POST, PUT, DELETE, TRACE, CONNECT
            header: {
              'Content-Type': 'application/x-www-form-urlencoded'
            }, // 设置请求的 header
            success: function (res) {
              console.log(res.data)
              if (res.data.result) {
                that.data.count--
                wx.setNavigationBarTitle({
                  title: '赞(' + that.data.count + ')'
                })
                that.data.items.splice(index,1)
                
                that.setData({
                  items: that.data.items
                })
                // 同步点赞记录记录到detail和home
                app.data.delete_like.push(user._id);
                app.data.detail_index = that.data.feed_index;

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
              }else{
                wx.showToast({
                  title: '删除失败，请重试',
                  image: '../../fail.png',
                  duration: 1000,
                  mask: true
                })
              }
            },
            fail: function () {
              // fail
              wx.showToast({
                title: '网络连接失败，请重试',
                image: '../../fail.png',
                duration: 1000,
                mask: true
              })
            },
            complete: function () {
              // complete
            }
          })
          // 处理删除的网络请求
        }
      },
      fail: function (res) { },
      complete: function (res) { },
    })
  },
  get_more_items:function(){
    if(res.data.pagemore){
      wx.showLoading({
        title: '正在加载',
        mask: true
      })
      var that = this;
      console.log(that.data.pagenumber)
      wx.request({
        url: app.data.url + 'feed/likeusers_by_feed',
        data: {
          'access_token': app.data.token,
          'feedid': that.data.feedid,
          'page':that.data.pagenumber,
        },
        method: 'post', // OPTIONS, GET, HEAD, POST, PUT, DELETE, TRACE, CONNECT
        header: {
          'Content-Type': 'application/x-www-form-urlencoded'
        }, // 设置请求的 header
        success: function (res) {
          if (res.data.items){
            wx.hideLoading()
            var items = app.checktime(res.data.items, app, new Date().getTime());
            that.data.pagenumber++;
            that.data.pagemore=res.data.pagemore;
            that.setData({
              items: that.data.items.concat(items)
            })
          } else {
            wx.showToast({
              title: '请求失败失败，请稍后重试',
              image: '../../fail.png',
              duration: 1000,
              mask: true
            })
          }
        },
        fail: function () {
          wx.showToast({
            title: '网络连接失败，请稍后重试',
            image: '../../fail.png',
            duration: 1000,
            mask: true
          })
        },
        complete: function () {
          // complete
        }
      })
    }
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    //console.log(options);
    // options {id:feed._id, me:1|0}
    wx.showLoading({
      title: '正在加载',
      mask: true
    })
    this.setData({
      feed_index:options.index||false,
      feedid:options.id,
      me:options.me==1?true:false
    })
    var that = this;
    wx.request({
      url: app.data.url + 'feed/likeusers_by_feed',
      data: {
        'access_token': app.data.token,
        'feedid': that.data.feedid,
        'page': 1,
      },
      method: 'post', // OPTIONS, GET, HEAD, POST, PUT, DELETE, TRACE, CONNECT
      header: {
        'Content-Type': 'application/x-www-form-urlencoded'
      }, // 设置请求的 header
      success: function (res) {
        if(res.data.items){
          wx.hideLoading()
          wx.setNavigationBarTitle({
            title: '赞(' + res.data.count + ')'
          })
          that.data.pagemore = res.data.pagemore;
          var items = app.checktime(res.data.items,app,new Date().getTime());
          that.setData({
            items:items,
            count:res.data.count
          })
          console.log(that.data.items)
        }else{
          wx.showToast({
            title: '请求失败，请稍后重试',
            image: '../../image/fail.png',
            duration: 1000,
            mask: true
          })
        }
      },
      fail: function () {
        wx.showToast({
          title: '网络连接失败，请稍后重试',
          image: '../../image/fail.png',
          duration: 1000,
          mask: true
        })
      },
      complete: function () {
        // complete
      }
    })
  },
  onReachBottom: function () {
    this.get_more_items();
  },
})