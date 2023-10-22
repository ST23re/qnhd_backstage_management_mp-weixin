<template>
  <view style="height: 100vh; overflow: hidden; background-color: #f5f5f5;">
    <navbar :index="1"></navbar>
    <view>
      <view id="loadingStuff" v-show="!renderFinished">
        <image src="../../static/loading.png" mode="aspectFit" width="250" />
      </view>
      <view :style="{ marginTop: toTop }">
        <view id="inputHolder">
          <view style="flex: 1;">
            <input
              type="text"
              v-model="value_1"
              :class="['inputStyle', in_search ? 'input-focus' : '']"
              @focus="in_search = true"
              @blur="in_search = false"
              placeholder="搜索 uid 操作特定用户"
              @confirm="newSearch"
            />
          </view>
          <view style="display:flex;justify-content:center;width:100rpx;">
            <u-button :custom-style="btnOne" ripple @click="newSearch" :loading="searchLoading">
              <u-icon :name="require('../../static/search.svg')" size="36"></u-icon>
            </u-button>
          </view>
        </view>
        <view id="filterHolder">
          <u-radio-group
            class="radio-class"
            :size="36"
            v-model="filterMode"
            :disabled="returnUniqueUser"
            @change="newSearch"
          >
            <u-radio :name="0" :label-size="25">全部</u-radio>
            <u-radio :name="1" :label-size="25">禁言</u-radio>
            <u-radio :name="2" :label-size="25">封禁</u-radio>
          </u-radio-group>
          <view class="sum">共计：{{ total }} 位</view>
        </view>
      </view>

      <view class="user-class">
        <scroll-view
          class="swipe-class"
          :style="{ maxHeight: usersHeight }"
          scroll-y="true"
          @scrolltolower="reachBottom"
        >
          <view :class="['fade-in', renderFinished ? 'show' : 'hide']">
            <u-swipe-action
              :index="index"
              v-for="(item, index) in userList"
              :key="item.id"
              :options="options[item.status]"
              btn-width="150"
              @click="(index, action) => click(index, action, item)"
              @open="open"
              :show="item.show"
            >
              <view class="item">
                <image mode="aspectFill" :src="'../../static/status_' + item.status + '.svg'" />
                <view class="title-wrap">
                  <!-- <view class="title u-line-2">
                  <view class="sub-text" v-if="vuex_user.adminType === '超级管理员'">学号：</view>
                  {{ item.nickname }}
                </view> -->
                  <view class="title" style="display: flex; align-items: center;">
                    <view class="sub-text">昵称：</view>
                    <text style="z-index: 100 !important">{{ item.nickname }}</text>
                    <view style="display:flex;justify-content:center;width:50rpx;">
                      <u-button :custom-style="btnReset" ripple @click="confirmResetName(item.id)">
                        <u-icon :name="require('../../static/reset.svg')" size="30"></u-icon>
                      </u-button>
                    </view>
                  </view>
                  <view :class="['title', 'title-hide-detile']">
                    <view class="sub-text">状态：</view>
                    {{
                      status[item.status] +
                        (item.status == 1
                          ? /* ? Math.floor(item.remain / 86400) + ' 天 ' + Math.ceil((item.remain % 86400) / 3600) + ' 时' */
                            calculateTime(item.blocked_start, item.blocked_over)
                          : '')
                    }}
                  </view>
                </view>
                <view
                  style="
                display: flex;
                flex-direction: column;
                justify-content: center;
              "
                >
                  <u-icon name="arrow-left-double" color="#363c54"></u-icon>
                </view>
              </view>
            </u-swipe-action>
          </view>
        </scroll-view>
        <view id="getMoreTip">{{ getMoreTip }}</view>
      </view>
      <u-popup v-model="infoShow" mode="center" border-radius="20">
        <view style="width: 510rpx; padding: 30rpx 30rpx 30rpx 25rpx; transform: scale(1)">
          <view class="title modify">
            <view class="sub-text">uid：</view>
            {{ theUser.id }}
          </view>
          <!-- <view class="title u-line-2" v-if="vuex_user.adminType === '超级管理员'">学号：{{ theUser.nickname }}</view>
          <view class="title u-line-2" v-if="vuex_user.adminType === '超级管理员'">
            <view class="sub-text">电话：</view>
            {{ theUser.phone_number.trim().length ? theUser.phone_number : '暂无' }}
          </view>
          <view class="title u-line-2"
          >密码：<text class="link-class" @click="changeShow = true"
            >修改密码</text
          ></view
        > -->
          <view class="title modify">
            <view class="sub-text">剩余：</view>
            {{
              theUser.status == 1
                ? Math.floor(theUser.remain / 86400) +
                  ' 天 ' +
                  Math.floor((theUser.remain % 86400) / 3600) +
                  ' 时 ' +
                  Math.ceil((theUser.remain % 3600) / 60) +
                  ' 分'
                : ''
            }}
          </view>
          <view class="title u-line-2  modify" v-show="userList.length != 0 && theUser.status == 1">
            <view class="sub-text">始于：</view>
            {{
              theUser.blocked_start.slice(0, 4) +
                '年' +
                theUser.blocked_start.slice(5, 7) +
                '月' +
                theUser.blocked_start.slice(8, 10) +
                '日 ' +
                theUser.blocked_start.slice(11, 19)
            }}
          </view>
          <view class="title u-line-2 modify" v-show="userList.length != 0 && theUser.status == 1">
            <view class="sub-text">终于：</view>
            {{
              theUser.blocked_over.slice(0, 4) +
                '年' +
                theUser.blocked_over.slice(5, 7) +
                '月' +
                theUser.blocked_over.slice(8, 10) +
                '日 ' +
                theUser.blocked_over.slice(11, 19)
            }}
          </view>
          <view class="open-box-holder" v-if="vuex_user.adminType === '超级管理员'">
            <u-button ripple @click="revealTruth" :custom-style="revealStyle">开盒</u-button>
          </view>
        </view>
      </u-popup>
      <u-popup v-model="muteShow" mode="center" border-radius="20">
        <view style="padding: 15rpx 20rpx 10rpx">
          <view class="title" style="text-align: center; font-size: 34rpx">用户禁言</view>
          <view class="title u-line-2" style="text-align: center; font-size: 26rpx; margin: 20rpx 20rpx">
            请选择禁言的天数
          </view>
          <view>
            <view class="radio-group-holder">
              <u-radio-group v-model="muteValue" size="36">
                <u-radio :name="1" label-size="25">1 天</u-radio>
                <u-radio :name="3" label-size="25">3 天</u-radio>
                <u-radio :name="7" label-size="25">7 天</u-radio>
              </u-radio-group>
            </view>
            <view class="radio-group-holder">
              <u-radio-group v-model="muteValue" size="36">
                <u-radio :name="14" label-size="25">14 天</u-radio>
                <u-radio :name="30" label-size="25">30 天</u-radio>
              </u-radio-group>
            </view>
          </view>
          <view class="title u-line-2" style="text-align: center; font-size: 25rpx; margin: 20rpx 20rpx">
            此用户历史被禁言：{{ muteTimes }} 次
          </view>
          <view style="width: 420rpx;margin: 0 auto 20rpx;">
            <u-input
              type="text"
              v-model="actionReason"
              :custom-style="reason_inputStyle"
              height="60"
              :clearable="false"
              placeholder="请填写禁言原因"
            />
          </view>
          <view style="display: flex; justify-content: center">
            <u-button size="medium" :custom-style="defaultStyle" ripple @click="sureMute" :loading="muteLoading">
              {{ logs }}
            </u-button>
          </view>
        </view>
      </u-popup>
      <u-popup v-model="fillBanReason" mode="center" border-radius="20">
        <view style="padding: 15rpx 20rpx 10rpx">
          <view style="width: 420rpx;margin: 0 auto 20rpx;">
            <u-input
              type="text"
              v-model="actionReason"
              :custom-style="reason_inputStyle"
              height="80"
              :clearable="false"
              placeholder="请填写封禁原因"
            />
          </view>
          <view style="display: flex; justify-content: center">
            <u-button size="medium" :custom-style="defaultStyle" ripple @click="checkBanReason">确认</u-button>
          </view>
        </view>
      </u-popup>
      <u-popup v-model="openBox" mode="center" border-radius="20">
        <view style="width: 510rpx; padding: 30rpx 35rpx;">
          <view class="title modify">真实姓名：{{ truth.realname }}</view>
          <view class="title modify">学号：{{ truth.userNumber }}</view>
          <view class="title modify">性别：{{ truth.gender }}</view>
          <view class="title modify">校区：{{ truth.campus }}</view>
          <view class="title modify">院系：{{ truth.department }}</view>
          <view class="title modify">专业：{{ truth.major }}</view>
          <view class="title modify">学历：{{ truth.stuType }}</view>
          <view class="title modify">电话：{{ truth.telephone.trim().length ? truth.telephone : '暂无' }}</view>
          <view class="title modify">邮箱：{{ truth.email }}</view>
          <view class="title modify">twt账号：{{ truth.nickname }}</view>
          <!-- <view class="title modify">身份：{{ truth.role }}</view> -->
        </view>
      </u-popup>
      <u-modal
        v-model="sureShow"
        :content="actionText"
        title="操作确认"
        show-cancel-button
        :mask-close-able="true"
        @confirm="beSure"
      ></u-modal>
      <u-toast ref="uToast" />
    </view>
  </view>
</template>

<script>
import navbar from '../../components/navbar/navbar.vue';
import {
  banUser,
  deleteBlockedUser,
  blockUser,
  getUser,
  getBlockedUser,
  // changeUserPassword,
  getSpecificUser,
  reveal,
  resetNickname,
} from '../../api/index';
export default {
  components: { navbar },
  data() {
    return {
      // searchByUid: false,
      muteValue: 0,
      muteLoading: false,
      muteShow: false,
      sureShow: false,
      infoShow: false,
      changeShow: false,
      muteTimes: 0,
      newPass: '',
      value_1: '',
      input_1: false,
      filterMode: 0,
      returnUniqueUser: false,
      in_search: false,
      searchLoading: false,
      changeLoading: false,
      actionText: '确认封禁该用户（此操作不可逆）？',
      log: '确认',
      logs: '确认',
      btnStyle: {
        width: '110rpx',
        height: '70rpx',
        marginRight: '0',
        fontSize: '32rpx',
        color: 'white',
        backgroundColor: '#363c54',
      },
      status: ['正常', '禁言 ', '封禁'],
      userList: [],
      theUser: {
        id: 0,
        nickname: '',
        phone_number: '',
        status: 0,
        remain: 0,
        blocked_start: '',
        blocked_over: '',
      },
      pageForUserList: 1,
      getMoreTip: '',
      btnOne: {
        height: '70rpx',
        backgroundColor: 'white',
        color: '#f5f5f5',
      },
      revealStyle: {
        backgroundColor: '#363c54',
        color: 'white',
        height: '50rpx',
        lineHeight: '50rpx',
        fontSize: '26rpx',
      },
      defaultStyle: {
        color: 'white',
        fontSize: '26rpx',
        backgroundColor: '#363c54',
      },
      btnReset: {
        height: '40rpx',
        marginLeft: '40rpx',
      },
      resetUid: 0,
      // modeStyle: {
      //   height: '70rpx',
      //   width: '90rpx',
      //   fontSize: '26rpx',
      //   color: 'white',
      //   backgroundColor: '#363c54',
      //   borderRadius: '15rpx',
      //   position: 'fixed',
      //   top: '0',
      //   left: '0',
      //   zIndex: '2',
      //   display: 'flex',
      //   justifyContent: 'center',
      //   alignItems: 'center',
      // },
      reason_inputStyle: {
        border: '1px solid #cacbce',
        borderRadius: '15rpx',
        padding: '0 5rpx',
        textAlign: 'center',
      },
      actionReason: '',
      fillBanReason: false,
      openBox: false,
      truth: {
        telephone: '',
      },
      isReachBottom: false,
      renderFinished: false,
    };
  },
  onLoad() {
    if (this.vuex_user.adminType == '请登录')
      uni.redirectTo({
        url: '/pages/index/index',
      });
    else {
      this.search();
    }
  },
  computed: {
    // userListFiltered() {
    //   if (this.userList.length) {
    //     var arr = [this.checked_0 ? 0 : -1, this.checked_1 ? 1 : -1, this.checked_2 ? 2 : -1];
    //     return this.userList.filter(user => arr.indexOf(user.status) != -1);
    //   } else return [];
    // },
    total() {
      return this.userList.length;
    },
    options() {
      const basic = { transform: 'scale(0.875)', borderRadius: '20rpx', fontSize: '30rpx' };
      const boxStyle = { backgroundColor: '#363c54', ...basic };
      const infoStyle = { backgroundColor: '#61affe', ...basic };
      const blockStyle = { backgroundColor: '#ff9900', ...basic };
      const banStyle = { backgroundColor: '#fa3534', ...basic };
      const freeStyle = { backgroundColor: '#19be6b', ...basic };
      const deadStyle = { backgroundColor: '#cecece', ...basic };
      var normal_for_super = [
        { text: '开盒', style: boxStyle },
        { text: '禁言', style: blockStyle },
        { text: '封禁', style: banStyle },
      ];
      var normal_for_stuadmin = [{ text: '禁言', style: blockStyle }];
      var blocked = [
        { text: '信息', style: infoStyle },
        { text: '解禁', style: freeStyle },
      ];
      var banned = [{ text: '无操作', style: deadStyle }];
      if (this.vuex_user.adminType === '超级管理员') return [normal_for_super, blocked, banned];
      else return [normal_for_stuadmin, blocked, banned];
    },
    btnInfo() {
      return this.$store.state.menuButtonInfo;
    },
    toTop() {
      return `calc(${this.btnInfo.top}px + 80rpx)`;
    },
    usersHeight() {
      return `calc(100vh - ${this.btnInfo.top}px - 306rpx)`;
    },
  },
  watch: {
    muteShow: {
      handler(newValue, oldValue) {
        if (!newValue) this.actionReason = '';
        else return;
      },
    },
    fillBanReason: {
      handler(newValue, oldValue) {
        if (!newValue) this.actionReason = '';
        else return;
      },
    },
  },
  methods: {
    reachBottom() {
      if (this.isReachBottom) return;
      this.isReachBottom = true;
      if (this.userList.length === this.pageForUserList * 50) {
        this.pageForUserList++;
        this.search();
      } else this.getMoreTip = '~ 已加载全部 ~';
    },
    checkBanReason() {
      if (!this.actionReason.length) {
        this.$refs.uToast.show({
          title: '封禁原因为必填!',
          type: 'warning',
          position: 'top',
        });
        return;
      }
      this.actionText = '确认封禁该用户（此操作不可逆）？';
      this.sureShow = true;
    },
    confirmResetName(uid) {
      this.resetUid = uid;
      this.actionText = '确认重置该用户昵称？';
      this.sureShow = true;
    },
    beSure() {
      if (this.actionText == '确认封禁该用户（此操作不可逆）？') {
        banUser({
          uid: this.theUser.id,
          reason: this.actionReason,
        }).then(res => {
          if (res.code == 200) {
            this.$refs.uToast.show({
              title: '封禁用户成功！',
              type: 'success',
              position: 'top',
            });
            this.theUser.status = 2;
            this.returnDefault('refresh');
          } else if (res.code == 20001) {
            this.relog();
          } else {
            this.$refs.uToast.show({
              title: '封禁用户失败！',
              type: 'warning',
              position: 'top',
            });
          }
        });
      } else if (this.actionText == '确认解禁该用户吗？') {
        deleteBlockedUser({ uid: this.theUser.id }).then(res => {
          if (res.code == 200) {
            this.$refs.uToast.show({
              title: '解除用户禁言成功！',
              type: 'success',
              position: 'top',
            });
            this.theUser.status = 0;
            this.returnDefault('refresh');
          } else if (res.code == 20001) {
            this.relog();
          } else {
            this.$refs.uToast.show({
              title: '解除用户禁言失败！',
              type: 'warning',
              position: 'top',
            });
          }
        });
      } else if (this.actionText == '确认重置该用户昵称？') {
        resetNickname({
          uid: this.resetUid,
        }).then(res => {
          if (res.code === 200) {
            this.$refs.uToast.show({
              title: '昵称重置成功！',
              type: 'success',
              position: 'top',
            });
            this.sureShow = false;
            this.returnDefault('refresh');
          } else if (res.code == 20001) {
            this.relog();
          } else {
            this.$refs.uToast.show({
              title: '昵称重置失败！',
              type: 'warning',
              position: 'top',
            });
            this.sureShow = false;
          }
        });
      }
    },
    sureMute() {
      if (this.muteValue === 0) {
        this.$refs.uToast.show({
          title: '未选择禁言天数！',
          type: 'warning',
          position: 'top',
        });
        return;
      }
      if (!this.actionReason.length) {
        this.$refs.uToast.show({
          title: '禁言原因为必填！',
          type: 'warning',
          position: 'top',
        });
        return;
      }
      this.muteLoading = true;
      this.logs = '禁言中';
      blockUser({
        uid: this.theUser.id,
        last: this.muteValue,
        reason: this.actionReason,
      }).then(res => {
        if (res.code == 200) {
          this.$refs.uToast.show({
            title: '禁言用户成功（' + this.muteValue + '天）！',
            type: 'success',
            position: 'top',
          });
          this.theUser.status = 1;
          this.theUser.remain = this.muteValue * 86400;
          this.muteShow = false;
          this.returnDefault('refresh');
        } else if (res.code == 20001) {
          this.relog();
        } else {
          this.$refs.uToast.show({
            title: '禁言用户失败！',
            type: 'warning',
            position: 'top',
          });
        }
      });
      this.muteLoading = false;
      this.logs = '确认';
    },
    returnDefault(info) {
      this.value_1 = '';
      this.newSearch(info);
    },
    newSearch(info) {
      this.searchLoading = true;

      var valid = /^\+?[0-9][0-9]*$/.test(this.value_1); //正整数,也0开头
      if (valid || this.value_1.length == 0) {
        this.userList = [];
        this.pageForUserList = 1;
        this.getMoreTip = '';
      }
      this.search(valid, info);
    },
    search(isValidUid, info) {
      if (isValidUid) {
        this.filterMode = 0;
        this.returnUniqueUser = true;
        getSpecificUser({
          uid: parseInt(this.value_1), // string '012' => 12; num 012 => 10
        }).then(res => {
          if (res.code === 200) {
            var theOne = res.data.user;
            this.userList = [
              {
                id: theOne.id,
                nickname: theOne.nickname,
                phone_number: theOne.phone_number,
                status: theOne.is_blocked ? 1 : theOne.is_banned ? 2 : 0,
                remain: theOne.blocked_remain,
                blocked_start: theOne.bloced_start,
                blocked_over: theOne.blocked_over,
                show: false,
              },
            ];
            this.$refs.uToast.show({
              title: '获取用户成功！',
              type: 'success',
              position: 'top',
            });
          } else if (res.code === 20001) this.relog();
          else {
            this.$refs.uToast.show({
              title: '获取用户失败！',
              type: 'warning',
              position: 'top',
            });
          }
        });
        this.searchLoading = false;
      } else if (this.value_1.length) {
        this.$refs.uToast.show({
          title: '请检查uid格式',
          type: 'warning',
          position: 'top',
        });
        this.searchLoading = false;
      } else {
        this.returnUniqueUser = false;
        this.renderFinished = false;
        setTimeout(() => {
          getUser({
            user: '',
            page: this.pageForUserList,
            page_size: 50,
            is_blocked: this.filterMode === 1 ? 1 : '',
            is_banned: this.filterMode === 2 ? 1 : '',
          }).then(res => {
            if (res.code == 200) {
              // console.log(res);
              res.data.list.forEach(user => {
                this.userList.push({
                  id: user.id,
                  nickname: user.nickname,
                  phone_number: user.phone_number,
                  status: user.is_blocked ? 1 : user.is_banned ? 2 : 0,
                  remain: user.blocked_remain,
                  blocked_start: user.bloced_start,
                  blocked_over: user.blocked_over,
                  show: false,
                });
              });
              if (info !== 'refresh')
                this.$refs.uToast.show({
                  title: '获取用户列表成功！',
                  type: 'success',
                  position: 'top',
                });
              setTimeout(() => {
                this.renderFinished = true;
              }, 1000);
            } else if (res.code == 20001) {
              this.relog();
            } else {
              this.$refs.uToast.show({
                title: '获取用户列表失败！',
                type: 'warning',
                position: 'top',
              });
              this.renderFinished = true;
            }
          });
        }, 500);

        this.isReachBottom = false;
        this.searchLoading = false;
      }
    },
    getRealIndex(item) {
      return this.userList.indexOf(item);
    },
    click(index, action, item) {
      this.theUser = JSON.parse(JSON.stringify(item));
      if (item.status != 2) {
        //不是封禁才有操作
        if (this.vuex_user.adminType === '超级管理员' && item.status == 0 && action == 0) {
          //超管常态下按钮1直接开盒
          this.revealTruth();
          return;
        }
        if (action == 0 && item.status == 1) {
          //禁言时所有管理员按钮1都是信息
          this.infoShow = true;
        } else if (
          item.status == 0 &&
          ((this.vuex_user.adminType === '超级管理员' && action == 1) ||
            (this.vuex_user.adminType === '学生管理员' && action == 0))
        ) {
          // 正常转禁言
          getBlockedUser({ uid: item.id }).then(res => {
            if (res.code == 200) {
              this.muteTimes = res.data.total;
            } else if (res.code == 20001) {
              this.relog();
            } else {
              this.$refs.uToast.show({
                title: '获取用户历史被禁言次数失败！',
                type: 'warning',
                position: 'top',
              });
            }
          });
          this.muteValue = 0;
          this.muteShow = true;
        } else {
          if (item.status == 1) {
            // 禁言转正常
            this.actionText = '确认解禁该用户吗？';
            this.sureShow = true;
          } else this.fillBanReason = true; // 正常转封禁
        }
      }
    },
    open(index) {
      this.userList[index].show = true;
      this.userList.map((val, idx) => {
        if (index != idx) this.userList[idx].show = false;
      });
    },
    revealTruth() {
      reveal({
        uid: this.theUser.id,
      }).then(res => {
        if (res.code === 200) {
          console.log(res.data.detail);
          this.truth = res.data.detail;
          this.openBox = true;
        }
      });
    },
    calculateTime(start, over) {
      var st = new Date(start),
        ov = new Date(over);
      var gap = new Date(ov.getTime() - st.getTime());
      return gap.getDate() - 1 + ' 天';
    },
    relog() {
      this.$refs.uToast.show({
        title: '登录过期，请重新登录',
        type: 'warning',
        position: 'top',
      });
      this.$u.vuex('vuex_user.adminType', '请登录');
      this.$u.vuex('vuex_user.adminName', '请登录');
      this.$u.vuex('vuex_token', '');
      setTimeout(() => {
        uni.redirectTo({
          url: '/pages/login/index',
        });
      }, 1000);
    },
  },
};
</script>

<style scoped lang="scss">
#inputHolder {
  background-color: white;
  margin: 0 30rpx;
  padding: 8rpx 20rpx;
  border-radius: 30rpx;
  display: flex;
  justify-content: space-between;
}
.inputStyle {
  height: 70rpx;
  outline: none;
  text-align: center;
  font-size: 26rpx;
  transition: 0.3s ease-in;
  border-radius: 3px;
  color: #363c54;
  border-radius: 20rpx;
  margin: 0 auto;
}
.input-focus {
  background-color: rgb(255, 255, 255);
}
#filterHolder {
  height: 80rpx;
  margin: 20rpx 30rpx;
  border-radius: 30rpx;
  display: flex;
  justify-content: space-between;
  align-items: center;
  .radio-class {
    padding: 0 15rpx 0 30rpx;
    height: 80rpx;
    display: flex;
    align-items: center;
    justify-content: space-evenly;
    background-color: white;
    border-radius: 30rpx;
  }
  .sum {
    height: 80rpx;
    line-height: 80rpx;
    padding: 0 25rpx;
    font-size: 24rpx;
    color: #808080;
    border-radius: 30rpx;
  }
}

.user-class {
  color: #363c54;
  font-family: Roboto, sans-serif;
  font-size: 36rpx;
  padding: 0 30rpx;
}
.swipe-class {
  overflow: auto;
  border-radius: 30rpx;
  image {
    width: 100rpx;
    flex: 0 1 100rpx;
    height: 100rpx;
    margin-right: 20rpx;
    padding-right: 5rpx;
  }
}

.item {
  display: flex;
  padding: 5rpx 20rpx;
  margin: 10rpx 0;
  background-color: white;
}
.title {
  text-align: left;
  font-size: 26rpx;
  color: #363c54;
}
.title-wrap {
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: space-evenly;
}
.title-hide-detile {
  max-width: 400rpx;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.sub-text {
  width: 90rpx;
  display: inline-flex;
  justify-content: center;
  align-items: center;
}
.link-class {
  color: #007acc;
  cursor: pointer;
}
#btnHolder {
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: center;
}
#getMoreTip {
  width: 100%;
  height: 60rpx;
  font-size: 30rpx;
  line-height: 60rpx;
  text-align: center;
  font-weight: 800;
}
scroll-view ::-webkit-scrollbar {
  width: 0;
  height: 0;
  background-color: transparent;
}
.modify {
  line-height: 50rpx;
}
.open-box-holder {
  width: 100rpx;
  position: fixed;
  top: 30rpx;
  right: 30rpx;
}
.radio-group-holder {
  width: 420rpx;
  margin: 20rpx auto;
  display: flex;
  justify-content: space-around;
}
#loadingStuff {
  position: fixed;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
}
.fade-in {
  transition: all 0.3s;
}
.show {
  opacity: 1;
}
.hide {
  opacity: 0;
}
</style>
