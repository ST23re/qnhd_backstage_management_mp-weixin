<template>
  <view>
    <navbar :index="4"></navbar>
    <view id="mainContainer" :style="{ paddingTop: toTop }">
      <view id="contentContainer" :style="{ height: contentHeight }">
        <view class="header">
          敏感词条
          <text class="inner">read only</text>
        </view>
        <view id="wordsContainer" :style="{ height: wordsHeight }">
          <view v-for="word in words" :key="word">
            <text class="words">{{ word + `\n` }}</text>
          </view>
          <view class="tip">仅展示最近更新的200个词条</view>
        </view>
        <view id="add">
          <u-button
            ripple
            @click="newEntries = true"
            :custom-style="{
              height: '70rpx',
              lineHeight: '70rpx',
              textAlign: 'center',
              fontSize: '32rpx',
              color: '#363c54',
              fontWeight: 'bold',
              borderRadius: '25rpx',
            }"
          >
            + 追加敏感词
          </u-button>
        </view>
      </view>
    </view>
    <u-popup v-model="newEntries" mode="center" border-radius="30">
      <view style="width: 600rpx; overflow: hidden;">
        <view class="text-area-holder">
          <u-input
            v-model="sensitiveEntries"
            type="textarea"
            :height="400"
            :custom-style="{
              fontSize: '30rpx',
            }"
            :maxlength="1000"
            :auto-height="true"
            placeholder="可用换行键区分多个敏感词，一并追加"
          />
        </view>
        <view class="sure-button-holder">
          <u-button
            @click="addEntries"
            ripple
            :custom-style="{
              height: '70rpx',
              color: 'white',
              backgroundColor: '#363c54',
              fontWeight: '32rpx',
              fontWeight: 'bold',
            }"
          >
            确认
          </u-button>
        </view>
      </view>
    </u-popup>
    <u-toast ref="uToast" />
  </view>
</template>

<script>
import { addSensitive, getSensitive } from '../../api';
import navbar from '../../components/navbar/navbar.vue';
export default {
  components: { navbar },
  data() {
    return {
      words: [],
      sensitiveEntries: '',
      newEntries: false,
    };
  },
  onLoad() {
    if (this.vuex_user.adminType == '请登录')
      uni.redirectTo({
        url: '/pages/index/index',
      });
    else this.getWords();
  },
  computed: {
    btnInfo() {
      return this.$store.state.menuButtonInfo;
    },
    toTop() {
      return `calc(${this.btnInfo.top}px + 90rpx)`;
    },
    contentHeight() {
      return `calc(100vh - ${this.btnInfo.top}px - 120rpx)`;
    },
    wordsHeight() {
      return `calc(100vh - ${this.btnInfo.top}px - 320rpx)`;
    },
  },
  methods: {
    getWords() {
      getSensitive().then(res => {
        this.words = res
          .split('\n')
          .slice(-201)
          .reverse();
        this.words.splice(0, 1);
      });
    },
    addEntries() {
      var strArr = this.sensitiveEntries.split('\n');
      for (var i = strArr.length - 1; i >= 0; i--) if (strArr[i].trim().length == 0) strArr.splice(i, 1);
      if (strArr.length) {
        var data = '';
        for (var j = 0; j < strArr.length; j++) data += `words=${strArr[j]}&`;
        data = data.substring(0, data.length - 1);
        uni.request({
          url: this.$store.state.urls_apply.baseUrl + '/sensitive/words',
          method: 'POST',
          header: {
            'Content-type': 'application/x-www-form-urlencoded;charset=utf-8;',
            token: this.$store.state.vuex_token,
          },
          data: data,
          success: ({ data: res }) => {
            if (res.code === 200) {
              this.newEntries = false;
              this.tip('敏感词追加成功！', 'success');
              this.getWords();
            } else if (res.code === 20001) this.relog();
            else this.tip('敏感词追加失败！', 'warning');
          },
          fail: err => {
            this.tip('敏感词添加失败，请联系网站管理员处理', 'warning');
            console.log(err);
          },
        });
      } else this.tip('敏感词条不能为空！', 'warning');
    },
    relog() {
      this.tip('登录过期，请重新登录', 'warning');
      this.$u.vuex('vuex_user.adminType', '请登录');
      this.$u.vuex('vuex_user.adminName', '请登录');
      this.$u.vuex('vuex_token', '');
      setTimeout(() => {
        uni.redirectTo({
          url: '/pages/login/index',
        });
      }, 1000);
    },
    tip(tipTitle, tipType) {
      this.$refs.uToast.show({
        title: tipTitle,
        type: tipType,
        position: 'top',
      });
    },
  },
};
</script>

<style lang="scss" scoped>
#mainContainer {
  width: 100%;
  height: 100vh;
  background-color: #f5f5f5;
  #contentContainer {
    width: calc(100% - 60rpx);
    margin: auto;
    background-color: white;
    border-radius: 30rpx;
    padding: 90rpx 30rpx;
    transform: scale(1);
    .header {
      width: 100%;
      height: 70rpx;
      line-height: 70rpx;
      text-align: center;
      font-size: 32rpx;
      font-weight: bold;
      position: fixed;
      top: 20rpx;
      left: 0;
      .inner {
        font-size: 26rpx;
        color: grey;
        margin-left: 20rpx;
      }
    }
    #wordsContainer {
      overflow-x: hidden;
      overflow-y: auto;
      .words {
        max-width: calc(100% - 40rpx);
        margin: 15rpx;
        float: left;
        font-size: 26rpx;
        color: grey;
        font-weight: bold;
        line-height: 50rpx;
        word-break: break-all;
        overflow: hidden;
        text-overflow: ellipsis;
        display: -webkit-box;
        -webkit-line-clamp: 1;
        -webkit-box-orient: vertical;
      }
      .tip {
        width: 100%;
        line-height: 50rpx;
        font-size: 26rpx;
        font-weight: bold;
        float: left;
        margin: 15rpx;
      }
    }
    #add {
      width: 270rpx;
      height: 90rpx;
      margin: auto;
      margin-top: 20rpx;
      border-radius: 20rpx;
    }
  }
}
#contentContainer ::-webkit-scrollbar {
  width: 0;
  height: 0;
  background-color: transparent;
}
.text-area-holder {
  width: 560rpx;
  margin: 40rpx auto 20rpx;
  padding: 0 20rpx;
  border: 1px solid #dcdfe6;
  border-radius: 20rpx;
}
.sure-button-holder {
  width: 200rpx;
  margin: auto;
  height: 70rpx;
  margin-bottom: 20rpx;
}
</style>
