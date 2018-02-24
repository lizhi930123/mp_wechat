// pages/post/post.js
const qiniuUploader = require("../../qiniusdk/qiniuUploader-min");
var app = getApp();
Page({

  /**
   * 页面的初始数据
   */
  data: {
    // 发表内容文字
    post_detail: '',
    // 点击选中的图片地址
    imgUrls: [],
    photos: [],
    sub_switch:true,
    image_num:9
  },
  // 删除选中的图片
  f_delelte_img: function (event) {
    // console.log(event.target.dataset.imgurl)
    var imgurl = event.target.dataset.imgurl;
    var imgUrls = this.data.imgUrls;
    var index = imgUrls.indexOf(imgurl);
    if (index > -1) {
      imgUrls.splice(index, 1);
      this.setData({ imgUrls: imgUrls });
    }
  },
  // 发布动态
  f_submit_post: function () {
    //console.log(this.data.post_detail)
    // console.log(this.data.imgUrls)
    if(this.data.sub_switch){
      var content = this.data.post_detail;
      var imgUrls = this.data.imgUrls, that = this;
      if (!content && !this.data.imgUrls.length){
        wx.showToast({
          title: '发布内容不能为空',
          icon: 'warning',
          image: '/images/closeBtn.png',
          duration: 1000,
          mask: true,
        })
        return;
      } else { // 有内容的情况下
        wx.showLoading({
          title: '发布中',
          mask: true
        })
        that.data.sub_switch=false;
        if (imgUrls.length) {  //发表动态有图片的情况下
          wx.request({
            url: app.data.url + 'common/qiniu',
            data: {},
            header: {
              'Content-Type': 'application/x-www-form-urlencoded'
            },
            method: 'post', // OPTIONS, GET, HEAD, POST, PUT, DELETE, TRACE, CONNECT
            // header: {}, // 设置请求的 header
            success: function (res) {
              if(res.data.token){
                var token = res.data.token;
                console.log(imgUrls.length)
                that.f_upload(imgUrls, 0, imgUrls.length, token, that)
              }else{
                wx.hideLoading()
                wx.showToast({
                  title: '发布失败',
                  image: '../../image/fail.png',
                  duration: 1000,
                  mask: true
                })
                that.data.sub_switch = true;
              }
            },
            fail:function(){
              wx.hideLoading()
              wx.showToast({
                title: '发布失败',
                image: '../../image/fail.png',
                duration: 1000,
                mask: true
              })
              that.data.sub_switch = true;
            }
          })
        } else {  //动态在无图的情况下
          wx.showLoading({
            title: '发布中',
            mask: true
          })
          wx.request({
            url: app.data.url + 'feed/create',
            data: {
              access_token: app.data.token,
              userid: app.data.current_user._id,
              content: that.data.post_detail,
              circleid: app.data.circleid,
              no:app.data.current_user.no
            },
            header: {
              'Content-Type': 'application/x-www-form-urlencoded'
            },
            method: 'post', // OPTIONS, GET, HEAD, POST, PUT, DELETE, TRACE, CONNECT
            // header: {}, // 设置请求的 header
            success: function (res) {
              // success
              console.log(res)
              if (res.data.feed) { 
                wx.showToast({
                  title: '发布成功',
                  icon: 'success',
                  duration: 1000,
                  mask:true
                })
                // 发布的帖子的详情数据 app.data.item
                app.data.item = res.data.feed;
                app.data.item.comments = [];
                app.data.item.likeusers = [];
                console.log("app.data.item")
                console.log(app.data.item)
                setTimeout(()=>{
                  wx.reLaunch({
                    url: '../../pages/home/home'
                  })
                }, 1000)
              }else if(res.data.error){
                wx.showToast({
                  title: res.data.error,
                  image: '../../image/fail.png',
                  duration: 1000,
                  mask: true
                })
              }else{
                wx.showToast({
                  title:'发布失败',
                  image: '../../image/fail.png',
                  duration: 1000,
                  mask: true
                })
              }
              that.data.sub_switch = true;
            },
            fail: function () {
              wx.hideLoading()
              // fail
              wx.showToast({
                title: '发布失败',
                image: '../../image/fail.png',
                duration: 1000,
                mask: true
              })
              that.data.sub_switch = true;
            },
            complete: function () {
              // complete
            }
          })
        }
      }
    }
  },
  //上传图片，上传成功后发帖
  f_upload: function (filePath, j, k, token, that) {
    qiniuUploader.upload(filePath[j], (res) => {
      that.data.photos.push({
        large: res.imageURL + '-large',
        thumbnail: res.imageURL + '-thumbnail',
      })
      j++;
      console.log(filePath, j, k, token, that)
      if (j < k) {
        that.f_upload(filePath, j, k, token, that)
      } else {
        console.log(that.data.photos)
        var data = new Object();
        data['access_token'] = app.data.token;
        data['userid'] = app.data.current_user._id;
        data['no'] = app.data.current_user.no;
        data['content'] = that.data.post_detail;
        data['circleid'] = app.data.circleid;
        for (var i = 0; i < that.data.photos.length; i++) {
          data['photos-' + i + '.large'] = that.data.photos[i].large;
          data['photos-' + i + '.thumbnail'] = that.data.photos[i].thumbnail;
        }
        console.log(data)
        wx.request({
          url: app.data.url + 'feed/create',
          data: data,
          method: 'post', // OPTIONS, GET, HEAD, POST, PUT, DELETE, TRACE, CONNECT
          header: {
            'Content-Type': 'application/x-www-form-urlencoded'
          },// 设置请求的 header
          success: function (res) {
            // success
            // wx.hideLoading()
            if (res.data.feed) {
              wx.showToast({
                title: '发布成功',
                icon: 'success',
                duration: 1000,
                mask: true,
              })
              wx.hideLoading()
              app.data.item = res.data.feed;
              app.data.item.comments = [];
              app.data.item.likeusers = [];
              console.log(app.data.item)
              setTimeout(function () {
                wx.reLaunch({
                  url: '../../pages/home/home'
                })
              }, 1000)
            } else if (res.data.error) {
              wx.showToast({
                title: res.data.error,
                image: '../../image/fail.png',
                duration: 1000,
                mask: true
              })
            } else {
              wx.showToast({
                title: '发布失败',
                image: '../../image/fail.png',
                duration: 1000,
                mask: true
              })
            }
            that.data.sub_switch = true;
          },
          fail: function () {
            // fail
            // wx.hideLoading()
            wx.showToast({
              title: '发布失败',
              image: '../../image/fail.png',
              duration: 1000,
              mask: true
            })
            that.data.sub_switch = true;
          },
          complete: function () {
            // complete
          }
        })
      }
    }, (error) => {
      // wx.hideLoading()
      wx.showToast({
        title: '上传图片失败',
        image: '../../image/fail.png',
        duration: 1000
      })
      that.data.sub_switch = true;
    }, {
        region: 'NCN',
        domain: 'http://osarzxkf1.bkt.clouddn.com/',
        uptoken: token,
      })
  },
  f_post_input: function (ev) {
    //console.log(ev.detail.value);
    var content = ev.detail.value;
    this.data.post_detai = content;
    this.setData({
      post_detail: content
    })
  },
  f_preview_img: function (ev) {
    var imgUrl = ev.currentTarget.dataset.imgurl;
    var that = this;
    console.log(imgUrl, that.data.imgUrls)
    wx.previewImage({
      current: imgUrl,
      urls: that.data.imgUrls,
      success: function (res) { },
      fail: function (res) { }
    })
  },
  f_add_img: function () {
    var that = this;
    wx.chooseImage({
      count:that.data.image_num,
      sizeType: ['original', 'compressed'],
      sourceType: ['album'],
      success: function (res) {
        // 返回选定照片的本地文件路径列表，tempFilePath可以作为img标签的src属性显示图片
        var tempFilePaths = res.tempFilePaths;
        //console.log(tempFilePaths);
        var imgArr = that.data.imgUrls.concat(tempFilePaths);
        that.data.image_num -= tempFilePaths.length;
        that.data.imgUrls = imgArr;
        console.log(that.data.imgUrls)
        that.setData({
          imgUrls: imgArr
        });

      },
      fail: function (res) {
        wx.showToast({
          title: '你没有选择图片',
          icon: 'success',
          duration: 0,
          mask: true
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
  onShareAppMessage: function () {
    return {
      title: '微信小程序联盟',
      desc: '最具人气的小程序开发联盟!',
      path: '/pages/index?id=123'
    }
  }
})