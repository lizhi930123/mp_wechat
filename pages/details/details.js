// pages/post_detail/post_detail.js
var app = getApp();
Page({

  /**
   * 页面的初始数据
   */
  data: {
    //文章详细信息
    feed: {},
    //评论的数量  因为要收缩起来
    count: 0,
    // input样式
    self: false,
    word_input: false,
    //评论的内容绑定
    val: '',
    // 评论框placeholder内容
    reply_name: '发表评论',
    // 评论回复某人
    reply_user: {},
    // 是否已经点赞
    liked: false,
    // 是否显示评论输入框
    inputHidden: true,
    pagemore:false,
    pagenumber:2,

    // 同步帖子的数据 在返回首页的时候
    index:false
  },
  loadMoreData: function () {
    console.log('load more')
  },
  // 点击发表按钮的时候 发表评论
  reply: function () {
    var that = this;
    if (!that.data.val) {
      wx.showToast({
        title: '请输入评论内容',
        icon: 'success',
        image: '',
        duration: 2000,
        mask: true
      })
      return;
    }
    var reply_user = this.data.reply_user;
    // 构造评论项
    var item = {
      b: that.data.self ? 1 : 0,
      content: that.data.val,
      user: that.data.current_user,
      reply_user: reply_user ? reply_user : "",//对象存在即为恢复某人
      time: {
        create: '刚刚'
      }
    };
    var data = {
      access_token: app.data.token,
      userid: app.data.current_user._id,
      feedid: that.data.feed._id,
      content: that.data.val,
      b: that.data.self ? 1 : 0,
    };
    // 回复个人还是文章
    if (reply_user) { //表示回复某人
      //console.log("回复用户:");
      //console.log(reply_user)
      data.replyuserid = reply_user._id;
      data.replyuserno = reply_user.no;
    } else { //表示回复文章主人
      //console.log("回复文章:" + this.data.feed._id, this.data.val);
      data.replyuserid = "";
    }
    console.log(data)
    wx.request({
      url: app.data.url + 'comment/create',
      data: data,
      method: 'post',
      dataType: 'json',
      header: {
        'Content-Type': 'application/x-www-form-urlencoded'
      }, 
      success: function (res) {
        if(res.data.result){
          wx.showToast({
            title: '评论成功',
            icon: 'success',
            image: '',
            duration: 2000,
            mask: true,
          });
          // 数据存入数组
          console.log(that.data.current_user)
          var comment = res.data.comment;
          comment.time.create='刚刚';
          comment.user.me=true;
          that.data.feed.comments.push(comment);
          that.data.feed.stat.comment++;
          // 重置部分数据
          that.setData({
            feed: that.data.feed,
          })
          // 同步评论记录到home主页中////////////////////
          app.data.detail_index = that.data.index;
          app.data.comments.push(comment);
          /////////////////////////////
        }else if(res.data.error){
          wx.showToast({
            title: res.data.error,
            image: '../../image/fail.png',
            duration: 2000,
            mask: true,
          });
        }else{
          wx.showToast({
            title:'评论失败',
            image: '../../image/fail.png',
            duration: 2000,
            mask: true,
          });
        }
      },
      fail: function (res) {
        wx.showToast({
          title: '网络连接失败，请重试',
          image: '../../image/fail.png',
          duration: 2000,
          mask: true,
        });
      },
      complete: function (res) { 
        that.setData({
          val: '',
          word_input: false,
        })
      },
    })
  },
  // 发表评论时的数据绑定
  check_val: function (event) {
    var commentContent = event.detail.value;
    //console.log(commentContent)
    this.setData({
      val: commentContent
    })
  },
  //角色说
  check_play: function () {
    this.setData({
      self: false
    })
  },
  //本人说
  check_self: function () {
    this.setData({
      self: true
    })
  },

  // 隐藏评论框input
  f_hide_commnetInput: function () {
    this.data.inputHidden = false;
    this.setData({
      word_input: false
    })
  },
  
  // 删帖操作 (只能删除自己的帖子)
  f_delete_post: function (event) {
    var feed_id = event.currentTarget.dataset.feedid;
    var that = this;
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
              //console.log(res.data)
              if(res.data.result){
                wx.showToast({
                  title: '删除成功',
                  icon: 'success',
                  duration: 2000,
                  mask: true
                })
                wx.reLaunch({
                  url: '../../pages/home/home',
                })
              }else{
                wx.showToast({
                  title: '删除失败,请重试',
                  image:'../../image/fail.png',
                  duration: 2000,
                  mask: true
                })
              }
            },
            fail: function () {
              wx.showToast({
                title: '网络连接失败，请重试',
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
  // 点击 多少人赞过 跳转到
  f_nav_zan_list: function (event) {
    var id = event.target.dataset.id, me = event.target.dataset.me;
    wx.navigateTo({
      url: '../likelist/likelist?id=' + id + '&me=' + me
    })
  },

  // 点击点赞图标
  f_change_like: function (event) {
    var that = this;
    var feed_id = event.currentTarget.dataset.feedid;
    //判断多角色扮演
    //end
    wx.request({
      url: app.data.url + 'like/toggle',
      data: {
        access_token: app.data.token,
        userid: app.data.current_user._id,
        feedid: feed_id,
        no: app.data.current_user.no
      },
      method: 'post',
      header: {
        'Content-Type': 'application/x-www-form-urlencoded'
      }, 
      success: function (res) {
        console.log(res.data)
        if (res.data.result == 1) {
          wx.showToast({
            title: '点赞成功',
            icon: 'success',
            duration: 2000,
            mask: true
          })
          that.data.feed.liked=true;
          that.data.feed.stat.like++;
          that.data.feed.likeusers.unshift(app.data.current_user)

          // 同步点赞记录到home主页中 /////////////
          app.data.detail_index = that.data.index;
          app.data.likeduser = {
            // 点赞用户
            // current_user:that.data.current_user,

            liked:true,

            changed: app.data.likeduser?!app.data.likeduser.changed:true
          }
          ///////////////////////////////////////

        } else if (res.data.result == -1){
          wx.showToast({
            title: '取消点赞',
            icon: 'success',
            duration: 2000,
            mask: true
          })
          that.data.feed.liked = false;
          that.data.feed.stat.like--;
          //删除当前用户的点赞数据
          var length = that.data.feed.likeusers.length
          for (var i = 0; i < length; i++) {
            if (app.data.current_user._id == that.data.feed.likeusers[i]._id) {
              that.data.feed.likeusers.splice(i, 1);
              break;
            }
          }

          // 同步点赞记录到home主页中///////////////////
          app.data.detail_index = that.data.index;
          app.data.likeduser = {
            // 点赞用户
            // current_user:that.data.current_user,

            liked:false,

            changed: app.data.likeduser ? !app.data.likeduser.changed : true
          }////////////////////////
          
        } else if (res.data.error) {
          wx.showToast({
            title: res.data.error,
            image: '../../image/fail.png',
            duration: 2000,
            mask: true
          })
        }
        // 将当前用户添加到点赞的用户列表中  点赞图像使用

        that.setData({
          feed:that.data.feed
        });
      },
      fail:function(){
        wx.showToast({
          title: '网络连接失败，请重试',
          image: '../../image/fail.png',
          duration: 2000
        })
      },
    })

  },
  // 点击评论图标
  f_comment_icon__click: function (event) {
    //console.log(event.target.dataset.replyuser)
    //判断多角色扮演
    //end
    var that = this;
    var reply_user = event.target.dataset.replyuser;
    wx.request({
      url: app.data.url + 'feed/check',
      data: {
        access_token: app.data.token,
        userid: app.data.current_user._id,
        no: app.data.current_user.no,
        feedid: that.data.feed._id
      },
      method: 'post', // OPTIONS, GET, HEAD, POST, PUT, DELETE, TRACE, CONNECT
      header: {
        'Content-Type': 'application/x-www-form-urlencoded'
      }, // 设置请求的 header
      success: function (res) {
        // success
        if (res.data.result) {
          that.setData({
            focus_input: true
          })
          that.data.word_input = true;
          var reply_name = reply_user ? "回复: " + reply_user.name : '发表评论';
          that.setData({ word_input: true, reply_user: reply_user, reply_name: reply_name });
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
  //获取更过评论
  get_more_comments:function(){
    if(this.data.pagemore){
      wx.showLoading({
        title: '加载中',
        mask: true
      })
      this.data.pagemore=false;
      this.get_comments(1, this.data.pagenumber)
    }
  },
  get_comments:function(n,i){
    var that=this;
    wx.request({
      url: app.data.url + 'feed/comments_by_feed',
      data: {
        'access_token': app.data.token,
        'feedid':that.data.feed._id,
        'page':n,
      },
      method: 'post', // OPTIONS, GET, HEAD, POST, PUT, DELETE, TRACE, CONNECT
      header: {
        'Content-Type': 'application/x-www-form-urlencoded'
      }, // 设置请求的 header
      success: function (res) {
        if (res.data.items) {
          if(n==1){
            that.data.feed.comments=[];
            that.data.feed.comments = res.data.items;
          }else{
            that.data.feed.comments = that.data.feed.comments.concat(res.data.items)
          }
          n++
          if(n<=i){
            console.log(n,i)
            that.get_comments(n, that.data.pagenumber)
          }else{
            wx.hideLoading()
            that.data.pagemore=res.data.pagemore;
            that.data.pagenumber++;
            that.data.feed.comments = app.checktime(that.data.feed.comments,app,new Date().getTime());
              that.setData({
                feed:that.data.feed
              })
          }
        }else{
          wx.showToast({
            title: '获取失败，请重试',
            image: '../../image/fail.png',
            duration: 2000,
            mask: true
          })
          that.data.pagemore = true;
        }
      },
      fail: function () {
        wx.showToast({
          title: '网络连接失败，请重试',
          image: '../../image/fail.png',
          duration: 2000,
          mask: true
        })
        that.data.pagemore =true;
      },
      complete: function () {
        // complete
      }
    })
  },
  // 点击图片预览图片
  f_preview_img: function (event) {
    console.log(event.target.dataset.index)
    //var urlArr = this.data.imgUrls;
    console.log(this.data.feed);

    // 表示要预览的图片的索引id
    var index = event.target.dataset.index;

    // 当前要预览的图片
    var imgurl = this.data.feed.photos[index].large;

    // 表示全部图片的集合 做全部预览使用
    var photosArr = [];

    var phtLength = this.data.feed.photos.length;

    for (var i = 0; i < phtLength; i++) {
      photosArr.push(this.data.feed.photos[i].large);
    }

    //console.log(photosArr)

    wx.previewImage({
      current: imgurl,
      urls: photosArr,
      success: function (res) { },
      fail: function (res) { },
      complete: function (res) { },
    })
  },
  /**
   * 生命周期函数--监听页面加载
   */

  onLoad: function (options) {
    wx.showLoading({
      title: '正在加载',
      mask: true
    })
    var that = this;
    var feed_id = options.feed_id;
    console.log(feed_id);
    // 该贴相对于items数组的索引
    var index = options.index;
    
    if (!feed_id) {
      wx.showToast({
        title: '数据加载失败',
        image: '../../image/fail.png',
        duration: 1000,
        mask: true,
      })
      return;
    }
    //console.log("DetailPage", feed_id)
    wx.request({
      url: app.data.url + 'feed/detail',
      data: {
        access_token: app.data.token,
        feedid: feed_id
      },
      header: {
        'Content-Type': 'application/x-www-form-urlencoded'
      }, 
      method: 'post',
      dataType: 'json',
      success: function (res) {
        console.log(res.data)
        // return;
        wx.hideLoading()
        if(res.data.feed){
          var newTime = new Date().getTime();
          that.data.feed=res.data.feed;
          that.data.feed.time.create = app.cheTime(that.data.feed.time.create, newTime)
          that.data.feed.comments = app.checktime(that.data.feed.comments,app,newTime)
          if(res.data.feed.stat.comment>res.data.feed.comments.length){
            that.data.pagemore=true;
          }
          that.setData({
            index, // 帖子相对home中帖子数组的一个索引
            feed: that.data.feed,
          })
          console.log(that.data.feed)
        }else{
          wx.showToast({
            title: '请求失败，请重新进入',
            image: '../../image/fail.png',
            duration: 2000,
            mask: true
          })
        }
      },
      fail: function (res) {
        wx.showToast({
          title: '网络连接崩溃',
          icon: 'success',
          image: '',
          duration: 1000,
          mask: true
        })
      }
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
    // 主要是同步删除点赞记录的数据信息
    var delete_like = app.data.delete_like;
    console.log(delete_like)
    if (delete_like.length) {
      var feed = this.data.feed;
      var that = this;
      var likeusers = feed.likeusers.filter(function (item, index, self) {
        console.log(item)
        // 表示删除的是自己的点赞记录
        if (delete_like.indexOf(app.data.current_user._id) != -1) {
          feed.liked= false;
          // 同步点赞记录到home主页中///////////////////
          app.data.detail_index = that.data.index;
          app.data.likeduser = {
            // 点赞用户
            // current_user:that.data.current_user,

            liked: false,

            changed: true
          }////////////////////////
        }
        return delete_like.indexOf(item._id) < 0;
      });
      console.log(likeusers)
      feed.likeusers = likeusers;

      feed.stat.like -= delete_like.length;
      this.setData({
        feed
      })
      
    }
    app.data.delete_like = [];
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
  onShareAppMessage: function () {

  }
})
/*
"123"
"{"a":"123"}"  // IOS Android 服务器返回
"{\"a\":\"123\"}"  // 服务器直接返回
 */