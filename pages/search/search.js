//index.js
//获取应用实例
var app = getApp()
Page({
  data: {
    userInfo: {},
    items:[],
    username:'',
    time:false
  },
  //事件处理函数
  onLoad: function () {
  },
  findval:function(event){
      var val=event.detail.value;
      this.setData({
          username:val
      })
      var that=this;
      if (that.data.time){
        clearTimeout(that.data.time)
      }
      this.data.time=setTimeout(function(){
        that.search()
      },500)
  },
  act_he:function(event){
    console.log(event)
    var name=event.currentTarget.dataset.name,
      headimg = event.currentTarget.dataset.headimg,
      description = event.currentTarget.dataset.description,
      id = event.currentTarget.dataset.id;
    app.globalData.actname=name;
    app.globalData.actdescription=description;
    app.globalData.actheadimg=headimg;
    app.globalData.id=id
    wx.navigateBack({
    })
  },
  search:function(){
      var that=this;
      console.log(that.data.username)
      wx.request({
        url: 'https://api.mrpyq.com/user/search',
        data: {
          // access_token:app.data.token,
          name:that.data.username
        },
        method: 'post', // OPTIONS, GET, HEAD, POST, PUT, DELETE, TRACE, CONNECT
        header: {
          'Content-Type': 'application/x-www-form-urlencoded'
        },
        success: function(res){
          // success
          console.log(res)
          if(res.data.items){
            that.setData({
              items: res.data.items
            })
          }else{
          }
        },
        fail: function() {
          console.log('fail')
        },
        complete: function() {
          // complete
        }
      })
  }
})
