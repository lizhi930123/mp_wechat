//logs.js
var app = getApp();
Page({
  data: {
    items: false,
    ball_func: false,
    self: false,
    word_input: false,
    val: '',
    index: 0,
    focus_input: false,
    date: '',
    reply_name: '发表评论',
    reply_user: {},
    current_user: {},
    pagenumber: 2,
    pagemore: true,
    my_circle: false,
    unread: {
      count: 0
    },
    //  token:'58252d066e998f6bfd67f783.1527755207.64686c25246c2232e1a2ba1597f42b89',
    // token:'58252d066e998f6bfd67f783.1528192546.4fd5cb6689941ed91bcd3d575121eb5d',
    token: 'openId_test_has_user.2222.d079c628104414892fe32a0d78ea1dab',
    comments_pagemore: false,
    comments: [],

  },
  // 查看帖子详情
  view_detail: function (event) {
    var feed_id = event.target.dataset.feedid;

    // 该帖相对于全部帖子数组的一个索引值
    var index = event.target.dataset.index;
    //console.log(feed_id)
    wx.navigateTo({
      // url: '../../pages/details/details?feed_id=' + feed_id,
      url: '../../pages/details/details?feed_id=' + feed_id + "&index=" + index
    })
  },
  //切换发贴
  check_publish: function () {
    //console.log(1)
    app.data.items = this.data.items;
    wx.navigateTo({
      url: '../../pages/publish/publish'
    })
  },
  //切换我的主页
  check_mainpage: function () {
    // console.log(2)
    wx.navigateTo({
      url: '../../pages/mainpage/mainpage'
    })
  },
  //进入点赞列表
  f_like_list: function (event) {
    var id = event.currentTarget.dataset.id, me = event.currentTarget.dataset.me;
    var index = event.currentTarget.dataset.index; // 同步likelist页面中删除点赞记录的时候使用
    wx.navigateTo({
      url: '../likelist/likelist?id=' + id + '&me=' + me+ '&index='+ index
    })
  },
  //获取全部评论
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
        } else {
          wx.showToast({
            title: '获取失败，请稍后重试',
            image: '../../fail.png',
            duration: 2000,
            mask: true
          })
        }
      },
      fail: function () {
        wx.showToast({
          title: '网络链接失败，请稍后重试',
          image: '../../fail.png',
          duration: 2000,
          mask: true
        })
      },
      complete: function () {
        // complete
      }
    })
  },
  //切换身份
  check_pi: function () {
    app.data.actuser = true;
    wx.navigateTo({
      url: '../index/index',
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
  },
  //显示功能球
  show_ball_func: function () {
    this.setData({
      ball_func: true,
      word_input: false
    })
  },
  //聚焦
  f_focus: function () {
    var that = this;
    // setTimeout(function () {
    that.setData({
      focus_input: true
    })
    // }, 10)
  },
  //角色说
  check_play: function () {
    this.setData({
      self: false,
    })
  },
  //本人说
  check_self: function () {
    this.setData({
      self: true,
    })
  },
  //回复
  reply: function () {
    var that = this;
    console.log(that.data.reply_user)
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
          replyuserno: that.data.reply_user.no ? that.data.reply_user.no : ''
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
              duration: 2000
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
            title: '网络链接失败，请稍后重试',
            image: '../../fail.png',
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
  //删除帖子
  delete_item: function (event) {
    var feed_id = event.target.dataset.id, index = event.target.dataset.index, that = this;
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
              that.data.items.splice(index, 1);
              that.setData({
                items: that.data.items
              })
            },
            fail: function () {
              wx.showToast({
                title: '删除失败',
                image: '../../image/fail.png',
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
  //失去焦点
  // no_focus:function(){
  //   this.setData({
  //     focus_input:false
  //   })
  // },
  //下一页
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
        url: app.data.url + 'feed/list',
        data: {
          access_token: app.data.token,
          page: that.data.pagenumber,
          circleid: app.data.circleid,
          t: that.data.date
        },
        method: 'post', // OPTIONS, GET, HEAD, POST, PUT, DELETE, TRACE, CONNECT
        header: {
          'Content-Type': 'application/x-www-form-urlencoded'
        }, // 设置请求的 header
        success: function (res) {
          // success
          if (res.data.items) {
            wx.hideLoading()
            console.log(res)
            var items = res.data.items, newTime = new Date().getTime();
            that.data.pagemore = res.data.pagemore;
            that.data.pagenumber++;
            items = app.checktime(items, app, newTime);
            //////////////////////7_28
            if (!that.data.items) {
              that.data.items = [];
            }
            //////////////////////////
            that.data.items = that.data.items.concat(items);
            console.log(that.data.items)
            // items[9].comments[0].b=1;
            that.setData({
              items: that.data.items
            })
          } else {
            wx.showToast({
              title: '加载失败,请重试',
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
    }
  },
  //跳转msg
  go_msg: function () {
    wx.navigateTo({
      url: '../msg/msg',
    })
  },
  //回复某人
  reply_someone: function (event) {
    var sindex = event.currentTarget.dataset.sindex,
      index = event.currentTarget.dataset.index;
    this.data.index = index;
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
  },
  //显示输入框
  get_word: function (event) {

    var that=this;
    this.data.index = event.target.dataset.index;
    wx.request({
      url: app.data.url + 'feed/check',
      data: {
        access_token:app.data.token,
        userid:app.data.current_user._id,
        no: app.data.current_user.no,
        feedid:that.data.items[that.data.index]._id
      },
      method: 'post', // OPTIONS, GET, HEAD, POST, PUT, DELETE, TRACE, CONNECT
      header: {
        'Content-Type': 'application/x-www-form-urlencoded'
      }, // 设置请求的 header
      success: function (res) {
        
        // success
        if(res.data.result){
          that.data.reply_user = false;
          that.setData({
            val: '',
            word_input: true,
            focus_input: true,
            reply_name: '发表评论'
          })
          // 获取当前帖子的具体布局信息
          // console.log(this.data.items)

          // 页面滚动到合适的位置 ///////////////////////
          // setTimeout(()=>{
          //    if (wx.pageScrollTo) {
          //         var index = parseInt(that.data.index)
          //         var feed = that.data.items[index]
          //         var id = '#feed_' + index;
          //         console.log(feed)
          //         // 获取当前帖子的height scrollHeight 信息
          //         var query = wx.createSelectorQuery()
          //         query.select(id).boundingClientRect()
          //         query.selectViewport().scrollOffset()
          //         query.exec(function (res) {
          //           var top = res[0].top;       // #the-id节点的上边界坐标
          //           var height = res[0].height; // 节点的高度
          //           var scrollTop = res[1].scrollTop //显示区域的竖直滚动位置
          //           console.log('top: ' + top);
          //           console.log('height: ' + height)
          //           console.log('scrollTop: ' + scrollTop)
          //           wx.pageScrollTo({
          //             scrollTop: top + scrollTop-40,
          //           })
          //         });
          //       }
          // },1000)
          
          //////////////////////
        }else if(res.data.error){
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
  },
  //监听输入框内容
  check_val: function (event) {
    this.data.val = event.detail.value;
  },
  //关闭输入框
  close_word: function () {
    this.setData({
      word_input: false,
      focus_input: false,
    })
  },
  // 关闭功能球
  hide_ball_func: function () {
    this.setData({
      ball_func: false
    })
  },
  //进入我的圈子
  enter_group_list: function () {
    wx.navigateTo({
      url: '../../pages/grouplist/grouplist'
    })
  },
  //点赞
  f_like: function (event) {
    var index = event.target.dataset.index;
    //判断多角色扮演
    //end
    var that = this;
    wx.request({
      url: app.data.url + 'like/toggle',
      data: {
        access_token: app.data.token,
        userid: that.data.current_user._id,
        feedid: that.data.items[index]._id,
        no: that.data.current_user.no
      },
      method: 'post', // OPTIONS, GET, HEAD, POST, PUT, DELETE, TRACE, CONNECT
      header: {
        'Content-Type': 'application/x-www-form-urlencoded'
      }, // 设置请求的 header
      success: function (res) {
        // success
        if (res.data.result == 1) {
          that.data.items[index].likeusers.unshift(that.data.current_user);
          wx.showToast({
            title: '点赞成功',
            icon: 'success',
            duration: 2000,
            mask: true
          })
          that.data.items[index].liked = true;
        } else if (res.data.result == -1) {
          for (var i = 0; i < that.data.items[index].likeusers.length; i++) {
            if (that.data.current_user._id == that.data.items[index].likeusers[i]._id) {
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
            duration: 2000,
            mask: true
          })
        }
        that.setData({
          items: that.data.items
        })
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
  },
  //初始化
  onLoad: function () {
    var that = this;
    if (app.data.my_circleid == app.data.circleid) {
      this.setData({
        my_circle: true
      })
    }
    wx.showLoading({
      title: '正在加载',
      mask: true
    })
    that.data.date = new Date().getTime();
    wx.request({
      url: app.data.url + 'feed/list',
      data: {
        access_token: app.data.token,
        circleid: app.data.circleid,
        page: 1,
        t: that.data.date
      },
      method: 'POST', // OPTIONS, GET, HEAD, POST, PUT, DELETE, TRACE, CONNECT
      header: {
        'Content-Type': 'application/x-www-form-urlencoded'
      }, // 设置请求的 header
      success: function (res) {
        // success
        if (res.data.items) {
          console.log(22222)
          wx.hideLoading();
          wx.showToast({
            title: '正在加载',
            icon: 'loading',
            duration: 300,
            mask: true
          })
          wx.stopPullDownRefresh()
          var items = res.data.items, newTime = new Date().getTime();
          that.data.pagemore = res.data.pagemore;
          // 如果所有帖子中不存在我发的贴  那么将该贴加入数组中
          // 如果该贴已经添加成功 那么放弃该操作
          if (app.data.item) {
            for (var i = 0; i < items.length; i++) {
              if (items[i]._id == app.data.item._id) {
                app.data.item = false;
                console.log(items[i]._id, app.data.item._id, i)
                break;
              } else if (i == items.length - 1) {
                items.unshift(app.data.item);
                app.data.item = false;
                console.log(11111111111)
                break;
              }
            }
          }
          // 修改时间的操作
          items = app.checktime(items, app, newTime);
          console.log(items)
          // items[9].comments[0].b=1;
          that.setData({
            items: items,
            unread: res.data.unread,
            current_user: res.data.user,
            pagenumber: 2
          })
          app.data.current_user = res.data.user;
        } else if (res.data.error_code == 400012){
          app.data.actuser = true;
          wx.navigateTo({
            url: '../index/index',
          })
        }else{
          wx.showToast({
            title: '请求失败，请下拉刷新',
            image: '../../image/fail.png',
            duration: 2000,
            mask: true
          })
        }
        //   setTimeout()
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
      complete: function () {
        // complete
      }
    })
  },
  onReachBottom: function () {
    this.get_more_items();
  },
  onPullDownRefresh: function () {
    this.onLoad();
  },
  onShow: function () {
    if (app.data.readmsg) {
      this.data.unread.count = 0;
      this.setData({
        unread: this.data.unread
      })
      this.data.readmsg = false;
    }
    ///////////////////////////////////////////////////////////
    // 从详情列表返回的时候 加载新添加的评论 和 点赞记录
    console.log("--------onShow")

    console.log("-----同步点赞记录 null表示不用修改  changed:false 也表示不用修改--------")
    console.log(app.data.likeduser);

    // 当前帖子的索引
    var index = app.data.detail_index;

    // 1. 同步从detail页 后退 后更改的点赞记录
    // 第一次的时候 不用修改数据
    // 没有做任何修改的时候 也不用加载数据  likeduser { liked: true|false, changed:true|false}
    // changed: 表示点赞记录是否更改过   liked: 变化后点赞结果是 点赞还是取消
    if (app.data.likeduser && app.data.likeduser.changed) {
      console.log("修改数据")


      // 点赞变成true 还是false
      var liked = app.data.likeduser.liked;
      // 当前用户
      var current_user = this.data.current_user;

      // 利用索引index 从 当前所有帖子中 找到 点赞贴 

      // 如果用户点赞从false变成true, 添加点赞数据
      if (liked) {
        this.data.items[index].likeusers.unshift(current_user);
        this.data.items[index].liked = true;
      } else { //用户取消赞

        // 删除current_user点赞用户数据
        var length = this.data.items[index].likeusers.length
        for (var i = 0; i < length; i++) {
          if (current_user._id == this.data.items[index].likeusers[i]._id) {
            this.data.items[index].likeusers.splice(i, 1);
            break;
          }
        }
        this.data.items[index].liked = false;
      }

      // 置空数据
      app.data.likeduser = null;
      app.data.detail_index = false;

      console.log(this.data.items)
      this.setData({
        items: this.data.items
      })

    } //end if

    // 2. 同步从detail页面 后退  后更改的评论数据
    // 同步评论记录 数组为空表示没有
    // 从详情页同步评论记录
    var comments = app.data.comments;
    
    if (comments && comments.length) {
      console.log('同步评论记录数据')
      console.log(comments);

      // 这样添加的评论数据 会放在尾部
      this.data.items[index].comments = this.data.items[index].comments.concat(comments);

      // 添加评论数据 修改数据项

      /* 新评论放在首部
      var commentsArr = this.data.items[index].comments;
      for (var i = 0; i < comments.length; i ++) {
        commentsArr.unshift(comments[i]);
      }
      this.data.items[index].comments = commentsArr;
      */
      this.setData({
        items: this.data.items
      })


      // 置空数据
      app.data.detail_index = false;
      app.data.comments = [];

    }

    // 3. 同步从likelist页面 后退 后删除的点赞记录
    console.log('同步likelist')
    var delete_like = app.data.delete_like;
    if (delete_like.length) {
      var that = this;
      var feed = this.data.items[app.data.detail_index];
      console.log(feed)
      var likeusers = feed.likeusers.filter(function (item, index, self) {
        console.log(item)
        // 表示删除的是自己的点赞记录
        if (delete_like.indexOf(app.data.current_user._id) != -1) {
          feed.liked = false;
        }
        return delete_like.indexOf(item._id) < 0;
      });

      feed.likeusers = likeusers;
      that.data.items[app.data.detail_index] = feed;
      that.setData({
        items: that.data.items
      })
      app.data.delete_like = [];
    }
  },
  onShareAppMessage: function () {
    return {
      title: '自定义转发标题',
      path: '/pages/index?id=123',
      success: function (res) {
        // 转发成功
        console.log("转发成功")
      },
      fail: function (res) {
        // 转发失败
        console.log("转发失败")
      }
    }
  }
})
