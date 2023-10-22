<template>
  <view style="overflow: hidden">
    <navbar :index="5"></navbar>
    <view id="funcHolder" :style="{ marginTop: toTop }">
      <text class="subTitle">公告管理</text>
      <view style="flex: 1"></view>
      <u-button type="primary" ripple @click="creating" :custom-style="btnOne">
        <u-icon name="plus"></u-icon>
        新建公告
      </u-button>
    </view>
    <view id="noticesHolder">
      <text class="subTitle subTitle-modify">公告列表</text>
      <view class="notices" :style="{ height: noticesHeight }">
        <view
          v-for="notice in notices"
          :key="notice.id"
          :class="['list-item', notice.focus ? 'list-item-active' : '']"
          @click="showButts(notice)"
        >
          <image src="../../static/undraw_message_sent_1030.svg" class="svgNotice" />
          <view class="blocker">
            <u-icon name="bell" color="#363c54" class="bell"></u-icon>
          </view>
          <view style="flex: 1; display: flex; flex-direction: column">
            <view class="notice-title">{{ notice.title }}</view>
            <view class="notice-sender">发布者：{{ notice.sender }}</view>
            <view style="flex: 1;">
              <view class="notice-content">{{ notice.content }}</view>
              <view class="notice-url">
                <u-link :href="notice.url" :under-line="true">{{ notice.url }}</u-link>
              </view>
            </view>
            <view class="additional">
              <!-- <view class="notice-read">
              <u-icon :name="notice.read ? 'eye-fill' : 'eye'" color="#363c54" size="35"></u-icon>
              <view style="margin: 0 20rpx;">{{ notice.read }}</view>
            </view> -->
              <view style="flex:1;"></view>
              <view class="notice-timeStamp">{{ notice.created_at }}</view>
            </view>
          </view>
          <view :class="['sideButts', 'editButt']" v-show="notice.focus" @tap.stop="editing(notice)">
            <u-icon name="edit-pen-fill"></u-icon>
            修改
          </view>
          <view :class="['sideButts', 'deleButt']" v-show="notice.focus" @tap.stop="deleting(notice)">
            <u-icon name="trash-fill"></u-icon>
            删除
          </view>
        </view>
      </view>
    </view>
    <u-popup v-model="newNotice" mode="center" border-radius="30">
      <view id="editBoard">
        <view class="it">
          <text class="it-t">标题:</text>
          <u-input
            type="text"
            v-model="noticeTemp.title"
            :custom-style="active_title_input"
            height="50"
            placeholder="请输入公告标题"
          />
        </view>
        <view class="it">
          <text class="it-t">发布者:</text>
          <u-input
            type="text"
            v-model="noticeTemp.sender"
            :custom-style="active_sender_input"
            height="50"
            placeholder="请输入发布者"
          />
        </view>
        <view class="it">
          <text class="it-t">时间:</text>
          <u-input type="text" v-model="noticeTime" :custom-style="disabled_input" height="50" disabled />
        </view>
        <view class="it">
          <text class="it-t">内容:</text>
          <view>
            <u-input
              v-model="noticeTemp.content"
              type="textarea"
              maxlength="1000"
              height="300"
              :auto-height="true"
              placeholder="请输入公告内容，不超过1000字"
              :custom-style="active_content_input"
            />
          </view>
        </view>
        <view class="it">
          <text class="it-t">url:</text>
          <u-input
            type="text"
            v-model="noticeTemp.url"
            :custom-style="active_title_input"
            height="50"
            placeholder="选填"
          />
        </view>
        <view style="width: 240rpx; margin: auto;"></view>
        <u-button type="primary" ripple :custom-style="btnTwo" @click="publish" :loading="publishLoading">
          {{ status == 0 ? '确认修改并发布' : '发布公告' }}
        </u-button>
      </view>
    </u-popup>
    <u-modal
      v-model="makeSure"
      :content="actionText"
      title="操作确认"
      show-cancel-button
      :mask-close-able="true"
      @confirm="confirmed"
    ></u-modal>
    <u-toast ref="uToast" />
  </view>
</template>

<script>
import navbar from '../../components/navbar/navbar.vue';
import { getNotice, putNotice, postNotice, deleteNotice } from '../../api/index';
export default {
  components: { navbar },
  data() {
    return {
      notices: [],
      noticeTemp: {
        id: 0,
        title: '',
        content: '',
        url: '',
        sender: '',
        // read: 0,
        created_at: '',
        focus: false,
      },
      // noticeFake: {
      //   id: 0,
      //   title: '我是标题我是标题我是标题',
      //   content:
      //     '我是假数据||我是内容我是内容我是内容我是内容我是内容我是内容我是内容我是内容我是内容我是内容我是内容我是内容我是内容我是内容',
      //   url: 'https://st23-code.github.io',
      //   sender: 'ST23',
      //   // read: 10,
      //   created_at: '2022-01-22T17:35:38+08:00',
      //   focus: false,
      // },
      makeSure: false,
      actionText: '',
      newNotice: false,
      timeStore: this.getTime(),
      tipText: '全体青湖人员',
      active_title_input: {
        width: '440rpx',
        fontSize: '26rpx',
        backgroundColor: 'white',
        border: '1.5px solid #ddd',
        borderRadius: '15rpx',
        padding: '0 10rpx',
        textAlign: 'left',
      },
      active_sender_input: {
        width: '270rpx',
        fontSize: '26rpx',
        backgroundColor: 'white',
        border: '1.5px solid #ddd',
        borderRadius: '15rpx',
        padding: '0 10rpx',
      },
      disabled_input: {
        width: '270rpx',
        textAlign: 'center',
        fontSize: '26rpx',
        backgroundColor: 'rgb(250, 250, 250)',
        border: '1.5px solid #eee',
        color: '#363c54',
        borderRadius: '15rpx',
        padding: '0 10rpx',
      },
      active_content_input: {
        width: '440rpx',
        border: '1.5px solid #ddd',
        borderRadius: '15rpx',
        backgroundColor: 'white',
        fontSize: '28rpx',
        padding: '10rpx',
      },
      btnOne: {
        width: '230rpx',
        height: '70rpx',
        marginRight: '50rpx',
        backgroundColor: '#363c54',
      },
      btnTwo: {
        width: '240rpx',
        height: '60rpx',
        backgroundColor: '#3f465b',
      },
      timer: null,
      status: 0,
      publishLoading: false,
    };
  },
  onLoad() {
    if (this.vuex_user.adminType !== '超级管理员')
      uni.redirectTo({
        url: '/pages/index/index',
      });
    else this.showNotice();
    this.timer = setInterval(() => {
      this.timeStore = this.getTime();
    }, 60 * 1000);
  },
  computed: {
    noticeTime() {
      if (!this.status) {
        if (this.noticeTemp == {}) return;
        return this.noticeTemp.created_at;
      } else return this.timeStore;
    },
    btnInfo() {
      return this.$store.state.menuButtonInfo;
    },
    toTop() {
      return `calc(${this.btnInfo.top}px + 90rpx)`;
    },
    noticesHeight() {
      return `calc(100vh - ${this.btnInfo.top}px - 300rpx)`;
    },
  },
  watch: {
    newNotice: {
      handler(newValue, oldValue) {
        if (!newValue) {
          this.noticeTemp = {
            id: 0,
            title: '',
            content: '',
            url: '',
            sender: '',
            // read: 0,
            reate_at: '',
            focus: false,
          };
        } else return;
      },
    },
  },
  methods: {
    showNotice() {
      getNotice().then(res => {
        if (res.code == 200) {
          this.notices = [];
          let nots = res.data.list;
          nots.map(notice =>
            this.notices.push({
              id: notice.id,
              title: notice.title,
              content: notice.content,
              sender: notice.sender,
              url: notice.url,
              // read: notice.read,
              created_at: this.formatUtcTime(notice.created_at),
              focus: false,
            })
          );
          if (this.notices.length) this.tip('获取公告列表成功！', 'success');
          else this.tip('暂无已发布公告', 'info');
        } else if (res.code == 20001) {
          this.relog();
          return;
        } else this.tip('获取公告列表失败！', 'warning');
      });
    },
    showButts(notice) {
      let previousState = notice.focus;
      this.notices.forEach(notice => (notice.focus = false));
      notice.focus = !previousState;
    },
    editing(notice) {
      notice.focus = false;
      this.noticeTemp = JSON.parse(JSON.stringify(notice));
      this.status = 0;
      this.newNotice = true;
    },
    creating() {
      this.noticeTemp = {
        id: 0,
        title: '',
        content: '',
        url: '',
        sender: '',
        // read: 0,
        reate_at: '',
        focus: false,
      };
      this.notices.map(notice => (notice.focus = false));
      this.status = 1;
      this.newNotice = true;
    },
    publish() {
      var titleLen = this.noticeTemp.title.length;
      var contentLen = this.noticeTemp.content.length;
      var senderLen = this.noticeTemp.sender.length;
      var urlLen = this.noticeTemp.url.length;
      if (!titleLen || !contentLen || !senderLen) {
        this.tip('标题、内容、发布者不能为空', 'warning');
        return;
      } else if (titleLen > 30 || contentLen > 1000 || senderLen > 30) {
        this.tip('请注意字数限制！标题、发布者不超过30字，内容不超过1000字。', 'warning');
        return;
      } else {
        if (urlLen && !this.isURL(this.noticeTemp.url)) {
          this.tip('不是有效的url格式', 'warning');
          return;
        } else {
          this.publishLoading = true;
          if (!this.status)
            putNotice({
              id: this.noticeTemp.id,
              content: this.noticeTemp.content,
              title: this.noticeTemp.title,
              sender: this.noticeTemp.sender,
              url: this.noticeTemp.url,
            }).then(res => {
              if (res.code == 200) {
                this.tip('公告条目修改成功！', 'success');
                this.publishLoading = false;
                this.newNotice = false;
                setTimeout(() => this.showNotice(), 1000);
              } else if (res.code == 20001) this.relog();
              else {
                this.tip('公告条目修改失败！', 'warning');
                this.publishLoading = false;
              }
            });
          else
            postNotice({
              sender: this.noticeTemp.sender,
              title: this.noticeTemp.title,
              content: this.noticeTemp.content,
              url: this.noticeTemp.url,
            }).then(res => {
              if (res.code == 200) {
                this.tip('公告发布成功！', 'success');
                this.publishLoading = false;
                this.newNotice = false;
                setTimeout(() => this.showNotice(), 1000);
              } else if (res.code == 20001) this.relog();
              else {
                this.tip('公告发布失败！', 'warning');
                this.publishLoading = false;
              }
            });
        }
      }
    },
    deleting(notice) {
      this.actionText = '确认删除此条公告？(操作不可逆)';
      this.noticeTemp = JSON.parse(JSON.stringify(notice));
      this.makeSure = true;
    },
    confirmed() {
      if (this.actionText == '确认删除此条公告？(操作不可逆)')
        deleteNotice({ id: this.noticeTemp.id }).then(res => {
          if (res.code == 200) {
            this.tip('公告条目删除成功！', 'success');
            setTimeout(() => this.showNotice(), 1000);
          } else if (res.code == 20001) this.relog();
          else this.tip('公告条目删除失败！', 'warning');
        });
    },
    refreshTime() {
      var newTime = this.getTime();
      this.timeStore = newTime;
    },
    getTime() {
      let time, year, month, day, hour, minute;
      time = new Date();
      year = time.getFullYear();
      month = time.getMonth() + 1;
      day = time.getDate();
      hour = consistancy(time.getHours());
      minute = consistancy(time.getMinutes());
      function consistancy(i) {
        if (i < 10) return '0' + i;
        return i;
      }
      return year + '-' + month + '-' + day + ' ' + hour + ':' + minute;
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
    formatUtcTime(v) {
      let date = new Date(v);
      return (
        date.getFullYear() +
        '-' +
        (date.getMonth() + 1) +
        '-' +
        (date.getDate() < 10 ? '0' + date.getDate() : date.getDate()) +
        ' ' +
        (date.getHours() < 10 ? '0' + date.getHours() : date.getHours()) +
        ':' +
        (date.getMinutes() < 10 ? '0' + date.getMinutes() : date.getMinutes()) +
        ':' +
        (date.getSeconds() < 10 ? '0' + date.getSeconds() : date.getSeconds())
      );
    },
    isURL(str_url) {
      // 验证url
      var strRegex =
        '^((https|http|ftp|rtsp|mms)?://)' +
        "?(([0-9a-z_!~*'().&=+$%-]+: )?[0-9a-z_!~*'().&=+$%-]+@)?" + // ftp的user@
        '(([0-9]{1,3}\.){3}[0-9]{1,3}' + // IP形式的URL- 199.194.52.184
        '|' + // 允许IP和DOMAIN（域名）
        "([0-9a-z_!~*'()-]+\.)*" + // 域名- www.
        '([0-9a-z][0-9a-z-]{0,61})?[0-9a-z]\.' + // 二级域名
        '[a-z]{2,6})' + // first level domain- .com or .museum
        '(:[0-9]{1,4})?' + // 端口- :80
        '((/?)|' + // a slash isn't required if there is no file name
        "(/[0-9a-z_!~*'().;?:@&=+$,%#-]+)+/?)$";
      var re = new RegExp(strRegex);
      return re.test(str_url);
    },
    tip(tipTitle, tipType) {
      this.$refs.uToast.show({
        title: tipTitle,
        type: tipType,
        position: 'top',
      });
    },
  },
  onUnload() {
    clearInterval(this.timer);
  },
};
</script>

<style scoped>
.subTitle {
  color: #363c54;
  font-family: Roboto, sans-serif;
  font-size: 36rpx;
  margin-left: 36rpx;
  line-height: 60rpx;
}
.subTitle-modify {
  margin-left: 86rpx;
  transform: translateY(-10rpx);
}
#noticesHolder {
  padding: 30rpx 0 20rpx;
}
.notices {
  overflow: auto;
  padding: 0 50rpx;
  z-index: 10;
}
#funcHolder {
  margin-left: 50rpx;
  margin-right: 50rpx;
  padding-bottom: 30rpx;
  display: flex;
  border-bottom: 2px solid #363c54;
}
.list-item {
  width: calc(96% - 50rpx);
  min-height: 300rpx;
  margin: 10px auto 15px;
  border-radius: 40rpx;
  border: 3px solid #363c54;
  transform: scale(1);
  padding: 20rpx 30rpx 15rpx;
  transition: all 0.5s;
  display: flex;
}
.list-item-active {
  transform: translateX(-50rpx);
  box-shadow: 0px 0px 1px #363c54;
}
.blocker {
  position: absolute;
  top: -11.5px;
  left: 61.8rpx;
  background-color: white;
  color: #363c54;
  padding: 0rpx 16rpx;
  transform: scale(1);
  font-size: 26rpx;
  height: 20px;
  line-height: 40px;
  z-index: -1;
}
.blocker::before {
  content: '';
  position: absolute;
  top: calc(50% - 2px);
  left: -2px;
  height: 4px;
  width: 4px;
  background-color: #363c54;
  border-radius: 50%;
}
.blocker::after {
  content: '';
  position: absolute;
  top: calc(50% - 2px);
  right: -2px;
  height: 4px;
  width: 4px;
  background-color: #363c54;
  border-radius: 50%;
}
.bell {
  transform: translateY(-10px);
  z-index: 2;
}
.notice-title {
  font-size: 34rpx;
  font-weight: bold;
  word-break: break-all;
  margin-top: 10rpx;
}
.notice-sender {
  font-size: 24rpx;
  margin: 10rpx 0;
}
.notice-content {
  font-size: 30rpx;
  word-break: break-all;
}
.notice-url {
  margin: 10rpx 0;
  display: inline-flex;
  cursor: pointer;
}
.additional {
  display: flex;
}
.notice-read {
  font-size: 24rpx;
  display: flex;
  align-items: center;
  justify-content: center;
}
.notice-timeStamp {
  font-size: 24rpx;
  text-align: right;
  color: rgb(150, 150, 150);
}
.editButt {
  background-color: #18b566;
  position: absolute;
  top: 60rpx;
  right: calc(-100rpx - 3.5px);
}
.deleButt {
  background-color: #ffd500;
  position: absolute;
  bottom: 60rpx;
  right: calc(-100rpx - 3.5px);
}
.sideButts {
  width: 100rpx;
  text-align: center;
  font-size: 26rpx;
  padding: 10rpx 10rpx 10rpx 0rpx;
  cursor: pointer;
  border-top-right-radius: 20rpx;
  border-bottom-right-radius: 20rpx;
  box-shadow: 0px 0px 3px rgba(0, 0, 0, 0.5);
  transition: all 0.5s;
}
#editBoard {
  width: 650rpx;
  padding: 20rpx;
  box-shadow: 2px 2px 5px rgba(0, 0, 0, 0.5);
  background-color: rgb(245, 245, 245);
  transform: scale(1);
}
#defaultBlock {
  width: 100vw;
  height: 100vh;
  position: fixed;
  top: 0;
  left: 0;
  z-index: 2;
  background-color: rgba(0, 0, 0, 0.625);
}
.it {
  display: flex;
  font-size: 26rpx;
  text-align: center;
  margin: 20rpx 0rpx;
}
.it-t {
  width: 100rpx;
  height: 50rpx;
  padding: 5rpx 0;
  display: flex;
  align-items: center;
  justify-content: center;
}
#back {
  height: 60rpx;
  display: flex;
  align-items: center;
  font-size: 36rpx;
  padding-bottom: 15rpx;
}
.svgNotice {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translateX(-50%) translateY(calc(-50% - 15rpx));
  z-index: -1;
  height: 60%;
  opacity: 0.2;
}
#noticesHolder ::-webkit-scrollbar {
  width: 0;
  height: 0;
  background-color: transparent;
}
</style>
