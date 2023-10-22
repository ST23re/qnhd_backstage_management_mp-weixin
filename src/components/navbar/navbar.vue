<template>
  <view>
    <!-- <view class="header-fixed"> -->
    <view @click="toShowItems" class="menu-btn" :style="{ top: axisTop }">
      <u-icon name="list-dot" color="#000000" size="50"></u-icon>
    </view>
    <!-- <u-button plain ripple @click="showItem = true" :custom-style="btnStyle"
        ><text class="text-class">{{ vuex_user.adminName }}</text></u-button
      > -->
    <!-- </view> -->
    <u-popup
      width="45%"
      v-model="showItems"
      border-radius="30"
      mode="left"
      :custom-style="{ marginTop: popupToTop }"
      safe-area-inset-bottom
      class="left-popup-holder"
    >
      <view class="text-class" style="padding: 40rpx 20rpx 20rpx;">{{ vuex_user.adminType }}</view>
      <view class="menu-title-class">· 管理面板 ·</view>
      <u-line color="grey" length="76%" margin="0" style="position: relative; left: 12%;" />
      <view style="width: 100%; height: 20rpx;"></view>

      <view class="menu-item-class menu-item-fill-class" v-if="itemIndex == 0" @click="changeIndex" data-index="0">
        <image src="../../static/home-fill.png" style="width: 60rpx; height: 60rpx"></image>
        <text class="text-class menu-text-class menu-text-fill-class adjust">主页</text>
      </view>
      <view class="menu-item-class" v-else @click="changeIndex" data-index="0">
        <image src="../../static/home.png" style="width: 60rpx; height: 60rpx"></image>
        <text class="text-class menu-text-class adjust">主页</text>
      </view>

      <view class="menu-item-class menu-item-fill-class" v-if="itemIndex == 1" @click="changeIndex" data-index="1">
        <image src="../../static/user-fill.png" style="width: 60rpx; height: 60rpx"></image>
        <text class="text-class menu-text-class menu-text-fill-class">用户管理</text>
      </view>
      <view class="menu-item-class" v-else @click="changeIndex" data-index="1">
        <image src="../../static/user.png" style="width: 56rpx; height: 56rpx"></image>
        <text class="text-class menu-text-class">用户管理</text>
      </view>

      <view class="menu-item-class menu-item-fill-class" v-if="itemIndex == 2" @click="changeIndex" data-index="2">
        <image src="../../static/content-fill.png" style="width: 60rpx; height: 60rpx"></image>
        <text class="text-class menu-text-class menu-text-fill-class">内容管理</text>
      </view>
      <view class="menu-item-class" v-else @click="changeIndex" data-index="2">
        <image src="../../static/content.png" style="width: 60rpx; height: 60rpx"></image>
        <text class="text-class menu-text-class">内容管理</text>
      </view>

      <view class="menu-item-class menu-item-fill-class" v-if="itemIndex == 3" @click="changeIndex" data-index="3">
        <image src="../../static/partitions-fill.png" style="width: 60rpx; height: 60rpx"></image>
        <text class="text-class menu-text-class menu-text-fill-class">分区管理</text>
      </view>
      <view class="menu-item-class" v-else @click="changeIndex" data-index="3">
        <image src="../../static/partitions.png" style="width: 60rpx; height: 60rpx"></image>
        <text class="text-class menu-text-class">分区管理</text>
      </view>

      <view
        class="menu-item-class menu-item-fill-class"
        v-if="itemIndex == 4 && vuex_user.adminType == '超级管理员'"
        @click="changeIndex"
        data-index="4"
      >
        <image src="../../static/sensitive-fill.svg" style="width: 60rpx; height: 60rpx"></image>
        <text class="text-class menu-text-class menu-text-fill-class">敏感词条</text>
      </view>
      <view class="menu-item-class" v-else-if="vuex_user.adminType == '超级管理员'" @click="changeIndex" data-index="4">
        <image src="../../static/sensitive.svg" style="width: 60rpx; height: 60rpx"></image>
        <text class="text-class menu-text-class">敏感词条</text>
      </view>

      <view
        class="menu-item-class menu-item-fill-class"
        v-if="itemIndex == 5 && vuex_user.adminType == '超级管理员'"
        @click="changeIndex"
        data-index="5"
      >
        <image src="../../static/notice-fill.png" style="width: 60rpx; height: 60rpx"></image>
        <text class="text-class menu-text-class menu-text-fill-class">公告管理</text>
      </view>
      <view class="menu-item-class" v-else-if="vuex_user.adminType == '超级管理员'" @click="changeIndex" data-index="5">
        <image src="../../static/notice.png" style="width: 60rpx; height: 60rpx"></image>
        <text class="text-class menu-text-class">公告管理</text>
      </view>

      <view class="menu-item-class menu-item-fill-class" v-if="itemIndex == 6" @click="changeIndex" data-index="6">
        <image src="../../static/diary-fill.png" style="width: 60rpx; height: 60rpx; transform: scale(0.8);"></image>
        <text class="text-class menu-text-class menu-text-fill-class">操作日志</text>
      </view>
      <view class="menu-item-class" v-else @click="changeIndex" data-index="6">
        <image src="../../static/diary.png" style="width: 60rpx; height: 60rpx; transform: scale(0.8);"></image>
        <text class="text-class menu-text-class">操作日志</text>
      </view>

      <view
        class="menu-item-class menu-item-fill-class"
        v-if="itemIndex == 7 && vuex_user.adminType == '超级管理员'"
        @click="changeIndex"
        data-index="7"
      >
        <image src="../../static/superAdmin-fill.png" style="width: 60rpx; height: 60rpx"></image>
        <text class="text-class menu-text-class menu-text-fill-class">超级管理</text>
      </view>
      <view class="menu-item-class" v-else-if="vuex_user.adminType == '超级管理员'" @click="changeIndex" data-index="7">
        <image src="../../static/superAdmin.png" style="width: 60rpx; height: 60rpx"></image>
        <text class="text-class menu-text-class">超级管理</text>
      </view>

      <view
        class="menu-item-class menu-item-fill-class"
        v-if="itemIndex == 8 && vuex_user.adminType === '超级管理员'"
        @click="changeIndex"
        data-index="8"
      >
        <image src="../../static/games-fill.svg" style="width: 60rpx; height: 60rpx"></image>
        <text class="text-class menu-text-class menu-text-fill-class">游戏管理</text>
      </view>
      <view class="menu-item-class" v-else-if="vuex_user.adminType == '超级管理员'" @click="changeIndex" data-index="8">
        <image src="../../static/games.svg" style="width: 60rpx; height: 60rpx"></image>
        <text class="text-class menu-text-class">游戏管理</text>
      </view>

      <view class="menu-item-class menu-item-fill-class" v-if="itemIndex == 9" @click="changeIndex" data-index="9">
        <image src="../../static/info-fill.svg" style="width: 60rpx; height: 60rpx"></image>
        <text class="text-class menu-text-class menu-text-fill-class">个人信息</text>
      </view>
      <view class="menu-item-class" v-else @click="changeIndex" data-index="9">
        <image src="../../static/info.svg" style="width: 60rpx; height: 60rpx"></image>
        <text class="text-class menu-text-class">个人信息</text>
      </view>
    </u-popup>
    <u-action-sheet
      :list="vuex_user.adminType == '请登录' ? showItemList_2 : showItemList_1"
      @click="toAction"
      v-model="showItem"
      border-radius="24"
      safe-area-inset-bottom
    ></u-action-sheet>
    <u-toast ref="uToast" />
  </view>
</template>

<script>
export default {
  data() {
    return {
      itemIndex: 0,
      showItems: false,
      showItem: false,
      pagesItem: ['index', 'user', 'content', 'tag', 'sensitive', 'notice', 'logPage', 'superAdmin', 'games', 'info'],
      showItemList_1: [
        {
          text: '退出登录',
          fontSize: 28,
          subText: '感谢您的付出',
        },
      ],
      showItemList_2: [
        {
          text: '登录',
          fontSize: 28,
          subText: '也要做一个维护秩序的小天使呢！',
        },
      ],
      // btnStyle: {
      //   position: "absolute",
      //   fontSize: "32rpx",
      //   top: "5rpx",
      //   right: "50rpx",
      //   width: "250rpx",
      //   height: "90rpx",
      //   borderRadius: "20rpx",
      //   backgroundColor: "#f5f5f5 !important",
      // },
    };
  },
  props: ['index'],
  onLoad() {},
  computed: {
    btnInfo() {
      return this.$store.state.menuButtonInfo;
    },
    axisTop() {
      return `calc(${this.btnInfo.top + this.btnInfo.height / 2}px - 30rpx)`;
    },
    popupToTop() {
      return `${this.btnInfo.top}px`;
    },
  },
  methods: {
    toShowItems() {
      if (this.vuex_user.adminType == '请登录') {
        this.$refs.uToast.show({
          title: '登录后即可查看管理面板',
          type: 'warning',
          position: 'top',
        });
      } else {
        this.itemIndex = this.index;
        this.showItems = true;
      }
    },
    changeIndex(index) {
      if (this.itemIndex != index.currentTarget.dataset.index - '0') {
        let tempInex = this.itemIndex;
        this.itemIndex = index.currentTarget.dataset.index - '0';
        this.showItems = false;
        if (tempInex == 0)
          uni.navigateTo({
            url: '/pages/' + this.pagesItem[this.itemIndex] + '/index',
          });
        else {
          if (this.itemIndex == 0)
            uni.reLaunch({
              url: '/pages/' + this.pagesItem[this.itemIndex] + '/index',
            });
          else
            uni.redirectTo({
              url: '/pages/' + this.pagesItem[this.itemIndex] + '/index',
            });
        }
      }
    },
    toAction(index) {
      if (index == 0)
        if (this.vuex_user.adminType == '请登录') {
          uni.navigateTo({
            url: '/pages/login/index',
          });
        } else {
          this.$u.vuex('vuex_user.adminType', '请登录');
          this.$u.vuex('vuex_user.adminName', '请登录');
          this.$u.vuex('vuex_token', '');
          this.$refs.uToast.show({
            title: '已退出登录',
            type: 'success',
            position: 'top',
          });
          setTimeout(() => {
            uni.redirectTo({
              url: '/pages/index/index',
            });
          }, 500);
        }
    },
  },
};
</script>

<style scoped>
/* .header-fixed {
  width: 100%;
  background-color: transparent;
  padding-left: 50rpx;
  padding-top: 5rpx;
  box-sizing: border-box;
  position: fixed;
  top: 80rpx;
  left: 0;
  z-index: 3;
} */
/* .btn {
  position: relative;
  display: flex;
  cursor: pointer;
  overflow: hidden;
  transition: background-color 0.25s;
  width: 90rpx;
  height: 90rpx;
  border-radius: 50%;
  padding-left: 16rpx;
  padding-top: 5rpx;
}
.btn:hover {
  background-color: #e5e5e5;
}
.btn::after {
  content: "";
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-image: radial-gradient(circle, #aaa 10%, transparent 10.1%);
  transform: scale(10);
  opacity: 0;
  transition: all 0.6s;
}
.btn:active::after {
  transform: scale(0);
  opacity: 0.5;
  transition: 0s;
} */
.menu-btn {
  width: 60rpx;
  height: 60rpx;
  border-radius: 50%;
  background-color: transparent;
  display: flex;
  justify-content: center;
  align-items: center;
  position: fixed;
  left: 65rpx;
  z-index: 3;
}
.text-class {
  color: #363c54;
  font-family: Roboto, sans-serif;
  font-weight: 700;
  font-size: 38rpx;
  text-align: center;
}
.menu-title-class {
  color: #363c54;
  font-family: Roboto, sans-serif;
  font-weight: 700;
  font-size: 38rpx;
  text-align: center;
  padding-bottom: 30rpx;
}
.menu-item-class {
  cursor: pointer;
  position: relative;
  width: 80%;
  left: 10%;
  height: 110rpx;
  margin: 10rpx 0;
  padding: 25rpx 0;
  padding-left: 15rpx;
  border-radius: 18rpx;
}
.menu-text-class {
  position: relative;
  color: #757575;
  font-size: 36rpx;
  top: -14rpx;
  left: 30rpx;
}
.menu-item-fill-class {
  background-color: #e4effa;
}
.menu-text-fill-class {
  color: #1276d2;
}
.adjust {
  margin-left: 35rpx;
}
.left-popup-holder ::-webkit-scrollbar {
  width: 0;
  height: 0;
  background-color: transparent;
}
</style>
