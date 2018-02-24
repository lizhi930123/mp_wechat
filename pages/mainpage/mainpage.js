//index.js
//获取应用实例
var app = getApp()
Page({
  data: {
    userInfo: {},
    items:[],
    self: false,
    word_input: false,
    val: '',
    index: 0,
    date: '',
    reply_name: '发表评论',
    reply_user: {},
    getmore_switch: true,
    pagenumber: 2,
    pagemore:false,
    comments_pagemore: false,
    comments: [],
    focus_input:false
  },
  // 查看帖子详情
  view_detail: function (event) {
    var feed_id = event.target.dataset.feedid;
    //console.log(feed_id)
    wx.navigateTo({
      url: '../../pages/details/details?feed_id=' + feed_id,
    })
  },
  //删除帖子
  delete:function(event){
    var feed_id = event.target.dataset.id, index=event.target.dataset.index,that=this;
    console.log(feed_id)
    wx.showModal({
      title: '删除提示',
      content: '确定删除该动态?',
      showCancel: true,
      success: function (res) {
        if (res.confirm) {
          //删除该动态
          console.log("删除该动态")
          wx.showLoading({
            title: '删除动态中',
            mask: true
          })
          wx.request({
            url: app.data.url + 'feed/delete',
            data: {
              access_token: app.data.token,
              feedid: feed_id
            },
            method: 'post',
            header: {
              'Content-Type': 'application/x-www-form-urlencoded'
            },
            success: function (res) {
              //wx.hideLoading();
              console.log(res.data)
              wx.showToast({
                title: '删除成功',
                icon: 'success',
                duration: 2000,
                mask: true
              })
              that.data.items.splice(index,1);
              that.setData({
                items:that.data.items
              })

              // 后退的时候 将数据同步到Home 页面当中  暂不做 7_28

            },
            fail: function () {
              wx.showToast({
                title: '删除失败',
                image:'../../image/fail.png',
                duration: 2000,
                mask: true
              })
            }
          })

        } else if (res.cancel) {
          //取消操作
          console.log("你取消删除该动态")
        }
      },
      fail: function (res) { },
      complete: function (res) { },
    })
  },
  //事件处理函数
  get_all_comments: function (event) {
    var i = 1, id = event.target.dataset.id, index = event.target.dataset.index;
    this.get_comments(i, id, index);
  },
  get_comments: function (i, id, index) {
    var that = this;
    wx.request({
      url: app.data.url + 'feed/comments_by_feed',
      data: {
        'access_token': app.data.token,
        'feedid': id,
        'page': i,
      },
      method: 'post', // OPTIONS, GET, HEAD, POST, PUT, DELETE, TRACE, CONNECT
      header: {
        'Content-Type': 'application/x-www-form-urlencoded'
      }, // 设置请求的 header
      success: function (res) {
        if (res.data.items) {
          that.data.comments = that.data.comments.concat(res.data.items)
          console.log(that.data.comments, index)
          if (res.data.pagemore) {
            that.get_comments(++i, id, index)
          } else {
            that.data.items[index].comments = that.data.comments;
            that.setData({
              items: that.data.items,
              comments_pagemore: false
            })
          }
        }
      },
      fail: function () {
        // fail
      },
      complete: function () {
        // complete
      }
    })
  },
  //显示图片
  showimg: function (event) {
    console.log(event)
    var index = event.target.dataset.index,
      sindex = event.target.dataset.sindex;
    var photo = [];
    for (var i = 0; i < this.data.items[index].photos.length; i++) {
      photo.push(this.data.items[index].photos[i].large)
    }
    console.log(photo)
    wx.previewImage({
      current: photo[sindex], // 当前显示图片的http链接
      urls: photo // 需要预览的图片http链接列表
    })

  },//角色说
  check_play: function () {
    this.setData({
      self: false
    })
  },
  //本人说
  check_self: function () {
    console.log(1)
    this.setData({
      self: true
    })
  },
  //回复
  reply: function () {
    var that = this;
    console.log(this.data.val)
    if (this.data.val) {
      wx.request({
        url: app.data.url + 'comment/create',
        data: {
          access_token: app.data.token,
          userid: app.data.current_user._id,
          feedid: that.data.items[that.data.index]._id,
          b: that.data.self ? 1 : 0,
          content: that.data.val,
          replyuserid: that.data.reply_user._id ? that.data.reply_user._id : '',
          replyuserno: that.data.reply_user._no ? that.data.reply_user._no : ''
        },
        method: 'post', // OPTIONS, GET, HEAD, POST, PUT, DELETE, TRACE, CONNECT
        header: {
          'Content-Type': 'application/x-www-form-urlencoded'
        },  // 设置请求的 header
        success: function (res) {
          // success
          console.log(res)
          if (res.data.error) {
            wx.showToast({
              title: res.data.error,
              image: '../../image/fail.png',
              duration: 2000,
              mask: true
            })
          } else {
            wx.showToast({
              title: '评论成功',
              icon: 'success',
              duration: 2000,
              mask: true
            })
            var comment = {
              content: that.data.val,
              b: that.data.self ? 1 : 0,
              time: {
                create: '刚刚'
              },
              replyuser: that.data.reply_user.name ? that.data.reply_user : '',
              user: app.data.current_user
            }
            comment.user.me = true;
            that.data.items[that.data.index].comments.push(comment)
            that.setData({
              items: that.data.items
            })
          }
        },
        fail: function () {
          wx.showToast({
            title: '网络异常',
            image: '../../image/fail.png',
            duration: 2000,
            mask: true
          })
        },
        complete: function () {
          that.setData({
            val: '',
            word_input: false
          })
          // complete
        }
      })
    } else {
      this.setData({
        reply_name: '请输入评论内容！'
      })
    }
  },
  //回复某人
  reply_someone: function (event) {
    var sindex = event.currentTarget.dataset.sindex,
      index = event.currentTarget.dataset.index;
    this.data.index = index;
    var that=this;
    //判断多角色扮演
    wx.request({
      url: app.data.url + 'feed/check',
      data: {
        access_token: app.data.token,
        userid: app.data.current_user._id,
        no: app.data.current_user.no,
        feedid: that.data.items[that.data.index]._id
      },
      method: 'post', // OPTIONS, GET, HEAD, POST, PUT, DELETE, TRACE, CONNECT
      header: {
        'Content-Type': 'application/x-www-form-urlencoded'
      }, // 设置请求的 header
      success: function (res) {
        // success
        if (res.data.result) {
          that.data.reply_user = that.data.items[index].comments[sindex].user;
          that.setData({
            word_input: true,
            reply_name: '回复' + that.data.items[index].comments[sindex].user.name
          })
          that.setData({
            focus_input: true
          })
        } else if (res.data.error) {
          wx.showToast({
            title: res.data.error,
            image: '../../image/fail.png',
            duration: 2000,
            mask: true
          })
        }
      },
      fail: function () {
        wx.showToast({
          title: '网络链接失败，请稍后重试',
          image: '../../image/fail.png',
          duration: 2000,
          mask: true
        })
      },
      complete: function () {
        // complete
      }
    })
    //end
  },
  //显示输入框
  get_word: function (event) { 
    this.data.index = event.target.dataset.index;
    //判断多角色扮演
    var that=this;
    wx.request({
      url: app.data.url + 'feed/check',
      data: {
        access_token: app.data.token,
        userid: app.data.current_user._id,
        no: app.data.current_user.no,
        feedid: that.data.items[that.data.index]._id
      },
      method: 'post', // OPTIONS, GET, HEAD, POST, PUT, DELETE, TRACE, CONNECT
      header: {
        'Content-Type': 'application/x-www-form-urlencoded'
      }, // 设置请求的 header
      success: function (res) {
        // success
        if (res.data.result) {
          that.setData({
            word_input: true
          })
          that.setData({
            focus_input: true
          })
          that.setData({
            reply_name: '发表评论'
          })
        } else if (res.data.error) {
          wx.showToast({
            title: res.data.error,
            image: '../../image/fail.png',
            duration: 2000,
            mask: true
          })
        }
      },
      fail: function () {
        wx.showToast({
          title: '网络链接失败，请稍后重试',
          image: '../../image/fail.png',
          duration: 2000,
          mask: true
        })
      },
      complete: function () {
        // complete
      }
    })
    //end
  },
  //监听输入框内容
  check_val: function (event) {
    this.data.val = event.detail.value;
  },
  //关闭输入框
  close_word: function () {
    this.setData({
      word_input: false
    })
  },
  //点赞
  f_like: function (event) {
    var index = event.target.dataset.index;
    var that = this;
    //判断多角色扮演
    //end
    wx.request({
      url: app.data.url + 'like/toggle',
      data: {
        access_token: app.data.token,
        userid: app.data.current_user._id,
        feedid: that.data.items[index]._id,
        no: app.data.current_user.no
      },
      method: 'post', // OPTIONS, GET, HEAD, POST, PUT, DELETE, TRACE, CONNECT
      header: {
        'Content-Type': 'application/x-www-form-urlencoded'
      }, // 设置请求的 header
      success: function (res) {
        // success
        if (res.data.result == 1) {
          that.data.items[index].likeusers.unshift(app.data.current_user);
          wx.showToast({
            title: '点赞成功',
            icon: 'success',
            duration: 2000,
            mask: true
          })
          that.data.items[index].liked = true;
        } else if (res.data.result == -1) {
          for (var i = 0; i < that.data.items[index].likeusers.length; i++) {
            if (app.data.current_user._id == that.data.items[index].likeusers[i]._id) {
              that.data.items[index].likeusers.splice(i, 1);
              break;
            }
          }
          wx.showToast({
            title: '取消点赞',
            icon: 'success',
            duration: 2000,
            mask: true
          })
          that.data.items[index].liked = false;
        } else if (res.data.error) {
          wx.showToast({
            title: res.data.error,
            image: '../../image/fail.png',
            duration: 2000
          })
        }
        that.setData({
          items: that.data.items
        })
      },
      fail: function () {
        // fail
      },
      complete: function () {
        // complete
      }
    })
  },
  //下一页
  get_more_items: function () {
    console.log(this.data.pagemore)
    if (this.data.pagemore) {
      this.data.pagemore=false;
      var that = this;
      wx.showLoading({
        title: '加载中',
        mask: true
      })
      wx.request({
        url: app.data.url +'feed/list_mine',
        data: {
          access_token: app.data.token,
          page: that.data.pagenumber,
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
          }else{
            wx.showToast({
              title: '加载失败',
              image: '../../image/fail.png',
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
            image: '../../image/fail.png',
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
  f_like_list: function (event) {
    var id = event.currentTarget.dataset.id, me = event.currentTarget.dataset.me;
    wx.navigateTo({
      url: '../likelist/likelist?id=' + id + '&me=' + me
    })
  },
  onLoad: function () {
    var that=this;
    wx.showLoading({
      title:'正在加载'
    })
    wx.request({
      url: app.data.url +'feed/list_mine', //仅为示例，并非真实的接口地址
        data: {
          'access_token': app.data.token,
          // 'no': that.data.current_user.no,
          'page': 1,
          // 'userid': that.data.current_user._id,
        },
        method: 'post',
        header: {
          'Content-Type': 'application/x-www-form-urlencoded'
        },
        success: function(res) {
            console.log(res.data)
            setTimeout(() => {
              wx.hideLoading()
            }, 300)
            if(res.data.items){
              // setTimeout(function () {
              //   wx.hideLoading()
                wx.stopPullDownRefresh()
              // }, 1000)
              var items = res.data.items, newTime = new Date().getTime();
              that.data.pagemore=res.data.pagemore;
              items = app.checktime(items, app, newTime);
              that.data.pagenumber = 2;
              that.setData({
                items: res.data.items
              })
            }else{
              wx.showToast({
                title: '加载失败，请下拉刷新',
                image: '../../image/fail.png',
                duration: 2000,
                mask: true
              })
            }
        },
        fail: function () {
          wx.hideLoading()
          wx.showToast({
            title: '网络链接失败，请稍后重试',
            image: '../../image/fail.png',
            duration: 2000,
            mask: true
          })
        },
    })
    console.log('onLoad')
    var that = this
    //调用应用实例的方法获取全局数据
    app.getUserInfo(function(userInfo){
      //更新数据
      that.setData({
        userInfo:userInfo
      })
    })
  },
  onReachBottom: function () {
    this.get_more_items();
  },
  onPullDownRefresh: function () {
    this.onLoad();
  },
})
