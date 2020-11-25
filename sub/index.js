import style    from 'render/style.js';
import tplFn    from 'render/tplfn.js';
import Layout   from './engine.js'

import {
    getFriendData,
    setUserRecord,
    getUserInfo,
    // findSelf,
    injectSelfToList,
    replaceSelfDataInList,
} from 'data.js';

let postType;
let userinfo;
let selfData;
let key             = 'rankScore';
let currentMaxScore = 0;
let cacheRankData   = [];
let anyData= [];

let sharedCanvas  = wx.getSharedCanvas();
let sharedContext = sharedCanvas.getContext('2d');
let tabIndex = 0;
const sortTypes = ['score1', 'score2', 'score3'];
function draw(data = []) {
    data = data.map((item) => {
        return {
            ...item,
            score: item[sortTypes[tabIndex]],
        }
    });
    let template = tplFn({
        data,
        self: data.find((item) => item.openid === userinfo.openid) || data[0],
        selfIndex: 1,
    });

    Layout.clear();
    Layout.init(template, style);

    const list = Layout.getElementsByClassName('top')
    const title = Layout.getElementsByClassName('title')
    const gift = Layout.getElementsByClassName('gift')

    title[0].style.backgroundColor='rgba(0, 0, 0, 0.8)'
    list[tabIndex].style.backgroundColor='#1e8363'

    Layout.layout(sharedContext);
    // 点击赠送礼物
    gift.forEach((item, index) => {
        item.on('click', (e) => {
           let toOpenid = "";
           toOpenid = data[index].openid;
           wx.modifyFriendInteractiveStorage({
            key: '1',
            opNum: 1,
            operation: 'add',
            toUser: toOpenid, // 好友的 openId
            success: (res) => {
            console.log("发送成功！" + JSON.stringify(res));
            },
            fail: (err) => {
            console.log('err', err)
            }
           })
        });
    });

    // function aaa (rec) {
    //     console.log('接收的记录', rec);
    //     let arr = new Array();
    //     arr.push({ key: "score2", value: '1111' });  //此处的rec.misssionId是int类型
    //     arr.push({ key: "score1", value: '111' });arr.push({ key: "score3", value: '111' });
     
    //     wx.setUserCloudStorage({
    //         KVDataList: arr,
    //         success: function (res) {
    //             console.log("存储记录成功\n", res);
    //         },
    //         fail: function (res) {
    //             console.error(res);
    //         },
    //         complete(res) {
     
    //         }
    //     })
    //  }
    // 会员榜排行
    list.forEach((item, index) => {
        item.on('click', (e) => {
            list.forEach((itx, idx) => {
                if (index === idx) {
                    itx.style.backgroundColor='#1e8363'
                } else {
                    itx.style.backgroundColor='#60b99d'
                }
            })

            tabIndex = index;
            function sortNumber(a,b) {
                return b[sortTypes[index]] - a[sortTypes[index]];
            }
            anyData.sort(sortNumber);
            // console.log('anyData', anyData);
            draw(anyData);
        });
    });
    // 群排行
    title.forEach((item,index) => {
        item.on('click', (e)=>{
           title.forEach((itd, int)=> {
            if (index === int) {
                itd.style.backgroundColor='rgba(0, 0, 0, 0.8)'
            } else {
                itd.style.backgroundColor='#e95893'
            }
           })
           Layout.repaint() 
        })
    })
}

function loadFriendDataAndRender(key, info, needRender = true) {
    getFriendData(key, (data) => {
        // let find = findSelf(data, info);
        // selfData = find.self;

        /**
         * 拉取排行榜的时候无法确定排行榜中是否有自己，或者即便有自己分数也是旧的
         * 如果拉取排行榜之前先调用setUserCloudStorage来上报分数再拉取排行榜
         * 那么第一次渲染排行榜会非常之慢。针对这种场景需要根据情况处理：
         * 1. 如果拉取排行榜之前有调用分数上报接口，将每次上报的分数缓存起来，然后插入或者替换排行榜中的自己
         * 2. 如果拉取排行榜之前没有调用分数上报接口，忽略1的逻辑
         */
        // if ( !selfData && currentMaxScore !== undefined ) {
        //     injectSelfToList(data, info, currentMaxScore);
        // } else if ( selfData && currentMaxScore !== undefined ) {
        //     // 替换自己的分数
        //     replaceSelfDataInList(data, info, currentMaxScore);
        // }

        // 缓存数据，加速下次渲染
        cacheRankData = data;

        // mock
         for ( let i = 0; i < data.length; i++ ) {
            //  data[i] = JSON.parse(JSON.stringify(data[0]));
             data[i].score1 = Math.floor(Math.random()*1000+1)
             data[i].score2 = Math.floor(Math.random()*1000+1)
             data[i].score3 = Math.floor(Math.random()*1000+1)
        }

        function sortNumber(a,b) {
            return b.score1 - a.score1
        }
        data.sort(sortNumber);

        anyData = data;

        if ( needRender ) {
            draw(data);
        }

        // let btnList = Layout.getElementsByClassName('giftBtn');
        // for (let i = 0;i < btnList.length;i ++) {
        //     btnList[i].on('click',(e) => {
        //         let img = Layout.getElementsById('img' + i);
        //         img[0].src = img[0].src === "sub/Buffet_icon_GiftPlate_0.png" ? "sub/Buffet_icon_GiftPlate.png":  "sub/Buffet_icon_GiftPlate_0.png"
        //     });
        // }
    });
}

function init() {
    currentMaxScore = 0;
    cacheRankData   = [];

    wx.onMessage(data => {
        console.log('onMessage', data);
        if ( data.event === 'updateViewPort' ) {
            Layout.updateViewPort(data.box);
            getUserInfo((info) => {
                userinfo = info;
                loadFriendDataAndRender(key, info)
            });
        }
    });
}

function showFriendRank() {
    if ( cacheRankData && cacheRankData.length ) {
        // 更新缓存数据
        if ( userinfo && currentMaxScore ) {
            replaceSelfDataInList(cacheRankData, userinfo, currentMaxScore);
        }
        // Layout.clearAll();
        draw(cacheRankData, selfData, currentMaxScore);
    }

    /**
     * 用户信息会在子域初始化的时候去拉取
     * 但是存在用户信息还没有拉取完成就要求渲染排行榜的情况，这时候再次发起用信息请求再拉取排行榜
     */
    if ( !userinfo ) {
        getUserInfo((info) => {
            userinfo = info;
            loadFriendDataAndRender(key, info);
        });
    } else {
        loadFriendDataAndRender(key, userinfo);
    }
}

init();

