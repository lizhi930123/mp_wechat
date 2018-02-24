
//获取应用实例
var app = getApp()
Page({
  data: {
    url:''
  },
  saveimg:function(){
    wx.showLoading({
      title: '正在保存',
    })
    wx.canvasToTempFilePath({
      x: 0,
      y: 0,
      width:250,
      height:320,
      destWidth:250,
      destHeight:320,
      canvasId: 'myCanvas',
      success: function (res) {
        wx.saveImageToPhotosAlbum({
          filePath: res.tempFilePath,
          success:function(){
            wx.showToast({
              title: '保存成功',
              icon: 'success',
              duration: 2000
            })
            wx.reLaunch({
              url: '../../pages/home/home'
            })
          },
          fail: function (res) {
            console.log(res)
            wx.showToast({
              title: '保存失败，请重试',
              icon: 'success',
              duration: 2000
            })
          }
        })
      },
      fail:function(res){
        console.log(res)
        wx.showToast({
          title: '保存失败，请重试',
          icon: 'success',
          duration: 2000
        })
      }
    })
  },
  //事件处理函数
  onLoad: function () {
    wx.showLoading({
      title: '正在绘制二维码',
    })
     wx.downloadFile({
       url: app.data.url + 'circle/qrcode?access_token='+app.data.token+'&circleid='+app.data.circleid, //仅为示例，并非真实的资源
        success: function (res) {
          wx.hideLoading()
          console.log(res.tempFilePath);
          const ctx = wx.createCanvasContext('myCanvas')
          ctx.setFillStyle('#FFFFFF')
          ctx.fillRect(0, 0, 250, 320)
          ctx.setLineWidth(1)
          ctx.setStrokeStyle('#b2b2b2')
          ctx.strokeRect(45, 230, 40, 50)
          ctx.strokeRect(105, 230, 40, 50)
          ctx.strokeRect(165, 230, 40, 50)
          ctx.drawImage(res.tempFilePath, 45, 0, 160, 160)
          ctx.setFillStyle('#333333')
          ctx.setFontSize(16)
          ctx.setTextAlign('center')
          ctx.fillText('快来加入我的角色扮演圈', 124, 186)
          ctx.setFontSize(16)
          ctx.setTextAlign('center')
          ctx.fillText('<<'+app.data.my_circle.name+'>>', 124, 210)
          ctx.setFontSize(18)
          ctx.setTextAlign('center')
          ctx.fillText('进圈口令', 125, 310)
          ctx.setFontSize(30)
          ctx.setTextAlign('center')
          ctx.fillText(app.data.my_circle.password[0], 65, 265)
          ctx.fillText(app.data.my_circle.password[1], 125, 265)
          ctx.fillText(app.data.my_circle.password[2], 185, 265)
          ctx.draw();
        }
      })
  }
})
