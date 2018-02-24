// pages/zan/zan.js
var app = getApp();
Page({

  /**
   * 页面的初始数据
   */
  data: {
    reload:false,
  },
  /**
   * 生命周期函数--监听页面加载
   */
  scenes: function (options){
    var that = this;
    console.log('options', JSON.stringify(options))
    if (options.scene) {
      app.data.circleid = options.scene.replace('circle.', '')
      console.log('circleid', app.data.circleid)
      console.log(app.data.circleid)
      setTimeout(function () {
        wx.redirectTo({
          url: '/pages/entercircle/entercircle',
          success: function (res) {
            console.log(res)
          },
          fail: function (res) {
            console.log(res)
          },
        })
      }, 500)
    } else {
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
        success: function (res){
          console.log(res.data)
          if (res.data.items) {
            if (res.data.items.length){
              app.data.my_circleid = res.data.items[0].circle._id;
              if (res.data.items.length>1){
                if (res.data.items[0].time.update > res.data.items[1].time.update){
                  app.data.circleid = res.data.items[0].circle._id;
                }else{
                  app.data.circleid = res.data.items[1].circle._id;
                }
              }else{
                app.data.circleid = res.data.items[0].circle._id;
              }
              // console.log(wx.reLaunch)
              console.log('reLaunch' in wx);
              setTimeout(function(){
                wx.redirectTo({
                  url: '/pages/home/home',
                  success: function (res) {
                    console.log(res)
                  },
                  fail: function (res) {
                    console.log(res)
                  },
                })
              },500)
            } else {
              app.data.actuser = false;
              setTimeout(function () {
                wx.redirectTo({
                  url: '../index/index',
                  success: function (res) {
                    console.log(res)
                  },
                  fail: function (res) {
                    console.log(res)
                  },
                })
              },500)
            }
          }
        },
        fail: function (res) {
          that.data.reload = true;
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
    }
  },
  onLoad: function (options) {
    if (wx.reLaunch){
      wx.showLoading({
        title: '加载中',
      })
      var that = this;
      wx.getStorage({
        key: 'access_token',
        success: function (res) {
          app.data.token = res.data;
          console.log(res.data)
          that.scenes(options)
        },
        fail: function () {
          wx.getUserInfo({
            success: function (res) {
              var iv = res.iv,
                encryptedData = res.encryptedData;
              //获取code
              wx.login({
                success: function (res) {
                  if (res.code) {
                    //发起网络请求,获取token
                    console.log(res.code)
                    wx.request({
                      url: app.data.url + 'pass/reg',
                      data: {
                        code: res.code,
                        iv: iv,
                        encryptedData: encryptedData
                      },
                      header: {
                        'Content-Type': 'application/x-www-form-urlencoded'
                      },
                      method: 'post',
                      dataType: 'json',
                      success: function (res) {
                        console.log(res.data)
                        if (res.data.access_token) {
                          console.log(res.data.access_token)
                          wx.setStorage({
                            key: "access_token",
                            data: res.data.access_token
                          })
                          app.data.token = res.data.access_token
                          that.scenes(options)
                          //判断场景值
                        } else {
                          wx.showToast({
                            title: '获取用户登录失败，请稍后重试',
                            image: '../../image/fail.png',
                            duration: 2000,
                            mask: true
                          })
                          that.data.reload=true;
                        }
                      },
                      fail: function (res) {
                        that.data.reload = true;
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
                  } else {
                    that.data.reload = true;
                    wx.showToast({
                      title: '获取用户登录失败，请稍后重试',
                      image: '../../image/fail.png',
                      duration: 2000,
                      mask: true
                    })
                  }
                },
                fail: function () {
                  that.data.reload = true;
                  wx.showToast({
                    title: '网络链接失败，请稍后重试',
                    image: '../../image/fail.png',
                    duration: 2000,
                    mask: true
                  })
                }
              });
            },
            fail: function (res){
              that.data.reload = true;
              wx.openSetting({
                success(res) {
                  if (res.authSetting['scope.userInfo']) {
                    console.log(33)
                    that.onLoad(options)
                  }
                },
              })
            }
          })
        }
      })
    } else {
      // 如果希望用户在最新版本的客户端上体验您的小程序，可以这样子提示
      wx.showModal({
        title: '提示',
        content: '当前微信版本过低，无法使用该功能，请升级到最新微信版本后重试。'
      })
    }
    //获取用户信息
  },
  onShow:function(){
    if(this.data.reload){
      console.log(1)
    }
  },
  /**
   * 生命周期函数--监听页面初次渲染完成
   */

})