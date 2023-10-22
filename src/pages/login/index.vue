<template>
  <view id="container">
    <view id="bg">
      <u-image
        src="https://p8.itc.cn/q_70/images01/20211013/4be44120bb4843109ba1c9fb019a1fb4.jpeg"
        mode="aspectFill"
        height="100vh"
      >
        <u-loading slot=""></u-loading>
      </u-image>
    </view>
    <view class="text-class text-position-1-class">青年湖底</view>
    <view class="text-class text-position-2-class">管理后台</view>

    <view class="login-mode">
      <view class="item" @click="loginMode = 'twt'">
        天外天账号
      </view>
      <view>|</view>
      <view class="item" @click="loginMode = 'admin'">
        超管账号
      </view>
      <view :class="['underline', loginMode == 'twt' ? 'left' : 'right']"></view>
    </view>

    <input
      type="text"
      :placeholder="loginMode == 'twt' ? '请输入天外天账号' : '请输入昵称或电话'"
      v-model="value_1"
      :class="[input_1 ? 'input-focus' : '']"
      @focus="input_1 = true"
      @blur="input_1 = false"
      @keydown.enter="logIn"
    />
    <input
      type="password"
      placeholder="请输入密码"
      v-model="value_2"
      :class="[input_2 ? 'input-focus' : '']"
      @focus="input_2 = true"
      @blur="input_2 = false"
      @keydown.enter="logIn"
    />
    <view class="login-btn-holder">
      <u-button :custom-style="loginBtnStyle" ripple @click="logIn" :loading="loginLoading">
        {{ log }}
      </u-button>
    </view>
    <!-- <view id="envHolder">
      <view class="env-p" @click="env('Prod')">
        {{ `🛠 生产环境 ${envType === 'Prod' ? '√' : ''}` }}
      </view>
      <view class="env-t" @click="env('Test')">
        {{ `🛠 测试环境 ${envType === 'Test' ? '√' : ''}` }}
      </view>
    </view> -->
    <u-toast ref="uToast" />
  </view>
</template>

<script>
import { refreshToken, loginByAccount, loginThroughTWT } from '../../api/index';
export default {
  data() {
    return {
      log: '登录',
      loginMode: 'twt',
      value_1: '',
      input_1: false,
      value_2: '',
      input_2: false,
      loginLoading: false,
      loginBtnStyle: {
        height: '36px',
        fontSize: '16px',
        color: '#f5f5f5',
        backgroundColor: '#363c54',
        borderRadius: '15rpx !important',
      },
      // envBtnStyle: {
      //   height: '27px',
      //   fontSize: '12px',
      //   color: 'white',
      //   backgroundColor: '#363c54',
      //   borderRadius: '15rpx',
      // },
    };
  },
  onLoad() {
    this.env('Prod'); //解决缓存使环境不正确问题
    if (this.vuex_token != '') {
      this.loginLoading = true;
      this.log = '登录中';
      refreshToken(this.vuex_token).then(res => {
        if (res.code == 200) {
          this.$u.vuex('vuex_token', res.data.token);
          uni.reLaunch({
            url: '/pages/index/index',
          });
        } else {
          this.$refs.uToast.show({
            title: '登录过期，请重新登录！',
            type: 'warning',
            position: 'top',
          });
        }
      });
      this.loginLoading = false;
      this.log = '登录';
    }
  },
  computed: {
    envType() {
      return this.$store.state.envType;
    },
  },
  methods: {
    toGo() {
      this.$refs.uToast.show({
        title: '登录成功',
        type: 'success',
        position: 'top',
      });
      setTimeout(() => {
        uni.reLaunch({
          url: '/pages/index/index',
        });
      }, 1000);
    },
    logIn() {
      this.loginLoading = true;
      this.log = '登录中';
      if (this.value_1 == '' || this.value_2 == '') {
        this.$refs.uToast.show({
          title: '请输入用于登录的账号和密码！',
          type: 'warning',
          position: 'top',
        });
        this.reInit();
      } else {
        if (this.loginMode === 'twt') {
          loginThroughTWT({
            user: this.value_1,
            password: this.value_2,
          })
            .then(res => {
              this.setInfo(res);
            })
            .catch(() => {
              this.reInit();
            });
        } else {
          loginByAccount({
            user: this.value_1,
            password: this.$md5(this.value_2),
          })
            .then(res => {
              this.setInfo(res);
            })
            .catch(() => {
              this.reInit();
            });
        }
      }
    },
    setInfo(res) {
      if (res.code == 200) {
        if (res.data.user.is_super) this.$u.vuex('vuex_user.adminType', '超级管理员');
        else if (res.data.user.is_stu_admin) this.$u.vuex('vuex_user.adminType', '学生管理员');
        else {
          this.$refs.uToast.show({
            title: '账号无权限！',
            type: 'warning',
            position: 'top',
          });
          this.reInit();
          return;
        }
      } else {
        this.$refs.uToast.show({
          title: '账号或密码错误！',
          type: 'warning',
          position: 'top',
        });
        this.reInit();
        return;
      }
      this.reInit();
      this.$u.vuex('vuex_user.adminName', this.value_1);
      this.$u.vuex('vuex_token', res.data.token);
      this.toGo();
    },
    reInit() {
      this.loginLoading = false;
      this.log = '登录';
    },
    env(type) {
      this.$store.commit(`switchTo${type}Env`);
      this.$u.vuex('envType', type);
    },
  },
};
</script>

<style lang="scss" scoped>
#bg {
  width: 100%;
  height: 100vh;
  z-index: -1;
  position: fixed;
}
.text-position-1-class {
  position: relative;
  top: 50%;
  left: 50%;
  transform: translate(-50%, calc(-50% - 250px));
  font-size: 28px;
}
.text-position-2-class {
  position: relative;
  left: 50%;
  top: 50%;
  transform: translate(-50%, calc(-50% - 250px));
  font-size: 17px;
  margin-bottom: 30px;
}
.text-class {
  color: #363c54;
  font-family: Roboto, sans-serif;
  font-weight: 700;
  text-align: center;
}
.login-mode {
  position: relative;
  top: 50%;
  left: 50%;
  transform: translate(-50%, calc(-50% - 250px));
  width: 500rpx;
  display: flex;
  font-size: 15px;
  color: #363c54;
  font-weight: bold;
  .item {
    flex: 1;
    text-align: center;
  }
  .underline {
    position: fixed;
    bottom: -8px;
    width: 36px;
    height: 2px;
    background: #363c54;
    border-radius: 2px;
    transition: all 0.5s;
  }
}
.left {
  left: calc(25% - 18px);
}
.right {
  left: calc(75% - 18px);
}
input {
  position: relative;
  left: 50%;
  top: 50%;
  transform: translate(-50%, calc(-50% - 225px));
  margin: 10px 0;
  width: 450rpx;
  height: 72rpx;
  outline: none;
  text-align: center;
  border: 0px;
  font-size: 30rpx;
  transition: 0.15s ease-in;
  opacity: 0.75;
  background-color: transparent;
  backdrop-filter: blur(8px);
  border-radius: 30rpx;
  border: 2px solid #363c54;
  color: #363c54;
  font-family: Roboto, sans-serif;
}
.input-focus {
  opacity: 1;
  width: 500rpx;
}
#container {
  height: 100vh;
}
.login-btn-holder {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, calc(-50% + 20px));
  width: 108px;
}
#envHolder {
  position: fixed;
  bottom: 30px;
  right: 25px;
  color: white;
  font-weight: bold;
  font-size: 13px;
  text-align: center;
}
.env-p {
  margin: 10px 0;
  width: 93px;
}
.env-t {
  margin: 10px 0;
  width: 93px;
}
</style>
