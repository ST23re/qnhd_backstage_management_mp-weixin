<template>
  <view>
    <navbar :index="0"></navbar>
    <view class="user-class" :style="{ top: vuex_user.adminType === '超级管理员' ? toTop(90) : toTop(170) }">
      <view class="text-class header-text">
        <text>{{ helloWords }}</text>
      </view>
      <image src="../../static/developer.svg" id="mainSvg" />
      <view class="text-class">
        <text style="font-size: 40rpx">青年湖底</text>
        <text style="font-size: 36rpx">
          社区秩序
          <text style="font-size: 38rpx">维护者</text>
        </text>
      </view>
      <!-- <text class="text-class extra-text-class" style="font-size: 28rpx"
        >当前：</text
      > -->
      <view class="text-class label-class" v-if="vuex_user.adminType == '学生管理员'">学生管理员</view>
      <view class="text-class label-class" v-else-if="vuex_user.adminType == '超级管理员'">超级管理员</view>
      <view class="text-class label-extra-class" v-else>退休员工</view>
      <u-button type="primary" class="btn-class" :custom-style="btnStyle" @click="toTakeAction" ripple>
        {{ vuex_user.adminType == '请登录' ? '登录' : '退出' }}
      </u-button>
    </view>
    <view class="flow-holder">
      <view
        class="set-class"
        :style="{
          top: vuex_user.adminType === '超级管理员' ? toTop(290) : toTop(420),
          height: vuex_user.adminType === '超级管理员' ? setClassHeight(310) : setClassHeight(440),
        }"
      >
        <u-cell-group>
          <u-cell-item
            @click="toMakeIt(1)"
            icon="/static/user.png"
            :icon-style="iconStyle"
            title=" 用户管理"
            label=" 在这里查询用户、禁言或封禁违反社区管理条例的用户"
          ></u-cell-item>
          <u-cell-item
            @click="toMakeIt(2)"
            icon="/static/content.png"
            :icon-style="iconStyle"
            title=" 内容管理"
            label=" 在这里处理被用户举报的帖子/评论，阅读上下文从而决定是否对内容进行删除"
          ></u-cell-item>
          <u-cell-item
            @click="toMakeIt(3)"
            icon="/static/partitions.png"
            :icon-style="iconStyleLarger"
            title=" 分区管理"
            label="管理校务专区部门及其他分区帖子标签"
          ></u-cell-item>
          <u-cell-item
            @click="toMakeIt(4)"
            v-if="vuex_user.adminType === '超级管理员'"
            icon="/static/sensitive.svg"
            :icon-style="iconStyleLarger"
            title=" 敏感词条"
            label=" 追加敏感词，营造和谐友善的社区氛围"
          ></u-cell-item>
          <u-cell-item
            @click="toMakeIt(5)"
            v-if="vuex_user.adminType === '超级管理员'"
            icon="/static/notice.png"
            :icon-style="iconStyleLarger"
            title=" 公告管理"
            label=" 在这里发布公告，将重要信息准确及时地传达给社区用户"
          ></u-cell-item>
          <u-cell-item
            @click="toMakeIt(6)"
            icon="/static/diary.png"
            :icon-style="iconStyleSmaller"
            title=" 操作日志"
            label=" 在这里记录着每一位社区秩序维护者的工作记录"
          ></u-cell-item>
          <u-cell-item
            @click="toMakeIt(7)"
            v-if="vuex_user.adminType === '超级管理员'"
            icon="/static/superAdmin.png"
            :icon-style="iconStyle"
            title=" 超级管理"
            label=" 超级管理员可以在这里注册、删除管理员，修改管理员信息或为其分配权限"
          ></u-cell-item>
          <u-cell-item
            @click="toMakeIt(8)"
            v-if="vuex_user.adminType === '超级管理员'"
            icon="/static/games.svg"
            :icon-style="iconStyle"
            title="游戏管理"
            label=" 超级管理员可以在这里修改游戏列表"
          ></u-cell-item>
          <u-cell-item
            @click="toMakeIt(9)"
            icon="/static/info.svg"
            :icon-style="iconStyleLarger"
            title=" 个人信息"
            label=" 在这里查看、修改个人信息"
          ></u-cell-item>
        </u-cell-group>
      </view>
    </view>

    <u-toast ref="uToast" />
  </view>
</template>

<script>
import navbar from '../../components/navbar/navbar.vue';
export default {
  components: { navbar },
  data() {
    return {
      pagesItem: ['index', 'user', 'content', 'tag', 'sensitive', 'notice', 'logPage', 'superAdmin', 'games', 'info'],
      helloWords: '',
      btnStyle: {
        position: 'absolute',
        right: '20rpx',
        top: '100rpx',
        width: '150rpx',
        height: '50rpx',
        backgroundColor: '#70b0db !important',
      },
      iconStyle: {
        transform: 'translateX(-10rpx)',
      },
      iconStyleLarger: {
        transform: 'translateX(-10rpx) scale(1.1)',
      },
      iconStyleSmaller: {
        transform: 'translateX(-10rpx) scale(0.9)',
      },
    };
  },
  onLoad() {
    let d = new Date().getHours();
    if (d >= 0 && d < 6) this.helloWords = '凌晨好！';
    else if (d >= 6 && d < 8) this.helloWords = '早上好！';
    else if (d >= 8 && d < 11) this.helloWords = '上午好！';
    else if (d >= 11 && d < 13) this.helloWords = '中午好！';
    else if (d >= 13 && d < 17) this.helloWords = '下午好！';
    else if (d >= 17 && d < 19) this.helloWords = '傍晚好！';
    else if (d >= 19 && d < 24) this.helloWords = '晚上好！';
  },
  computed: {
    btnInfo() {
      return this.$store.state.menuButtonInfo;
    },
    toTop() {
      return function(amount) {
        return `calc(${this.btnInfo.top}px + ${amount}rpx)`;
      };
    },
    setClassHeight() {
      return function(amount) {
        return `calc(100vh - ${this.btnInfo.top}px - ${amount}rpx)`;
      };
    },
  },
  methods: {
    toTakeAction() {
      if (this.vuex_user.adminType == '请登录')
        uni.navigateTo({
          url: '/pages/login/index',
        });
      else {
        this.$u.vuex('vuex_user.adminType', '请登录');
        this.$u.vuex('vuex_user.adminName', '请登录');
        this.$u.vuex('vuex_token', '');
        this.$refs.uToast.show({
          title: '已退出登录',
          type: 'success',
          position: 'top',
        });
      }
    },
    toMakeIt(index) {
      if (this.vuex_user.adminType != '请登录') {
        uni.navigateTo({
          url: '/pages/' + this.pagesItem[index] + '/index',
        });
      } else {
        this.$refs.uToast.show({
          title: '请先登录再打卡上班哦^o^',
          type: 'warning',
          position: 'top',
        });
      }
    },
  },
};
</script>

<style scoped>
.user-class {
  width: 640rpx;
  height: 180rpx;
  transform: translateX(-50%);
  background-color: #dbe6f0;
  border: 1px solid #c8d9ea;
  border-radius: 18rpx;
  padding: 24rpx 20rpx;
  position: absolute;
  left: 50%;
}
.flow-holder ::-webkit-scrollbar {
  width: 0;
  height: 0;
  background-color: transparent;
}
.set-class {
  width: 640rpx;
  padding: 0 0 30rpx;
  overflow: auto;
  position: absolute;
  left: calc(50% - 320rpx);
}
.text-class {
  color: #363c54;
  font-family: Roboto, sans-serif;
  font-weight: 700;
  font-size: 48rpx;
}
.header-text {
  margin-left: 15px;
}
.extra-text-class {
  position: absolute;
  left: 400rpx;
  top: 44rpx;
}
.label-class {
  position: absolute;
  right: 20rpx;
  top: 34rpx;
  width: 180rpx;
  height: 50rpx;
  line-height: 50rpx;
  background-color: #4dc86f;
  border-radius: 10rpx;
  font-size: 26rpx;
  font-weight: 400;
  text-align: center;
  color: white;
}
.label-extra-class {
  position: absolute;
  right: 20rpx;
  top: 34rpx;
  width: 180rpx;
  height: 50rpx;
  line-height: 50rpx;
  background-color: #fcbd71;
  border-radius: 10rpx;
  font-size: 26rpx;
  font-weight: 400;
  text-align: center;
  color: white;
}
#mainSvg {
  position: absolute;
  top: 0;
  left: 50%;
  transform: translateX(-50%) translateY(-25%);
  height: 120rpx;
}
</style>
