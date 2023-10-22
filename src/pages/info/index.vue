<template>
  <view>
    <navbar :index="9"></navbar>
    <view id="mainContainer" :style="{ paddingTop: toTop }">
      <view id="infoBoard">
        <view id="picHolder">
          <view class="pic-border">
            <image src="../../static/personal_info.svg" id="pic" />
          </view>
        </view>
        <view id="infoHolder">
          <view class="item">账号：{{ info.nickname }}</view>
          <view class="item">身份：{{ info.is_super ? '超级管理员' : info.is_stu_admin ? '学生管理员' : '' }}</view>
        </view>
      </view>
      <view id="operate">
        <view class="operate-item" @click="newPhone = true">
          修改绑定手机号
          <view class="symbol">></view>
        </view>
        <view class="operate-item" @click="newPass = true">
          修改密码
          <view class="symbol">></view>
        </view>
      </view>
    </view>
    <u-popup v-model="newPhone" mode="center" border-radius="20">
      <view class="popup-phone-holder">
        <view class="item-text">新的电话</view>
        <input type="text" v-model="new_phone_number" />
        <view class="btn-holder">
          <u-button :custom-style="btnStyle" ripple @click="changePhone" :loading="cpnLoading">
            {{ cpnLoading ? '修改中' : '确认' }}
          </u-button>
        </view>
      </view>
    </u-popup>
    <u-popup v-model="newPass" mode="center" border-radius="20">
      <view class="popup-pass-holder">
        <view class="item-text">请输入原密码</view>
        <input type="text" v-model="raw_password" />
        <view class="item-text">请输入新的密码</view>
        <input type="text" v-model="new_password" />
        <view class="btn-holder">
          <u-button :custom-style="btnStyle" ripple @click="changePass" :loading="cpwLoading">
            {{ cpwLoading ? '修改中' : '确认' }}
          </u-button>
        </view>
      </view>
    </u-popup>
    <u-toast ref="uToast" />
  </view>
</template>

<script>
import { changeSelfPass, changeSelfPhone, getSelf } from '../../api';
import navbar from '../../components/navbar/navbar.vue';
export default {
  components: { navbar },
  data() {
    return {
      info: {
        id: 0,
        number: '',
        phone_number: '',
        is_super: false,
        is_sch_admin: false,
        is_stu_admin: false,
        is_user: false,
        active: 0,
        created_at: '',
        department: {
          id: 0,
          name: '',
          introduction: '',
        },
      },
      newPhone: false,
      newPass: false,
      new_phone_number: '',
      raw_password: '',
      new_password: '',
      cpnLoading: false,
      cpwLoading: false,
      btnStyle: {
        width: '180rpx',
        height: '70rpx',
        color: 'white',
        backgroundColor: '#363c54',
      },
    };
  },
  onLoad() {
    if (this.vuex_user.adminType === '请登录')
      uni.redirectTo({
        url: '/pages/index/index',
      });
    else this.showPersonalInfo();
  },
  computed: {
    toTop() {
      let info = this.$store.state.menuButtonInfo;
      return `calc(${info.top}px + 90rpx)`;
    },
  },
  methods: {
    showPersonalInfo() {
      getSelf().then(res => {
        if (res.code === 200) {
          this.info = res.data.user_info;
        } else if (res.code === 20001) this.relog();
        else this.tip('获取个人信息失败！', 'warning');
      });
    },
    changePhone() {
      this.cpnLoading = true;
      if (this.phoneValidation(this.new_phone_number)) {
        changeSelfPhone({
          new_phone: this.new_phone_number,
        }).then(res => {
          if (res.code === 200) {
            this.tip('修改成功！', 'success');
            this.newPhone = false;
            this.new_phone_number = '';
          } else if (res.code === 20001) this.relog();
          else this.tip('修改手机号失败！', 'warning');
        });
      } else this.tip('不是有效的手机号码！', 'warning');
      this.cpnLoading = false;
    },
    changePass() {
      this.cpnLoading = true;
      if (this.raw_password.length || this.new_password.length) {
        if (this.raw_password !== this.new_password) {
          changeSelfPass({
            new_password: this.$md5(this.new_password),
            raw_password: this.$md5(this.raw_password),
          }).then(res => {
            if (res.code === 200) {
              this.tip('修改成功！', 'success');
              this.newPass = false;
              this.new_password = '';
              this.raw_password = '';
            } else if (res.code === 20001) this.relog();
            else if (res.code === 40001) this.tip('原密码错误！', 'warning');
            else this.tip('修改密码失败！', 'warning');
          });
        } else this.tip('密码未发生改变！', 'info');
      } else this.tip('请填写原密码、新密码！', 'warning');
      this.cpnLoading = false;
    },
    phoneValidation(phone_number) {
      var reg = /^1(3|4|5|6|7|8|9)\d{9}$/;
      return reg.test(phone_number);
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
  position: fixed;
  top: 0;
  left: 0;
  #infoBoard {
    position: relative;
    top: 100rpx;
    width: calc(100% - 80rpx);
    height: 300rpx;
    margin-left: 40rpx;
    padding: 0 25rpx;
    background-color: white;
    border-radius: 30rpx;
    display: flex;
    align-items: center;
    #picHolder {
      flex: 3;
      flex-shrink: 0;
      height: 250rpx;
      .pic-border {
        width: 250rpx;
        height: 250rpx;
        margin: auto;
        border: 2px solid #f5f5f5;
        border-radius: 50%;
        overflow: hidden;
      }
      #pic {
        width: 200rpx;
        height: 200rpx;
        margin: 25rpx;
      }
    }
    #infoHolder {
      flex: 4;
      height: 200rpx;
      padding-left: 35rpx;
      display: flex;
      flex-direction: column;
      justify-content: space-evenly;
      .item {
        font-size: 30rpx;
        font-weight: bold;
      }
    }
  }
  #operate {
    position: relative;
    top: 100rpx;
    width: calc(100% - 80rpx);
    margin-left: 40rpx;
    margin-top: 40rpx;
    .operate-item {
      width: 100%;
      padding: 30rpx 50rpx;
      font-size: 30rpx;
      background-color: white;
      border-radius: 30rpx;
      margin-bottom: 20rpx;
      display: flex;
      .symbol {
        flex: 1;
        font-weight: bold;
        text-align: right;
      }
    }
  }
}
.popup-phone-holder {
  width: 500rpx;
  height: 250rpx;
  padding: 20rpx;
  overflow: hidden;
}
.popup-pass-holder {
  width: 500rpx;
  height: 390rpx;
  padding: 20rpx;
  overflow: hidden;
}
input {
  font-size: 26rpx;
  height: 70rpx;
  padding: 0 20rpx;
  border: 1px solid rgb(202, 203, 206);
  border-radius: 15rpx;
  text-align: center;
  margin-bottom: 20rpx;
}
.btn-holder {
  width: 100%;
  display: flex;
  justify-content: center;
  height: 70rpx;
}
.item-text {
  height: 50rpx;
  line-height: 50rpx;
  text-align: center;
  font-size: 32rpx;
}
</style>
