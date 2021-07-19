import request from '../../utils/request'
Page({

  /**
   * 页面的初始数据
   */
  data: {
    videoGroupList : [], // 导航标签数据
    navId : '', // 导航的标识
    videoList: [], // 视频列表数据
    videoId: '', // 视频id标识
    videoUpdateTime: [], // 记录video播放的时长
    isTriggered: false,  // 标识下拉刷新是否被触发

  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    // 获取导航数据
    this.getVideoGroupListData();
    
  },

  // 获取导航数据
  async getVideoGroupListData(){
    let videoGroupListData = await request('/video/group/list');
    this.setData({
      videoGroupList: videoGroupListData.data.slice(0,14),
      navId: videoGroupListData.data[0].id
    })

    // 获取视频列表数据
    this.getVideoList(this.data.navId);
  },

  // 获取视频列表数据
  async getVideoList(navId){
    if(!navId){ // 判断navId为空串的情况
      return;
    }
    let videoListData = await request('/video/group',{id: navId})

    // 关闭消息提示框
    wx.hideLoading();

    this.setData({
      videoList,
      isTriggered: false, // 关闭下拉刷新 
    })

    

    let index = 0;
    let videoList = videoListData.datas.map(item => {
      item.id = index++;
      return item;
    })
    this.setData({
      videoList
    })
  },

  // 点击切换导航的回调
  changeNav(event){

    let navId = event.currentTarget.dataset.id;
    this.setData({
      navId: navId>>>0,
      videoList: [],
    })
    // 显示正在加载
    wx.showLoading({
      title: '正在加载',
    })

    // 动态获取当前导航对应的视频数据
    this.getVideoList(this.data.navId);
  }, 

  // 点击播放/继续播放的回调
  handlePlay(event){
    
    // 解决多个视频同时播放的问题
    let vid = event.currentTarget.id;
    // 关闭上一个播放的视频
    this.vid !== vid && this.videoContext && this.videoContext.stop();
    // if(this.vid !== vid){
    //   if(this.videoContext){
    //     this.videoContext.stop()
    //   }
    // }
    this.vid = vid;

    // 更新data中的videoId的状态数据
    this.setData({
      videoId: vid
    })

    // 创建控制video标签的实例对象
    this.videoContext = wx.createVideoContext(vid);

    // 判断当前的视频之前是否播放过，是否有播放记录，如果有，跳转至指定的播放位置
    let {videoUpdateTime} = this.data;
    let videoItem = videoUpdateTime.find(item => item.vid === vid);
    if(videoItem){
      this.videoContext.seek(videoItem.currentTime);
    }
    this.videoContext.play();
  },


  // 监听视频播放进度的回调
  handleTimeUpdate(event){

    let videoTimeObj = {vid: event.currentTarget.id, currentTime: event.detail.currentTime};
    let {videoUpdateTime} = this.data;
    
    // 判断记录播放时长的videoUpdateTime数组中是否有当前视频的播放记录
    let videoItem = videoUpdateTime.find(item => item.vid === videoTimeObj.vid);
    if(videoItem){ // 之前有
      videoItem.currentTime = event.detail.currentTime;
    }else { // 之前没有
      videoUpdateTime.push(videoTimeObj);
    }
    // 更新videoUpdateTime的状态
    this.setData({
      videoUpdateTime
    })
  },

  // 视频播放结束调用的回调
  handleEnded(){
    // 移除记录播放时长数组中当前视频的对象
    let {videoUpdateTime} = this.data;
    videoUpdateTime.splice( videoUpdateTime.findIndex(item => item.vid === event.currentTarget.id),1);
    this.setData({
      videoUpdateTime
    })
  },

  // 自定义下拉刷新的回调：scroll-view
  handleRefresher(){
    console.log('scroll-view 下拉刷新');
    // 再次发请求，获取最新的视频列表数据
    this.getVideoList(this.data.navId);
  },

  // 自定义上拉触底的回调 scroll-view
  handleToLower(){
    console.log('scroll-view 上拉触底')
    // 数据分页： 1. 后端分页, 2. 前端分页
    // 网易云音乐没有开放分页这个接口，所以没法实现
    console.log('发送请求 || 在前端截取最新的数据 追加到视频列表的后方')
    console.log('网易云音乐暂时没有提供分页的api')
    // 模拟数据
    let newVideoList =  [
      {
        "type": 1,
        "displayed": false,
        "alg": "onlineHotGroup",
        "extAlg": null,
        "data": {
          "alg": "onlineHotGroup",
          "scm": "1.music-video-timeline.video_timeline.video.181017.-295043608",
          "threadId": "R_VI_62_62CA39CCE0A91E44154281E3E64BCE52",
          "coverUrl": "https://p2.music.126.net/eunJtcg8C2mLOtjgk3IpSA==/109951165118136104.jpg",
          "height": 720,
          "width": 1280,
          "title": "华晨宇暖心演唱《好想爱这个世界啊》",
          "description": null,
          "commentCount": 600,
          "shareCount": 2334,
          "resolutions": [
            {
              "resolution": 240,
              "size": 22964468
            },
            {
              "resolution": 480,
              "size": 37839406
            },
            {
              "resolution": 720,
              "size": 48172831
            }
          ],
          "creator": {
            "defaultAvatar": false,
            "province": 110000,
            "authStatus": 0,
            "followed": false,
            "avatarUrl": "http://p1.music.126.net/9gFwnq_vOpFz1Ct7dJiQDA==/109951165189537660.jpg",
            "accountStatus": 0,
            "gender": 2,
            "city": 110101,
            "birthday": -2209017600000,
            "userId": 556757640,
            "userType": 0,
            "nickname": "卡卡西_yu",
            "signature": "",
            "description": "",
            "detailDescription": "",
            "avatarImgId": 109951165189537660,
            "backgroundImgId": 109951165226825680,
            "backgroundUrl": "http://p1.music.126.net/S1jyw8LTCZzu0qMhaZRgFA==/109951165226825682.jpg",
            "authority": 0,
            "mutual": false,
            "expertTags": null,
            "experts": null,
            "djStatus": 0,
            "vipType": 0,
            "remarkName": null,
            "avatarImgIdStr": "109951165189537660",
            "backgroundImgIdStr": "109951165226825682"
          },
          "urlInfo": {
            "id": "62CA39CCE0A91E44154281E3E64BCE52",
            "url": "http://vodkgeyttp9.vod.126.net/cloudmusic/r4oSOrl2_3051530133_shd.mp4?ts=1622386668&rid=550BEF555AE24948DCFFFA23902302E3&rl=3&rs=cKeMyRydDLWCHBZqTGsWLDqbJSgYQtDu&sign=730ff8b70209fa88b6abc459f7299326&ext=lzn%2B4CrYbaset0imXteCQDjdcbCLi7IaL%2BWwQZ2tkKHPyHyZMcN6YU6stOJJjOPYFSsv97rqYIMe3GovFcksr%2BYzATC9PrHIMKDm%2FiM2J%2FwFedwtouWYBR9Iix0ZUwA%2FgYzDI6n8tDSX1nkQq0i%2FRCZr0hxczzk%2BssHPLzizTYMTgmNdlfjY1FBKKd%2BKVMfNbqU7VFN9rTkm3kQhe1O%2BeNEKOhJ7ijjhzAXqv0iRdH77C3aUMQDYN1EgKYg9WKlF",
            "size": 48172831,
            "validityTime": 1200,
            "needPay": false,
            "payInfo": null,
            "r": 720
          },
          "videoGroup": [
            {
              "id": 58100,
              "name": "现场",
              "alg": null
            },
            {
              "id": 59101,
              "name": "华语现场",
              "alg": null
            },
            {
              "id": 57108,
              "name": "流行现场",
              "alg": null
            },
            {
              "id": 59108,
              "name": "巡演现场",
              "alg": null
            },
            {
              "id": 1100,
              "name": "音乐现场",
              "alg": null
            },
            {
              "id": 5100,
              "name": "音乐",
              "alg": null
            },
            {
              "id": 23118,
              "name": "华晨宇",
              "alg": null
            }
          ],
          "previewUrl": null,
          "previewDurationms": 0,
          "hasRelatedGameAd": false,
          "markTypes": null,
          "relateSong": [
            {
              "name": "好想爱这个世界啊 (Live)",
              "id": 1436910205,
              "pst": 0,
              "t": 0,
              "ar": [
                {
                  "id": 861777,
                  "name": "华晨宇",
                  "tns": [
                    
                  ],
                  "alias": [
                    
                  ]
                }
              ],
              "alia": [
                
              ],
              "pop": 100,
              "st": 0,
              "rt": "",
              "fee": 8,
              "v": 72,
              "crbt": null,
              "cf": "",
              "al": {
                "id": 87498640,
                "name": "歌手·当打之年 第9期",
                "picUrl": "http://p3.music.126.net/p7n_zp4eoxY3a1XPzIomHQ==/109951164863688864.jpg",
                "tns": [
                  
                ],
                "pic_str": "109951164863688864",
                "pic": 109951164863688860
              },
              "dt": 262700,
              "h": {
                "br": 320000,
                "fid": 0,
                "size": 10510125,
                "vd": -24479
              },
              "m": {
                "br": 192000,
                "fid": 0,
                "size": 6306093,
                "vd": -21889
              },
              "l": {
                "br": 128000,
                "fid": 0,
                "size": 4204077,
                "vd": -20181
              },
              "a": null,
              "cd": "01",
              "no": 6,
              "rtUrl": null,
              "ftype": 0,
              "rtUrls": [
                
              ],
              "djId": 0,
              "copyright": 0,
              "s_id": 0,
              "rtype": 0,
              "rurl": null,
              "mst": 9,
              "cp": 1416682,
              "mv": 0,
              "publishTime": 0,
              "privilege": {
                "id": 1436910205,
                "fee": 0,
                "payed": 0,
                "st": 0,
                "pl": 999000,
                "dl": 0,
                "sp": 7,
                "cp": 1,
                "subp": 1,
                "cs": false,
                "maxbr": 999000,
                "fl": 128000,
                "toast": false,
                "flag": 64,
                "preSell": false
              }
            }
          ],
          "relatedInfo": null,
          "videoUserLiveInfo": null,
          "vid": "62CA39CCE0A91E44154281E3E64BCE52",
          "durationms": 271650,
          "playTime": 1291469,
          "praisedCount": 21130,
          "praised": false,
          "subscribed": false
        }
      },
      {
        "type": 1,
        "displayed": false,
        "alg": "onlineHotGroup",
        "extAlg": null,
        "data": {
          "alg": "onlineHotGroup",
          "scm": "1.music-video-timeline.video_timeline.video.181017.-295043608",
          "threadId": "R_VI_62_A4A22EE0C64D100A895A88D179C6DED7",
          "coverUrl": "https://p2.music.126.net/nEQIu_foZYlzuKTRIkL3sw==/109951163739669887.jpg",
          "height": 1080,
          "width": 1920,
          "title": "素人歌手范媛媛来袭 演唱《母系社会》震撼全场",
          "description": "",
          "commentCount": 1933,
          "shareCount": 16498,
          "resolutions": [
            {
              "resolution": 240,
              "size": 23494034
            },
            {
              "resolution": 480,
              "size": 41240290
            },
            {
              "resolution": 720,
              "size": 62695571
            },
            {
              "resolution": 1080,
              "size": 104882473
            }
          ],
          "creator": {
            "defaultAvatar": false,
            "province": 230000,
            "authStatus": 0,
            "followed": false,
            "avatarUrl": "http://p1.music.126.net/YaziwMop753r1ZlCaYFdkw==/109951163710128957.jpg",
            "accountStatus": 0,
            "gender": 0,
            "city": 230100,
            "birthday": -2209017600000,
            "userId": 1683743264,
            "userType": 0,
            "nickname": "好歌曲goodmusic",
            "signature": "",
            "description": "",
            "detailDescription": "",
            "avatarImgId": 109951163710128960,
            "backgroundImgId": 109951162868126480,
            "backgroundUrl": "http://p1.music.126.net/_f8R60U9mZ42sSNvdPn2sQ==/109951162868126486.jpg",
            "authority": 0,
            "mutual": false,
            "expertTags": null,
            "experts": {
              "1": "视频达人(华语、音乐现场)"
            },
            "djStatus": 0,
            "vipType": 0,
            "remarkName": null,
            "avatarImgIdStr": "109951163710128957",
            "backgroundImgIdStr": "109951162868126486"
          },
          "urlInfo": {
            "id": "A4A22EE0C64D100A895A88D179C6DED7",
            "url": "http://vodkgeyttp9.vod.126.net/vodkgeyttp8/a0gCfRhw_2203512054_uhd.mp4?ts=1622386668&rid=550BEF555AE24948DCFFFA23902302E3&rl=3&rs=vSZhCCmnyuUbAiIXzvPsSHFyJXjkGBXv&sign=86b403e9e02b1291315d00e9427d709a&ext=lzn%2B4CrYbaset0imXteCQDjdcbCLi7IaL%2BWwQZ2tkKHPyHyZMcN6YU6stOJJjOPYFSsv97rqYIMe3GovFcksr%2BYzATC9PrHIMKDm%2FiM2J%2FwFedwtouWYBR9Iix0ZUwA%2FgYzDI6n8tDSX1nkQq0i%2FRCZr0hxczzk%2BssHPLzizTYMTgmNdlfjY1FBKKd%2BKVMfNbqU7VFN9rTkm3kQhe1O%2BeNEKOhJ7ijjhzAXqv0iRdH77C3aUMQDYN1EgKYg9WKlF",
            "size": 104882473,
            "validityTime": 1200,
            "needPay": false,
            "payInfo": null,
            "r": 1080
          },
          "videoGroup": [
            {
              "id": 58100,
              "name": "现场",
              "alg": null
            },
            {
              "id": 60100,
              "name": "翻唱",
              "alg": null
            },
            {
              "id": 57111,
              "name": "中文翻唱",
              "alg": null
            },
            {
              "id": 59111,
              "name": "素人草根",
              "alg": null
            },
            {
              "id": 12100,
              "name": "流行",
              "alg": null
            },
            {
              "id": 5100,
              "name": "音乐",
              "alg": null
            },
            {
              "id": 4101,
              "name": "娱乐",
              "alg": null
            },
            {
              "id": 3101,
              "name": "综艺",
              "alg": null
            },
            {
              "id": 23121,
              "name": "张惠妹",
              "alg": null
            },
            {
              "id": 76108,
              "name": "综艺片段",
              "alg": null
            }
          ],
          "previewUrl": null,
          "previewDurationms": 0,
          "hasRelatedGameAd": false,
          "markTypes": null,
          "relateSong": [
            {
              "name": "母系社会",
              "id": 31311126,
              "pst": 0,
              "t": 0,
              "ar": [
                {
                  "id": 10559,
                  "name": "张惠妹",
                  "tns": [
                    
                  ],
                  "alias": [
                    
                  ]
                }
              ],
              "alia": [
                
              ],
              "pop": 100,
              "st": 0,
              "rt": null,
              "fee": 8,
              "v": 441,
              "crbt": null,
              "cf": "",
              "al": {
                "id": 3109245,
                "name": "AMIT2",
                "picUrl": "http://p3.music.126.net/BfErSrfqI0t2i7cmLFUQcA==/109951163250169128.jpg",
                "tns": [
                  
                ],
                "pic_str": "109951163250169128",
                "pic": 109951163250169120
              },
              "dt": 235253,
              "h": {
                "br": 320000,
                "fid": 0,
                "size": 9412485,
                "vd": -27400
              },
              "m": {
                "br": 192000,
                "fid": 0,
                "size": 5647508,
                "vd": -25000
              },
              "l": {
                "br": 128000,
                "fid": 0,
                "size": 3765020,
                "vd": -23200
              },
              "a": null,
              "cd": "1",
              "no": 3,
              "rtUrl": null,
              "ftype": 0,
              "rtUrls": [
                
              ],
              "djId": 0,
              "copyright": 2,
              "s_id": 0,
              "rtype": 0,
              "rurl": null,
              "mst": 9,
              "cp": 7003,
              "mv": 394149,
              "publishTime": 1428076800007,
              "privilege": {
                "id": 31311126,
                "fee": 8,
                "payed": 0,
                "st": 0,
                "pl": 128000,
                "dl": 0,
                "sp": 7,
                "cp": 1,
                "subp": 1,
                "cs": false,
                "maxbr": 999000,
                "fl": 128000,
                "toast": false,
                "flag": 4,
                "preSell": false
              }
            }
          ],
          "relatedInfo": null,
          "videoUserLiveInfo": null,
          "vid": "A4A22EE0C64D100A895A88D179C6DED7",
          "durationms": 196070,
          "playTime": 6173052,
          "praisedCount": 84546,
          "praised": false,
          "subscribed": false
        }
      },
      {
        "type": 1,
        "displayed": false,
        "alg": "onlineHotGroup",
        "extAlg": null,
        "data": {
          "alg": "onlineHotGroup",
          "scm": "1.music-video-timeline.video_timeline.video.181017.-295043608",
          "threadId": "R_VI_62_5F1D7E8D1DE3BDB666341326EA93E449",
          "coverUrl": "https://p2.music.126.net/ez8VyodLU_9XmNLmIiE2NA==/109951163654898514.jpg",
          "height": 360,
          "width": 640,
          "title": "维也纳金色大厅 保留曲目 拉德斯进行曲 最棒的一个版本",
          "description": null,
          "commentCount": 289,
          "shareCount": 2437,
          "resolutions": [
            {
              "resolution": 240,
              "size": 21426950
            }
          ],
          "creator": {
            "defaultAvatar": false,
            "province": 150000,
            "authStatus": 0,
            "followed": false,
            "avatarUrl": "http://p1.music.126.net/3hBmVsIzLug4riLssMuVAw==/109951163708961158.jpg",
            "accountStatus": 0,
            "gender": 1,
            "city": 150100,
            "birthday": -2209017600000,
            "userId": 381080764,
            "userType": 0,
            "nickname": "阿拉腾沙-",
            "signature": "如果你问我",
            "description": "",
            "detailDescription": "",
            "avatarImgId": 109951163708961150,
            "backgroundImgId": 109951163433664930,
            "backgroundUrl": "http://p1.music.126.net/lAI21BRIZ6JbXKLkza8TxA==/109951163433664925.jpg",
            "authority": 0,
            "mutual": false,
            "expertTags": null,
            "experts": null,
            "djStatus": 0,
            "vipType": 0,
            "remarkName": null,
            "avatarImgIdStr": "109951163708961158",
            "backgroundImgIdStr": "109951163433664925"
          },
          "urlInfo": {
            "id": "5F1D7E8D1DE3BDB666341326EA93E449",
            "url": "http://vodkgeyttp9.vod.126.net/cloudmusic/N1mZgCud_3140924645_sd.mp4?ts=1622386668&rid=550BEF555AE24948DCFFFA23902302E3&rl=3&rs=AdgWKkSCEyskCfDMIjlGjTQKSsmWOoVb&sign=901076e76a51cdc208e09ce68afd6e11&ext=lzn%2B4CrYbaset0imXteCQDjdcbCLi7IaL%2BWwQZ2tkKHPyHyZMcN6YU6stOJJjOPYFSsv97rqYIMe3GovFcksr%2BYzATC9PrHIMKDm%2FiM2J%2FwFedwtouWYBR9Iix0ZUwA%2FgYzDI6n8tDSX1nkQq0i%2FRCZr0hxczzk%2BssHPLzizTYMTgmNdlfjY1FBKKd%2BKVMfNbqU7VFN9rTkm3kQhe1O%2BeNEKOhJ7ijjhzAXqv0iRdH77C3aUMQDYN1EgKYg9WKlF",
            "size": 21426950,
            "validityTime": 1200,
            "needPay": false,
            "payInfo": null,
            "r": 240
          },
          "videoGroup": [
            {
              "id": 58100,
              "name": "现场",
              "alg": null
            },
            {
              "id": 57106,
              "name": "欧美现场",
              "alg": null
            },
            {
              "id": 1100,
              "name": "音乐现场",
              "alg": null
            },
            {
              "id": 5100,
              "name": "音乐",
              "alg": null
            },
            {
              "id": 15105,
              "name": "古典",
              "alg": null
            },
            {
              "id": 16152,
              "name": "交响乐",
              "alg": null
            },
            {
              "id": 14201,
              "name": "小提琴",
              "alg": null
            },
            {
              "id": 107103,
              "name": "古典专区",
              "alg": null
            }
          ],
          "previewUrl": null,
          "previewDurationms": 0,
          "hasRelatedGameAd": false,
          "markTypes": null,
          "relateSong": [
            {
              "name": "拉德斯基进行曲",
              "id": 5264841,
              "pst": 0,
              "t": 0,
              "ar": [
                {
                  "id": 34973,
                  "name": "Herbert von Karajan",
                  "tns": [
                    
                  ],
                  "alias": [
                    
                  ]
                }
              ],
              "alia": [
                
              ],
              "pop": 100,
              "st": 0,
              "rt": "",
              "fee": 0,
              "v": 674,
              "crbt": null,
              "cf": "",
              "al": {
                "id": 512635,
                "name": "惠威T200A试音碟",
                "picUrl": "http://p3.music.126.net/uAT4CcsZdcAYs-CS0hr-0w==/93458488378219.jpg",
                "tns": [
                  
                ],
                "pic": 93458488378219
              },
              "dt": 187013,
              "h": {
                "br": 320000,
                "fid": 0,
                "size": 7483602,
                "vd": -4900
              },
              "m": {
                "br": 192000,
                "fid": 0,
                "size": 4490178,
                "vd": -2400
              },
              "l": {
                "br": 128000,
                "fid": 0,
                "size": 2993466,
                "vd": -800
              },
              "a": null,
              "cd": "1",
              "no": 6,
              "rtUrl": null,
              "ftype": 0,
              "rtUrls": [
                
              ],
              "djId": 0,
              "copyright": 1,
              "s_id": 0,
              "rtype": 0,
              "rurl": null,
              "mst": 9,
              "cp": 5003,
              "mv": 0,
              "publishTime": 1104508800007,
              "privilege": {
                "id": 5264841,
                "fee": 0,
                "payed": 0,
                "st": 0,
                "pl": 320000,
                "dl": 999000,
                "sp": 7,
                "cp": 1,
                "subp": 1,
                "cs": false,
                "maxbr": 999000,
                "fl": 320000,
                "toast": false,
                "flag": 128,
                "preSell": false
              }
            }
          ],
          "relatedInfo": null,
          "videoUserLiveInfo": null,
          "vid": "5F1D7E8D1DE3BDB666341326EA93E449",
          "durationms": 210096,
          "playTime": 531284,
          "praisedCount": 3175,
          "praised": false,
          "subscribed": false
        }
      },
      {
        "type": 1,
        "displayed": false,
        "alg": "onlineHotGroup",
        "extAlg": null,
        "data": {
          "alg": "onlineHotGroup",
          "scm": "1.music-video-timeline.video_timeline.video.181017.-295043608",
          "threadId": "R_VI_62_8D7E52FC9AA9D3BE7BDE8EA083954828",
          "coverUrl": "https://p2.music.126.net/gTl4FhoFQc66WR1IJCfxqQ==/109951163095853629.jpg",
          "height": 540,
          "width": 960,
          "title": "谭维维《乌兰巴托的夜》开口跪！【我是歌手】",
          "description": "谭维维《乌兰巴托的夜》此歌创作于1985年（曲：普日布道尔吉　词：普日布道尔吉），1987年蒙古国“成吉思汗乐队”赴呼和浩特演出了此歌曲，从而为内蒙古听众得知。开始旋律简单，后来1992年由普日布道尔吉、歌手钢呼牙嘎，萨仁图雅在新加坡重新录制此歌，使得旋律复杂，形成目前的样式",
          "commentCount": 81,
          "shareCount": 292,
          "resolutions": [
            {
              "resolution": 240,
              "size": 40500790
            },
            {
              "resolution": 480,
              "size": 57899047
            }
          ],
          "creator": {
            "defaultAvatar": false,
            "province": 1000000,
            "authStatus": 0,
            "followed": false,
            "avatarUrl": "http://p1.music.126.net/0BPheqmRYjaWjORhFwsKng==/109951164307639259.jpg",
            "accountStatus": 0,
            "gender": 1,
            "city": 1001300,
            "birthday": 794592000000,
            "userId": 39675504,
            "userType": 204,
            "nickname": "无忧无虑的K先生",
            "signature": "我？我喜欢把自己藏起来…",
            "description": "",
            "detailDescription": "",
            "avatarImgId": 109951164307639260,
            "backgroundImgId": 109951164307633950,
            "backgroundUrl": "http://p1.music.126.net/ZmvdFWTzbYhl-0kxnpmUFw==/109951164307633951.jpg",
            "authority": 0,
            "mutual": false,
            "expertTags": null,
            "experts": {
              "1": "泛生活视频达人"
            },
            "djStatus": 10,
            "vipType": 0,
            "remarkName": null,
            "avatarImgIdStr": "109951164307639259",
            "backgroundImgIdStr": "109951164307633951"
          },
          "urlInfo": {
            "id": "8D7E52FC9AA9D3BE7BDE8EA083954828",
            "url": "http://vodkgeyttp9.vod.126.net/vodkgeyttp8/yzL6HqiX_104126247_hd.mp4?ts=1622386668&rid=550BEF555AE24948DCFFFA23902302E3&rl=3&rs=NNVmtlmXLKjerWIHgnxWIsuBijqyesZb&sign=3b011af788969d8bd4845cbe0e30cefe&ext=lzn%2B4CrYbaset0imXteCQDjdcbCLi7IaL%2BWwQZ2tkKHPyHyZMcN6YU6stOJJjOPYFSsv97rqYIMe3GovFcksr%2BYzATC9PrHIMKDm%2FiM2J%2FwFedwtouWYBR9Iix0ZUwA%2FgYzDI6n8tDSX1nkQq0i%2FRCZr0hxczzk%2BssHPLzizTYMTgmNdlfjY1FBKKd%2BKVMfNbqU7VFN9rTkm3kQhe1O%2BeNEKOhJ7ijjhzAXqv0iRdH77C3aUMQDYN1EgKYg9WKlF",
            "size": 57899047,
            "validityTime": 1200,
            "needPay": false,
            "payInfo": null,
            "r": 480
          },
          "videoGroup": [
            {
              "id": 58100,
              "name": "现场",
              "alg": null
            },
            {
              "id": 2104,
              "name": "民谣",
              "alg": null
            },
            {
              "id": 5100,
              "name": "音乐",
              "alg": null
            },
            {
              "id": 4101,
              "name": "娱乐",
              "alg": null
            },
            {
              "id": 3101,
              "name": "综艺",
              "alg": null
            },
            {
              "id": 13222,
              "name": "华语",
              "alg": null
            },
            {
              "id": 14137,
              "name": "感动",
              "alg": null
            }
          ],
          "previewUrl": null,
          "previewDurationms": 0,
          "hasRelatedGameAd": false,
          "markTypes": [
            109
          ],
          "relateSong": [
            {
              "name": "乌兰巴托的夜 (Live)",
              "id": 31877470,
              "pst": 0,
              "t": 0,
              "ar": [
                {
                  "id": 9489,
                  "name": "谭维维",
                  "tns": [
                    
                  ],
                  "alias": [
                    
                  ]
                }
              ],
              "alia": [
                
              ],
              "pop": 100,
              "st": 0,
              "rt": null,
              "fee": 8,
              "v": 690,
              "crbt": null,
              "cf": "",
              "al": {
                "id": 3142053,
                "name": "我是歌手第三季 第12期",
                "picUrl": "http://p4.music.126.net/DprdNIWpRWYZJak4Q-cS-Q==/2891715582273535.jpg",
                "tns": [
                  
                ],
                "pic": 2891715582273535
              },
              "dt": 312000,
              "h": {
                "br": 320000,
                "fid": 0,
                "size": 12513828,
                "vd": -18900
              },
              "m": {
                "br": 192000,
                "fid": 0,
                "size": 7508348,
                "vd": -16300
              },
              "l": {
                "br": 128000,
                "fid": 0,
                "size": 5005609,
                "vd": -14500
              },
              "a": null,
              "cd": "1",
              "no": 2,
              "rtUrl": null,
              "ftype": 0,
              "rtUrls": [
                
              ],
              "djId": 0,
              "copyright": 0,
              "s_id": 0,
              "rtype": 0,
              "rurl": null,
              "mst": 9,
              "cp": 404023,
              "mv": 0,
              "publishTime": 1426780800007,
              "privilege": {
                "id": 31877470,
                "fee": 8,
                "payed": 0,
                "st": 0,
                "pl": 128000,
                "dl": 0,
                "sp": 7,
                "cp": 1,
                "subp": 1,
                "cs": false,
                "maxbr": 999000,
                "fl": 128000,
                "toast": false,
                "flag": 256,
                "preSell": false
              }
            }
          ],
          "relatedInfo": null,
          "videoUserLiveInfo": null,
          "vid": "8D7E52FC9AA9D3BE7BDE8EA083954828",
          "durationms": 345400,
          "playTime": 115364,
          "praisedCount": 1084,
          "praised": false,
          "subscribed": false
        }
      },
      {
        "type": 1,
        "displayed": false,
        "alg": "onlineHotGroup",
        "extAlg": null,
        "data": {
          "alg": "onlineHotGroup",
          "scm": "1.music-video-timeline.video_timeline.video.181017.-295043608",
          "threadId": "R_VI_62_B3926A8D5E6192C40F660176AEF787E1",
          "coverUrl": "https://p2.music.126.net/t1XS5pjisUlYpM2FExyn1w==/109951164056526817.jpg",
          "height": 720,
          "width": 1018,
          "title": "窦唯1994年香港红勘演唱会《高级动物》，才华洋溢气质迷人。",
          "description": null,
          "commentCount": 975,
          "shareCount": 1808,
          "resolutions": [
            {
              "resolution": 240,
              "size": 15731894
            },
            {
              "resolution": 480,
              "size": 19706616
            },
            {
              "resolution": 720,
              "size": 27817498
            }
          ],
          "creator": {
            "defaultAvatar": false,
            "province": 110000,
            "authStatus": 0,
            "followed": false,
            "avatarUrl": "http://p1.music.126.net/o6DW-GNI_EewZIZxtTZSsA==/109951164163502020.jpg",
            "accountStatus": 0,
            "gender": 0,
            "city": 110101,
            "birthday": -2209017600000,
            "userId": 1471190174,
            "userType": 0,
            "nickname": "三线音悦人",
            "signature": "要努力鸭~",
            "description": "",
            "detailDescription": "",
            "avatarImgId": 109951164163502020,
            "backgroundImgId": 109951162868128400,
            "backgroundUrl": "http://p1.music.126.net/2zSNIqTcpHL2jIvU6hG0EA==/109951162868128395.jpg",
            "authority": 0,
            "mutual": false,
            "expertTags": null,
            "experts": {
              "1": "泛生活视频达人"
            },
            "djStatus": 0,
            "vipType": 0,
            "remarkName": null,
            "avatarImgIdStr": "109951164163502020",
            "backgroundImgIdStr": "109951162868128395"
          },
          "urlInfo": {
            "id": "B3926A8D5E6192C40F660176AEF787E1",
            "url": "http://vodkgeyttp9.vod.126.net/vodkgeyttp8/XNWcasXe_2402375051_shd.mp4?ts=1622386668&rid=550BEF555AE24948DCFFFA23902302E3&rl=3&rs=rvTTbXALhCvOuRcQYtudWPPPTEwnmfwB&sign=d68922073c57dcfeb90cf6c617c8550a&ext=lzn%2B4CrYbaset0imXteCQDjdcbCLi7IaL%2BWwQZ2tkKHPyHyZMcN6YU6stOJJjOPYFSsv97rqYIMe3GovFcksr%2BYzATC9PrHIMKDm%2FiM2J%2FwFedwtouWYBR9Iix0ZUwA%2FgYzDI6n8tDSX1nkQq0i%2FRCZr0hxczzk%2BssHPLzizTYMTgmNdlfjY1FBKKd%2BKVMfNbqU7VFN9rTkm3kQhe1O%2BeNEKOhJ7ijjhzAXqv0iRdH77C3aUMQDYN1EgKYg9WKlF",
            "size": 27817498,
            "validityTime": 1200,
            "needPay": false,
            "payInfo": null,
            "r": 720
          },
          "videoGroup": [
            {
              "id": 58100,
              "name": "现场",
              "alg": null
            },
            {
              "id": 9102,
              "name": "演唱会",
              "alg": null
            },
            {
              "id": 57105,
              "name": "粤语现场",
              "alg": null
            },
            {
              "id": 57108,
              "name": "流行现场",
              "alg": null
            },
            {
              "id": 1100,
              "name": "音乐现场",
              "alg": null
            },
            {
              "id": 5100,
              "name": "音乐",
              "alg": null
            }
          ],
          "previewUrl": null,
          "previewDurationms": 0,
          "hasRelatedGameAd": false,
          "markTypes": null,
          "relateSong": [
            {
              "name": "高级动物",
              "id": 77470,
              "pst": 0,
              "t": 0,
              "ar": [
                {
                  "id": 2515,
                  "name": "窦唯",
                  "tns": [
                    
                  ],
                  "alias": [
                    
                  ]
                }
              ],
              "alia": [
                
              ],
              "pop": 100,
              "st": 0,
              "rt": "600907000001196407",
              "fee": 8,
              "v": 31,
              "crbt": null,
              "cf": "",
              "al": {
                "id": 7608,
                "name": "黑梦",
                "picUrl": "http://p4.music.126.net/R0wMPraoQqedutLeQz2okA==/109951163269912492.jpg",
                "tns": [
                  
                ],
                "pic_str": "109951163269912492",
                "pic": 109951163269912500
              },
              "dt": 278826,
              "h": {
                "br": 320000,
                "fid": 0,
                "size": 11155374,
                "vd": 0
              },
              "m": {
                "br": 192000,
                "fid": 0,
                "size": 6693242,
                "vd": 0
              },
              "l": {
                "br": 128000,
                "fid": 0,
                "size": 4462176,
                "vd": 0
              },
              "a": null,
              "cd": "1",
              "no": 9,
              "rtUrl": null,
              "ftype": 0,
              "rtUrls": [
                
              ],
              "djId": 0,
              "copyright": 0,
              "s_id": 0,
              "rtype": 0,
              "rurl": null,
              "mst": 9,
              "cp": 684010,
              "mv": 0,
              "publishTime": 783619200000,
              "privilege": {
                "id": 77470,
                "fee": 8,
                "payed": 0,
                "st": 0,
                "pl": 128000,
                "dl": 0,
                "sp": 7,
                "cp": 1,
                "subp": 1,
                "cs": false,
                "maxbr": 999000,
                "fl": 128000,
                "toast": false,
                "flag": 68,
                "preSell": false
              }
            }
          ],
          "relatedInfo": null,
          "videoUserLiveInfo": null,
          "vid": "B3926A8D5E6192C40F660176AEF787E1",
          "durationms": 261108,
          "playTime": 991734,
          "praisedCount": 4930,
          "praised": false,
          "subscribed": false
        }
      },
      {
        "type": 1,
        "displayed": false,
        "alg": "onlineHotGroup",
        "extAlg": null,
        "data": {
          "alg": "onlineHotGroup",
          "scm": "1.music-video-timeline.video_timeline.video.181017.-295043608",
          "threadId": "R_VI_62_089AA34C73C4F749AE5D78B40155C03C",
          "coverUrl": "https://p2.music.126.net/ZPugTN1p4us8T-Tx4Xj6fg==/109951164979291866.jpg",
          "height": 720,
          "width": 1280,
          "title": "刘宪华&李秀贤&朴正炫演绎《Shape of You》",
          "description": "刘宪华&李秀贤&朴正炫演绎《Shape of You》\n温柔的旋律，迷人的声线，\n让人沉浸在音乐的世界里，真的超治愈。",
          "commentCount": 14,
          "shareCount": 95,
          "resolutions": [
            {
              "resolution": 240,
              "size": 25299809
            },
            {
              "resolution": 480,
              "size": 41375749
            },
            {
              "resolution": 720,
              "size": 50866525
            }
          ],
          "creator": {
            "defaultAvatar": false,
            "province": 500000,
            "authStatus": 0,
            "followed": false,
            "avatarUrl": "http://p1.music.126.net/5mnhTNUXq_wY45-WVMJZvQ==/109951165064749300.jpg",
            "accountStatus": 0,
            "gender": 1,
            "city": 500101,
            "birthday": 856972800000,
            "userId": 137515266,
            "userType": 0,
            "nickname": "Zearboy",
            "signature": "「正在唠嗑」\n前路漫长，且共往之。",
            "description": "",
            "detailDescription": "",
            "avatarImgId": 109951165064749300,
            "backgroundImgId": 109951165420750200,
            "backgroundUrl": "http://p1.music.126.net/eu0vvKPGV7SpQ7SmeibgsA==/109951165420750208.jpg",
            "authority": 0,
            "mutual": false,
            "expertTags": null,
            "experts": null,
            "djStatus": 0,
            "vipType": 11,
            "remarkName": null,
            "avatarImgIdStr": "109951165064749300",
            "backgroundImgIdStr": "109951165420750208"
          },
          "urlInfo": {
            "id": "089AA34C73C4F749AE5D78B40155C03C",
            "url": "http://vodkgeyttp9.vod.126.net/vodkgeyttp8/FNgFyTo2_2838207681_shd.mp4?ts=1622386668&rid=550BEF555AE24948DCFFFA23902302E3&rl=3&rs=boUkuVOpCiSlySiITMbaAtrBQrEKTOog&sign=aea8722a5dddbf8c010e48f3b32ec696&ext=lzn%2B4CrYbaset0imXteCQDjdcbCLi7IaL%2BWwQZ2tkKHPyHyZMcN6YU6stOJJjOPYFSsv97rqYIMe3GovFcksr%2BYzATC9PrHIMKDm%2FiM2J%2FwFedwtouWYBR9Iix0ZUwA%2FgYzDI6n8tDSX1nkQq0i%2FRCZr0hxczzk%2BssHPLzizTYMTgmNdlfjY1FBKKd%2BKVMfNbqU7VFN9rTkm3kQhe1O%2BeNEKOhJ7ijjhzAXqv0iRdH77C3aUMQDYN1EgKYg9WKlF",
            "size": 50866525,
            "validityTime": 1200,
            "needPay": false,
            "payInfo": null,
            "r": 720
          },
          "videoGroup": [
            {
              "id": 58100,
              "name": "现场",
              "alg": null
            },
            {
              "id": 57106,
              "name": "欧美现场",
              "alg": null
            },
            {
              "id": 57108,
              "name": "流行现场",
              "alg": null
            },
            {
              "id": 59106,
              "name": "街头表演",
              "alg": null
            },
            {
              "id": 1100,
              "name": "音乐现场",
              "alg": null
            },
            {
              "id": 5100,
              "name": "音乐",
              "alg": null
            },
            {
              "id": 15172,
              "name": "Shape of You",
              "alg": null
            }
          ],
          "previewUrl": null,
          "previewDurationms": 0,
          "hasRelatedGameAd": false,
          "markTypes": null,
          "relateSong": [
            
          ],
          "relatedInfo": null,
          "videoUserLiveInfo": null,
          "vid": "089AA34C73C4F749AE5D78B40155C03C",
          "durationms": 239956,
          "playTime": 77676,
          "praisedCount": 773,
          "praised": false,
          "subscribed": false
        }
      },
      {
        "type": 1,
        "displayed": false,
        "alg": "onlineHotGroup",
        "extAlg": null,
        "data": {
          "alg": "onlineHotGroup",
          "scm": "1.music-video-timeline.video_timeline.video.181017.-295043608",
          "threadId": "R_VI_62_3F64B8BF7B5A1856DE169F59B292A4A8",
          "coverUrl": "https://p2.music.126.net/SjSx5On_Kj6utraLwqepZA==/109951164163667939.jpg",
          "height": 720,
          "width": 1280,
          "title": "LISA年末舞台直拍，SO HOT",
          "description": null,
          "commentCount": 16,
          "shareCount": 28,
          "resolutions": [
            {
              "resolution": 240,
              "size": 21377454
            },
            {
              "resolution": 480,
              "size": 32956996
            },
            {
              "resolution": 720,
              "size": 47255779
            }
          ],
          "creator": {
            "defaultAvatar": false,
            "province": 110000,
            "authStatus": 0,
            "followed": false,
            "avatarUrl": "http://p1.music.126.net/fd4vWqjlIw4U2qsLiygJ6A==/109951163138825710.jpg",
            "accountStatus": 0,
            "gender": 2,
            "city": 110101,
            "birthday": 812184012000,
            "userId": 17427395,
            "userType": 0,
            "nickname": "Lililover0327",
            "signature": "愿无岁月可回头。",
            "description": "",
            "detailDescription": "",
            "avatarImgId": 109951163138825710,
            "backgroundImgId": 109951163138828290,
            "backgroundUrl": "http://p1.music.126.net/vDyG9_mUsVFjz2KGkPo7Jw==/109951163138828288.jpg",
            "authority": 0,
            "mutual": false,
            "expertTags": null,
            "experts": null,
            "djStatus": 0,
            "vipType": 0,
            "remarkName": null,
            "avatarImgIdStr": "109951163138825710",
            "backgroundImgIdStr": "109951163138828288"
          },
          "urlInfo": {
            "id": "3F64B8BF7B5A1856DE169F59B292A4A8",
            "url": "http://vodkgeyttp9.vod.126.net/cloudmusic/LPiS3VAJ_2557500182_shd.mp4?ts=1622386668&rid=550BEF555AE24948DCFFFA23902302E3&rl=3&rs=XodtjvOapdkVDuXIpEAgVJxfvxujyeGi&sign=d83fe93f0619628570fbcba225193110&ext=lzn%2B4CrYbaset0imXteCQDjdcbCLi7IaL%2BWwQZ2tkKHPyHyZMcN6YU6stOJJjOPYFSsv97rqYIMe3GovFcksr%2BYzATC9PrHIMKDm%2FiM2J%2FwFedwtouWYBR9Iix0ZUwA%2FgYzDI6n8tDSX1nkQq0i%2FRCZr0hxczzk%2BssHPLzizTYMTgmNdlfjY1FBKKd%2BKVMfNbqU7VFN9rTkm3kQhe1O%2BeNEKOhJ7ijjhzAXqv0iRdH77C3aUMQDYN1EgKYg9WKlF",
            "size": 47255779,
            "validityTime": 1200,
            "needPay": false,
            "payInfo": null,
            "r": 720
          },
          "videoGroup": [
            {
              "id": 58100,
              "name": "现场",
              "alg": null
            },
            {
              "id": 57107,
              "name": "韩语现场",
              "alg": null
            },
            {
              "id": 57108,
              "name": "流行现场",
              "alg": null
            },
            {
              "id": 57110,
              "name": "饭拍现场",
              "alg": null
            },
            {
              "id": 1100,
              "name": "音乐现场",
              "alg": null
            },
            {
              "id": 5100,
              "name": "音乐",
              "alg": null
            }
          ],
          "previewUrl": null,
          "previewDurationms": 0,
          "hasRelatedGameAd": false,
          "markTypes": null,
          "relateSong": [
            
          ],
          "relatedInfo": null,
          "videoUserLiveInfo": null,
          "vid": "3F64B8BF7B5A1856DE169F59B292A4A8",
          "durationms": 134003,
          "playTime": 61589,
          "praisedCount": 566,
          "praised": false,
          "subscribed": false
        }
      },
      {
        "type": 1,
        "displayed": false,
        "alg": "onlineHotGroup",
        "extAlg": null,
        "data": {
          "alg": "onlineHotGroup",
          "scm": "1.music-video-timeline.video_timeline.video.181017.-295043608",
          "threadId": "R_VI_62_6D319378A414DA0C9D433C0CF9C78ED0",
          "coverUrl": "https://p2.music.126.net/i6A94w4byAivYEBu_b1K9w==/109951164987787313.jpg",
          "height": 720,
          "width": 1280,
          "title": "无题 姜云升",
          "description": null,
          "commentCount": 429,
          "shareCount": 1854,
          "resolutions": [
            {
              "resolution": 240,
              "size": 22171531
            },
            {
              "resolution": 480,
              "size": 39097299
            },
            {
              "resolution": 720,
              "size": 57229801
            }
          ],
          "creator": {
            "defaultAvatar": false,
            "province": 210000,
            "authStatus": 0,
            "followed": false,
            "avatarUrl": "http://p1.music.126.net/fkV-N4nZLWAm2V0BU8zWyA==/109951164809900701.jpg",
            "accountStatus": 0,
            "gender": 2,
            "city": 210100,
            "birthday": 933091200000,
            "userId": 439627010,
            "userType": 204,
            "nickname": "著名磨人精",
            "signature": "姜云升毒唯",
            "description": "",
            "detailDescription": "",
            "avatarImgId": 109951164809900700,
            "backgroundImgId": 109951164566641940,
            "backgroundUrl": "http://p1.music.126.net/L5F4OR4iFs6kZJdf9JohCw==/109951164566641934.jpg",
            "authority": 0,
            "mutual": false,
            "expertTags": null,
            "experts": null,
            "djStatus": 0,
            "vipType": 0,
            "remarkName": null,
            "avatarImgIdStr": "109951164809900701",
            "backgroundImgIdStr": "109951164566641934"
          },
          "urlInfo": {
            "id": "6D319378A414DA0C9D433C0CF9C78ED0",
            "url": "http://vodkgeyttp9.vod.126.net/cloudmusic/fI4yAYN5_3000725002_shd.mp4?ts=1622386668&rid=550BEF555AE24948DCFFFA23902302E3&rl=3&rs=DWCUlaBaPBLpdAIulJorptpHmoGuoMJT&sign=cf9d95deb63f7d1be53eb3d62c857b27&ext=lzn%2B4CrYbaset0imXteCQDjdcbCLi7IaL%2BWwQZ2tkKHPyHyZMcN6YU6stOJJjOPYFSsv97rqYIMe3GovFcksr%2BYzATC9PrHIMKDm%2FiM2J%2FwFedwtouWYBR9Iix0ZUwA%2FgYzDI6n8tDSX1nkQq0i%2FRCZr0hxczzk%2BssHPLzizTYMTgmNdlfjY1FBKKd%2BKVMfNbqU7VFN9rTkm3kQhe1O%2BeNEKOhJ7ijjhzAXqv0iRdH77C3aUMQDYN1EgKYg9WKlF",
            "size": 57229801,
            "validityTime": 1200,
            "needPay": false,
            "payInfo": null,
            "r": 720
          },
          "videoGroup": [
            {
              "id": 58100,
              "name": "现场",
              "alg": null
            },
            {
              "id": 59101,
              "name": "华语现场",
              "alg": null
            },
            {
              "id": 57110,
              "name": "饭拍现场",
              "alg": null
            },
            {
              "id": 1100,
              "name": "音乐现场",
              "alg": null
            },
            {
              "id": 5100,
              "name": "音乐",
              "alg": null
            }
          ],
          "previewUrl": null,
          "previewDurationms": 0,
          "hasRelatedGameAd": false,
          "markTypes": null,
          "relateSong": [
            
          ],
          "relatedInfo": null,
          "videoUserLiveInfo": null,
          "vid": "6D319378A414DA0C9D433C0CF9C78ED0",
          "durationms": 153000,
          "playTime": 546394,
          "praisedCount": 13145,
          "praised": false,
          "subscribed": false
        }
      }
    ];
    let videoList = this.data.videoList;
    // 将视频最新的数据更新到原有的视频列表中
    videoList.push(...newVideoList); 
    this.setData({
      videoList
    })
  },


  // 跳转至搜索界面
  toSearch(){
    wx.navigateTo({
      url: '/pages/search/search'
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
    // 下拉刷新需要设置才可以使用,
    console.log('页面的下拉刷新');

  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {
    // 上拉触底不需要设置，事件就可以直接使用
    // console.log('页面的上拉触底');
  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function ({from}) {
    console.log(from); // 可以区分用户是从哪个按钮转发的
    if(from === 'button'){
      return {
        title: '来自button的转发',
        page: '/pages/video/video',
        // image: 图片也可以自定义
      }
    }else{
      return {
        title: '来自menu的转发',
        page: '/pages/video/video',
        // image: 图片可自定义
      }
    }

  }
})