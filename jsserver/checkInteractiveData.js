exports.main = function (arg) {
  console.log('11111');
  try {
    arg = JSON.parse(arg)
    const myOpenid = wx.getOpenId()
    console.log(myOpenid)
    const toOpenid = arg.toUser
    const opNum = arg.opNum
    const now = new Date()
    const giftStorageKey = now.toDateString()
    const friendsStorage = wx.getFriendUserStorage([giftStorageKey])
    const userList = friendsStorage.user_item
    let ok = false
    
    // 用户每天只能给同一个好友赠送一次金币,每天最多送5次
    const friendData = userList.find(userItem => userItem.openid === toOpenid)
    const myData = userList.find(userItem => userItem.openid === myOpenid)
    if (friendData) {
      const friendKV = friendData.kv_list[friendData.kv_list.length - 1]
      const selfKV = myData.kv_list[myData.kv_list.length - 1]
      let friendGift = friendKV && friendKV.value
      let selfGift = selfKV && selfKV.value
      if (friendGift) {
        friendGift = JSON.parse(friendGift)
      } else {
        friendGift = {
          receiveRecords: [],
          sendCount: 0
        }
      }
      if (selfGift) {
        selfGift = JSON.parse(selfGift)
      } else {
        selfGift = {
          receiveRecords: [],
          sendCount: 0
        }
      }

      // 金币重复送给同一个人,只能送一次
      const giftToSameOne = friendGift && friendGift.receiveRecords.some(item => {
        return item.fromOpenid === myOpenid
      })
      // 赠送次数超过限制,自己赠送给别人的最大次数
      const outLimit = selfGift && selfGift.sendCount >= 10
      const canNotGift = giftToSameOne || outLimit
      console.log(friendGift, canNotGift);
      // 验证
      if (!canNotGift) {
        friendGift.receiveRecords.push({
          fromOpenid: myOpenid,
          time: Date.now()
        })
        selfGift.sendCount = selfGift.sendCount + 1
        // 写对方的数据
        let ret1 = wx.setFriendUserStorage(toOpenid, [{
          key: giftStorageKey,
          value: JSON.stringify(friendGift)
        }])
        // 写自己的数据
        let ret2 = wx.setFriendUserStorage(myOpenid, [{
          key: giftStorageKey,
          value: JSON.stringify(selfGift)
        }])
        console.log(ret1, ret2);
        if (ret1.errcode == 0 && ret2.errcode == 0) {
          ok = true
        } else {
          console.error('fail')
        }
      }
    }
  
    if (ok) {
      // 验证通过
      return JSON.stringify({ "ret": true });
    } else {
      // 验证不通过
      return JSON.stringify({ "ret": false });
    }
  } catch (err) {
    console.error(err)
  }
}