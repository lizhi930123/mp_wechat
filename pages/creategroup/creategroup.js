//index.js
//获取应用实例
const qiniuUploader = require("../../qiniusdk/qiniuUploader-min");
var app = getApp()
Page({
  data: {
      imagesrc:'',
      addimage:'',
      quanzi:'',
      name:''
  },
  //事件处理函数
  checkval:function(event){
      var val=event.detail.value;
      var ex=/^\S{2,10}$/i;
      if(ex.exec(val) && this.data.imagesrc){
          this.setData({
              name:val,
              quanzi:'quanzi_yes'
          })
      }else{
          this.setData({
              name:val,
              quanzi:''
          })
      }
  },
  //上传图片
  chooseImage:function(type){
      var that=this;
      console.log(type)
      wx.chooseImage({
          sourceType: [type],
          sizeType:['compressed'],
          count:1,
          //album 从相册选图，camera 使用相机，默认二者都有
          success:function(res){
            wx.showLoading({
              title: '正在上传',
              mask:true
            })
              console.log(res)
              var filePath=res.tempFilePaths[0];
                wx.request({
                url: app.data.url+'common/qiniu',
                data: {},
                method: 'GET', // OPTIONS, GET, HEAD, POST, PUT, DELETE, TRACE, CONNECT
                // header: {}, // 设置请求的 header
                success: function(res){
                    qiniuUploader.upload(filePath, (res) => {
                        wx.showToast({
                          title: '上传成功',
                          icon:'success',
                          duration: 2000,
                          mask: true
                        })
                        console.log(res)
                        that.setData({
                            'imagesrc': res.imageURL+'-thumbnail',
                        });
                        var ex=/^\S{2,10}$/i;
                        if(ex.exec(that.data.name)){
                            that.setData({
                                quanzi:'quanzi_yes'
                            })
                        }
                        console.log(res)
                    }, (error) => {
                      wx.showToast({
                        title: '上传失败,请重试',
                        image: '../../image/fail.png',
                        duration: 2000,
                        mask: true
                      })
                    }, {
                        region: 'NCN',
                        domain: 'http://osarzxkf1.bkt.clouddn.com/',
                        uptoken: res.data.token,
                    })
                },
                fail: function() {
                  wx.showToast({
                    title: '创建失败，请重试',
                    image: '../../image/fail.png',
                    duration: 1000,
                    mask: true
                  })
                },
                complete: function() {
                    // complete
                }
                })
          },
          fail:function(res){
            console.log(res)
          }
      })
  },
  //创建圈子
  surecreate:function(){
    // if (this.data.name.length > 10 || this.data.name.length <2){
    //   wx.showToast({
    //     title: '名称长度不符合规范',
    //     image: '../../image/fail.png',
    //     duration: 1000
    //   })
    // }else{
      var that=this;
      if(this.data.quanzi){
        wx.showLoading({
          title: '创建中',
          mask: true
        })
        wx.request({
          url: app.data.url + 'circle/create',
          data: {
            access_token: app.data.token,
            name:that.data.name,
            headimg:that.data.imagesrc
          },
          method: 'post', // OPTIONS, GET, HEAD, POST, PUT, DELETE, TRACE, CONNECT
          header: {
            'Content-Type': 'application/x-www-form-urlencoded'
          },  // 设置请求的 header
          success: function (res) {
            if(res.data.result){
              wx.showToast({
                title: '创建成功',
                icon: 'success',
                duration: 1000,
                mask: true
              })
              // 发布的帖子的详情数据 app.data.item
              app.data.my_circle=res.data.circle;
              app.data.circleid = res.data.circle._id;
              setTimeout(function () {
                wx.reLaunch({
                  url: '../../pages/share/share'
                })
              }, 1000)
            }else{
              wx.showToast({
                title: '创建失败，请重试',
                image: '../../image/fail.png',
                duration: 1000,
                mask: true
              })
            }
          }
        })
      }
    // }
  },
  //选择图片
  checkimage:function(){
    var that=this; 
    wx.showActionSheet({
        itemList:['从相册中选择', '拍照'],
        itemColor:"#1DCE6C",
        success:function(res){
          console.log(res)
            if(!res.cancel){
                if(res.tapIndex == 0){
                    that.chooseImage('album')
                }else if(res.tapIndex == 1){
                    that.chooseImage('camera')
                }
            }
        },
        fail:function(res){
          console.log(res)
        },
    })
  },
  onLoad: function () {
  }
})
