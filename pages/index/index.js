//index.js
//获取应用实例
var app = getApp()
Page({
  data: {
    motto: 'Hello World',
    userInfo: {},
    array: [{
         name: '推荐名人',
         id:-4
       },{
         name:'常用名人',
         id:-2
       },{
         name: '热搜榜',
         id:-1
       },{
         name:'全部',
         id:0
       },{
         name: '娱乐体育',
         id:1
       },{
         name: '游戏动漫',
         id:2
       },{
        name: '商界大佬',
        id:3
       },{
        name: '历史人物',
        id:4
       },{
        name: '小说影视',
        id:5
       },{
        name: '其他',
        id:6
       }],
    items:[],
    head_img_items:[],
    head_img_index:0,
    head_img_id:'',
    headimg_pagenumber:1,
    active:['left_white','left_item','left_item','left_item','left_item','left_item','left_item','left_item','left_item','left_item','left_item'],
    input_active:'',
    cancelactive:'',
    sureactive:'',
     actinfo:{},
     pagenumber:1,
     pagemore:true,
     groupid:-4,
  },
  check_home:function(){
    wx.navigateTo({
        url: '../../pages/mainpage/mainpage'
    })
    console.log(2)
  },
  //转到搜索页;
  f_focus:function(){
    wx.navigateTo({
        url: '../../pages/search/search'
    })
  },
  //扮演他
  go_act:function(event){
    this.setData({
      head_img_items: [],
      head_img_index:0,
      headimg_pagenumber:1,
      head_img_items:[],
    })
    var name=event.currentTarget.dataset.name,
      headimg = event.currentTarget.dataset.headimg,
      description = event.currentTarget.dataset.description,
      id = event.currentTarget.dataset.id;
    app.globalData.actname=name;
    app.globalData.actdescription=description;
    app.globalData.actheadimg=headimg;
    app.globalData.id = id;
    var that=this;
    wx.request({
      url: app.data.url + 'user/avatar_list',
      data: {
        access_token: app.data.token,
        userid:id,
        page: 1,
      },
      method: 'post', // OPTIONS, GET, HEAD, POST, PUT, DELETE, TRACE, CONNECT
      header: {
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      success:function(res){
        if(res.data.items){
          that.setData({
            head_img_items: res.data.items,
            head_img_id:res.data.items[0]._id
          })
          that.data.headimg_pagenumber++;
          that.data.headimg_pagemore=res.data.pagemore;
        }
      },
    })
    var user={
      name:app.globalData.actname,
      description:app.globalData.actdescription,
      headimg:app.globalData.actheadimg,
      id:app.globalData.id
    }
    console.log(user)
    this.setData({
      actinfo:user
    })
  },
  //选择头像
  check_headimg:function(event){
    var index=event.target.dataset.index;
    console.log(event)
    this.data.head_img_id=this.data.head_img_items[index]._id;
    this.data.actinfo.headimg = this.data.head_img_items[index].headimg;
    this.setData({
      head_img_index:index,
      actinfo:this.data.actinfo
    })
  },
  //名人列表
  act_list:function(){
    var that=this;
    if(this.data.pagemore){
      //////////////////////////7_28
      // wx.showLoading({
      //   title: '正在加载',
      //   mask: true
      // })
      this.data.pagemore=false;
      wx.request({
        url: app.data.url + 'user/user_list',
        data: {
          access_token: app.data.token,
          groupid: that.data.groupid,
          page: that.data.pagenumber,
        },
        method: 'post', // OPTIONS, GET, HEAD, POST, PUT, DELETE, TRACE, CONNECT
        header: {
          'Content-Type': 'application/x-www-form-urlencoded'
        },  // 设置请求的 header
        success: function (res) {
          console.log(res)
          wx.hideLoading()
          if (res.data.items) {
            var items = res.data.items
            that.data.items = that.data.items.concat(items);
            that.data.pagemore=res.data.pagemore
            that.setData({
              items: that.data.items
            })
            that.data.pagenumber++;
          }else{
            wx.showToast({
              title: '加载失败，请重试',
              image: '../../image/fail.png',
              duration: 2000,
              mask: true
            })
          }
        },
        fail:function(){
          wx.hideLoading()
          wx.showToast({
            title: '网络连接失败，请稍后重试',
            image: '../../image/fail.png',
            duration: 2000,
            mask: true
          })
        },
      })
    }
  },
  //获取头像下一页
  get_more_headimg:function(){
    var that=this;
    if(this.data.headimg_pagemore){
      this.data.headimg_pagemore=false;
      wx.request({
        url: app.data.url + 'user/avatar_list',
        data: {
          access_token: app.data.token,
          userid: app.globalData.id,
          page: that.data.headimg_pagenumber,
        },
        method: 'post', // OPTIONS, GET, HEAD, POST, PUT, DELETE, TRACE, CONNECT
        header: {
          'Content-Type': 'application/x-www-form-urlencoded'
        },
        success: function (res) {
          if (res.data.items) {
            that.setData({
              head_img_items: that.data.head_img_items.concat(res.data.items),
            })
            that.data.headimg_pagenumber++;
            that.data.headimg_pagemore=res.data.pagemore;
          }
        },
      })
    }
  },
  //获取更多名人
  get_more_act:function(){
      this.act_list()
  },
  startcancel:function(){
    console.log(1)
    app.globalData.actname = '';
    this.setData({
      cancelactive:'cancelactive'
    })
  },
  overcancel:function(){
     this.setData({
      cancelactive:''
    })
  },
  startsure:function(){
    console.log(1)
    this.setData({
      sureactive:'sureactive'
    })
  },
  oversure:function(){
     this.setData({
      sureactive:''
    })
  },
  //确认扮演
  sureact:function(){
    var that=this;
    wx.request({
      url: app.data.url + 'user/set_user',
      data: {
        access_token:app.data.token,
        userid: app.globalData.id,
        avatarid:that.data.head_img_id
      },
      method: 'post', // OPTIONS, GET, HEAD, POST, PUT, DELETE, TRACE, CONNECT
      header: {
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      success: function (res) {
        if (res.data.user){
          that.setData({
            actinfo: {}
          })
          app.globalData.actname = '';
          if(app.data.actuser){
            wx.reLaunch({
              url: '../../pages/home/home'
            })
          }else{
            app.data.user = res.data.user;
            wx.navigateTo({
              url: '../../pages/creategroup/creategroup'
            })
          }
        }else{
          wx.showToast({
            title: '扮演失败，请重试',
            image: '../../image/fail.png',
            duration: 2000,
            mask: true
          })
        }
      },
      fail:function(){
        wx.showToast({
          title: '网络请求失败，请重试',
          image: '../../image/fail.png',
          duration: 2000,
          mask: true
        })
      }
    })
  },
  cancelact:function(){
    this.setData({
      actinfo:{}
    })
  },
  check_white:function(event){
    var index=event.target.dataset.index,id=event.target.dataset.id;
    for(var i=0;i<this.data.active.length;i++){
       this.data.active[i]='left_item';
    }
    this.data.active[index]='left_white';
    this.setData({
      active:this.data.active
    })
    console.log(this.data.active)
    this.setData({
      pagenumber:1,
      items:[],
      groupid:id,
      pagemore:true
    })
    console.log(this.data.pagemore)
    this.act_list();
  },
  onLoad: function () {
    this.act_list()
    //调用应用实例的方法获取全局数据
    app.getUserInfo(function(userInfo){
      //更新数据
      that.setData({
        userInfo:userInfo
      })
      console.log(that.data.userInfo)
    })
    var that=this;
    
  },
  onShow:function(){
    if (app.globalData.actname) {
      var that=this;
      var user = {
        name: app.globalData.actname,
        description: app.globalData.actdescription,
        headimg: app.globalData.actheadimg,
        id: app.globalData.id
      }
      console.log(user)
      this.setData({
        actinfo: user,
        head_img_items:[]
      })
      wx.request({
        url: app.data.url + 'user/avatar_list',
        data: {
          access_token: app.data.token,
          userid: app.globalData.id,
          page: 1,
        },
        method: 'post', // OPTIONS, GET, HEAD, POST, PUT, DELETE, TRACE, CONNECT
        header: {
          'Content-Type': 'application/x-www-form-urlencoded'
        },
        success: function (res) {
          if (res.data.items) {
            that.setData({
              head_img_items: res.data.items,
              head_img_id: res.data.items[0]._id
            })
            that.data.headimg_pagenumber++;
            that.data.headimg_pagemore = res.data.pagemore;
          }
        },
      })
    }
  },
  onUnload:function(){
    app.globalData.actname='';
    this.setData({
      actinfo:{}
    })
  },
})
