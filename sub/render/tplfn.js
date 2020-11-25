import template from './template.js';
export default function anonymous(it) {
  // <image class="conImg" src="img/WeChatRank_BottomBlueBoard.png"></image>
  var out = '<view class="box"><view class="container" id="main"><view class="header"> <text class="title" value="好友排行"></text></view><view class="bgbox"><view class="listbox"><text class="top" value="会员榜"></text><text class="top" value="战斗榜"></text><text class="top" value="硬件榜"></text></view> <view class="rankList"> <scrollview class="list"> ';
  var arr1 = it.data;
  if (arr1) {
    var item, index = -1,
      l1 = arr1.length - 1;
    while (index < l1) {
      item = arr1[index += 1];
      out += ' ';
      // if (index) {
        out += ' <image class="frbox" src="sub/img/WeChatRank_FriendPanel.png"><view class="listItem listItemOld">  ';
      // }
      // out += ' ';
      // if (index % 2 === 0) {
      //   out += ' <view class="listItem"><image class="frbox" src="img/WeChatRank_FriendPanel.png"> </image>';
      // }
      out += ' <text class="listItemNum" value="' + (index + 1) + '"></text> <image class="listHeadImg" src="' + (item.avatarUrl) + '"></image> <view><text class="listItemName" value="' + (item.nickname) + '"></text><text class="numbertop" value="' + (item.score) + '"></text></view><image class="gift" src="sub/img/WeChatRank_GiftButton.png"></image></view></image> ';
    }
  }
  out += ' </scrollview> <view class="listItem selfListItem"> <text class="listItemNum" value="' + (it.selfIndex) + '"></text> <image class="listHeadImg" src="' + (it.self.avatarUrl) + '"></image> <view><text class="listItemName" value="' + (it.self.nickname) + '"></text><text class="numbertop" value="' + (it.self.score) + '"></text></view></view></view> </view></view></view>';
  return out;
}
