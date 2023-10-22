<template>
  <view>
    <navbar :index="6"></navbar>
    <view id="noData" v-if="!logs.length && renderFinished">
      <image id="noResultImg" src="../../static/no_result.svg" />
      <div id="tip">No record currently🛠</div>
    </view>
    <view id="mainContainer" :style="{ paddingTop: toTop }">
      <view id="inputHolder">
        <view style="flex: 1;">
          <input
            type="text"
            v-model="val_search"
            :class="['inputStyle', in_search ? 'input-focus' : '']"
            @focus="in_search = true"
            @blur="in_search = false"
            placeholder="uid 搜索相关操作日志"
            @confirm="showLogs"
          />
        </view>
        <view style="display:flex;justify-content:center;width:100rpx;">
          <u-button :custom-style="btnOne" ripple @click="showLogs" :loading="searchLoading">
            <u-icon :name="require('../../static/search.svg')" size="36"></u-icon>
          </u-button>
        </view>
      </view>
      <view style="display: flex; margin: 0 20rpx; justify-content: space-between;">
        <view id="sortHolder">
          <u-button :custom-style="sortButStyle" ripple @click="isAscending = !isAscending">
            <u-icon
              :name="isAscending ? require('../../static/sort_reverse.svg') : require('../../static/sort.svg')"
              size="42"
              :class="{ 'sort-icon': !isAscending }"
            ></u-icon>
            <text style="margin-left: 5rpx;">{{ isAscending ? '按操作时间降序' : '按操作时间升序' }}</text>
          </u-button>
        </view>
        <view id="sum">共计：{{ logsTotal }} 条</view>
      </view>
      <view id="listHolder" :style="{ height: logsHeight }">
        <view v-for="log in logsSorted" :key="logKey(log)" class="card">
          <view v-if="log.expired_at">
            <view class="log-blocked-tip">禁言</view>
            <view>
              对象：uid =>
              <text>{{ ' ' + log.uid }}</text>
            </view>
            <view>
              时长：
              <text>{{ log.last_time }}天</text>
            </view>
            <view class="log-reason">
              <view style="flex-shrink: 0">原因：</view>
              <view>
                <text>{{ log.reason }}</text>
              </view>
            </view>
            <view>操作者：{{ log.doer }}</view>
            <view>操作时间：{{ timeFromNow(log.created_at, 'created') }}</view>
            <view>
              解禁时间：
              <text>{{ timeFromNow(log.expired_at, 'expired') }}</text>
            </view>
          </view>
          <view v-else>
            <view class="log-banned-tip">封禁</view>
            <view>
              对象：uid =>
              <text>{{ ' ' + log.uid }}</text>
            </view>
            <view class="log-reason">
              <view style="flex-shrink: 0">原因：</view>
              <view>
                <text>{{ log.reason }}</text>
              </view>
            </view>
            <view>操作者：{{ log.doer }}</view>
            <view>操作时间：{{ timeFromNow(log.created_at, 'created') }}</view>
          </view>
        </view>
      </view>
    </view>
    <u-toast ref="uToast" />
  </view>
</template>

<script>
import { getBannedLog, getBlockedLog } from '../../api';
import navbar from '../../components/navbar/navbar.vue';
export default {
  components: { navbar },
  data() {
    return {
      bannedLogs: [],
      blockedLogs: [],
      // bannedLog: {
      //   id: 24,
      //   created_at: "2021-11-11T14:51:02+08:00",
      //   uid: 3,
      //   doer: "0",
      //   reason: "xixixixi嘎嘎嘎过😁"
      // },
      // blockedLog: {
      //   id: 18,
      //   created_at: "2021-11-11T16:47:14+08:00",
      //   uid: 3,
      //   doer: "1",
      //   reason: "aaaaa",
      //   expired_at: "2021-11-14T16:47:14+08:00",
      //   last_time: 3,
      // },
      val_search: '',
      in_search: false,
      searchLoading: false,
      isAscending: false,
      btnOne: {
        height: '70rpx',
        backgroundColor: 'white',
        color: '#f5f5f5',
      },
      sortButStyle: {
        height: '70rpx',
        padding: '0 30rpx 0 25rpx',
        fontSize: '26rpx',
        color: '#363c54',
        backgroundColor: 'white',
        borderRadius: '30rpx',
        display: 'flex',
        justifyContent: 'space-around',
        alignItems: 'center',
      },
      renderFinished: false,
    };
  },
  onLoad() {
    if (this.vuex_user.adminType == '请登录')
      uni.redirectTo({
        url: '/pages/index/index',
      });
    else this.showLogs();
  },
  computed: {
    logs() {
      return [...this.bannedLogs, ...this.blockedLogs];
    },
    logsTotal() {
      return this.logs.length;
    },
    logsSorted() {
      if (this.isAscending) return this.ascending(this.logs, 'created_at');
      else return this.descending(this.logs, 'created_at');
    },
    logKey() {
      return function(log) {
        return log.expired_at ? `blocked.${log.id}` : `banned.${log.id}`;
      };
    },
    btnInfo() {
      return this.$store.state.menuButtonInfo;
    },
    toTop() {
      return `calc(${this.btnInfo.top}px + 90rpx)`;
    },
    logsHeight() {
      return `calc(100vh - ${this.btnInfo.top}px - 290rpx)`;
    },
  },
  methods: {
    showLogs() {
      this.searchLoading = true;
      var valid = /^\+?[1-9][0-9]*$/.test(this.val_search); //正整数
      if (!this.val_search.length) valid = true; //这里空的也行，与user页搜指定uid进行操作不同
      if (valid) {
        this.renderFinished = false;
        if (this.vuex_user.adminType === '超级管理员') {
          // 超管才能获取到封禁相关
          getBannedLog({
            uid: this.val_search,
          }).then(res => {
            if (res.code === 200) {
              this.bannedLogs = res.data.list;
            } else if (res.code === 20001) this.relog();
            else this.tip('日志获取失败！', 'warning');
          });
        }
        getBlockedLog({
          uid: this.val_search,
        }).then(res => {
          if (res.code === 200) {
            this.blockedLogs = res.data.list;
          } else if (res.code === 20001) this.relog();
          else this.tip('日志获取失败！', 'warning');
        });
        this.renderFinished = true;
      } else this.tip('请检查uid格式', 'warning');
      this.searchLoading = false;
    },
    ascending(array, key) {
      return array.sort(function(a, b) {
        var xx = a[key];
        var xy = b[key];
        return xx > xy ? -1 : xx < xy ? 1 : 0;
      });
    },
    descending(array, key) {
      return array.sort(function(a, b) {
        var xx = a[key];
        var xy = b[key];
        return xx > xy ? 1 : xx < xy ? -1 : 0;
      });
    },
    returnCompleteTime(date) {
      return (
        date.getFullYear() +
        '-' +
        (date.getMonth() + 1) +
        '-' +
        (`${date.getDate() < 10 ? '0' : ''}` + date.getDate()) +
        ' ' +
        (`${date.getHours() < 10 ? '0' : ''}` + date.getHours()) +
        '时' +
        (`${date.getMinutes() < 10 ? '0' : ''}` + date.getMinutes()) +
        '分'
      );
    },
    timeFromNow(inputTime, type) {
      let now = new Date(),
        past = new Date(inputTime);
      let gap = now.getTime() - past.getTime();
      if (type === 'expired') {
        if (now.getTime() > past.getTime()) return '已解除';
        else return this.returnCompleteTime(past);
      } else {
        let dDays = Math.floor(gap / (24 * 3600 * 1000));
        let residue1 = gap % (24 * 3600 * 1000);
        let dHours = Math.floor(residue1 / (3600 * 1000));
        let residue2 = residue1 % (3600 * 1000);
        let dMinutes = Math.floor(residue2 / (60 * 1000));
        let residue3 = residue2 % (60 * 1000);
        let dSeconds = Math.round(residue3 / 1000);
        return dDays > 0
          ? this.returnCompleteTime(past)
          : dHours > 0
          ? `${dHours}小时${dMinutes}分钟前`
          : dMinutes > 0
          ? `${dMinutes}分钟前`
          : `${dSeconds}秒前`;
      }
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
#noData {
  width: 100%;
  height: calc(100vh - 140rpx);
  position: absolute;
  top: 100rpx;
  left: 0;
}
#noResultImg {
  width: 250px;
  position: relative;
  top: 40%;
  left: 50%;
  transform: translate(-50%, -50%);
}
#tip {
  position: relative;
  top: 350rpx;
  text-align: center;
  font-size: 30rpx;
  font-family: 'Times New Roman', Times, serif;
}
#mainContainer {
  height: 100vh;
  background-color: #f5f5f5;
  overflow: hidden;
  font-size: 26rpx;
}
#inputHolder {
  background-color: white;
  margin: 0 40rpx;
  padding: 5rpx 20rpx;
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
.card {
  margin: 0 40rpx 20rpx;
  padding: 35rpx 30rpx;
  border-radius: 20rpx;
  background-color: white;
  transform: scale(1);
  box-shadow: 3px 3px 3px #f5f5f5;
  line-height: 45rpx;
  text {
    font-weight: bold;
  }
}
#listHolder {
  padding-bottom: 20rpx;
  overflow: auto;
}
.log-banned-tip {
  position: fixed;
  top: 20rpx;
  right: 25rpx;
  padding: 0 15rpx;
  border-radius: 10rpx;
  color: white;
  font-size: 26rpx;
  font-weight: bold;
  background-color: red;
}
.log-blocked-tip {
  position: fixed;
  top: 20rpx;
  right: 25rpx;
  padding: 0 15rpx;
  border-radius: 10rpx;
  color: white;
  font-size: 26rpx;
  font-weight: bold;
  background-color: orange;
}
.log-reason {
  word-break: break-all;
  display: flex;
}
#sortHolder {
  margin: 20rpx;
  display: flex;
}
.sort-icon {
  transform: translateY(3rpx);
}
#sum {
  height: 70rpx;
  margin: 20rpx;
  padding: 0 25rpx;
  font-size: 24rpx;
  color: #808080;
  border-radius: 30rpx;
  display: flex;
  justify-content: space-around;
  align-items: center;
}
</style>
