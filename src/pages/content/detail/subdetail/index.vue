<template>
  <view id="subDetail" :style="{ paddingTop: toTop }">
    <view id="back" @click="goBack">
      <u-icon name="arrow-leftward" color="#ffffff" size="28"></u-icon>
      <text style="margin-left: 5rpx;">返回帖子</text>
    </view>
    <scroll-view
      class="list list-whole"
      :style="{ height: subdetailsHeight }"
      scroll-y="true"
      @scrolltolower="reachBottom"
    >
      <view :class="['item', floor.is_deleted ? 'is-deleted' : '']">
        <view :class="['content-holder', 'bubble', floor.id === prosecutedFloorId ? 'red-dashed' : '']">
          <view style="flex:1;">
            <view style="margin-bottom:10rpx;display:flex;padding-right:15rpx">
              <u-icon name="account-fill" color="grey" size="26rpx"></u-icon>
              <text class="nick" style="flex:1;">{{ floor.nickname }} [ uid: {{ floor.uid }} ]</text>
              <u-icon
                :name="require('../../../../static/more.png')"
                size="32"
                @click="startActions(floor, 'floor')"
                v-if="vuex_user.adminType == '超级管理员'"
              ></u-icon>
            </view>
            <view class="content-text">
              <text
                v-for="(s, i) in textProcessing(floor.content)"
                :key="i"
                @tap.stop="i % 2 != 0 ? newPost(s) : () => {}"
                :class="[i % 2 != 0 ? 'link' : '']"
              >
                {{ s }}
              </text>
            </view>
            <view v-if="floor.image_url" class="post-pic-group-holder">
              <view @click="startPreviewImg(floor.image_url, 0)" style="margin-right: 20rpx;">
                <u-image
                  :src="picImgSrc(floor.image_url)"
                  mode="aspectFill"
                  width="175rpx"
                  height="175rpx"
                  border-radius="12rpx"
                >
                  <u-loading slot="loading"></u-loading>
                </u-image>
              </view>
              <!-- [0]因为一二级评论图片一张 -->
            </view>
          </view>
          <view class="additional">
            <view style="display: flex;align-items: center;">
              <image
                :src="floor.sub_floor_cnt ? '../../../../static/chat-fill.svg' : '../../../../static/chat.svg'"
                class="icon"
              />
              <text>{{ floor.sub_floor_cnt }}</text>
            </view>
            <view>
              <u-icon :name="floor.like_count ? 'thumb-up-fill' : 'thumb-up'" class="icon"></u-icon>
              <text>{{ floor.like_count }}</text>
            </view>
            <view style="flex: 1;"></view>
            <view class="timestamp_normal">
              <text>{{ timeFromNow(floor.created_at) }}</text>
            </view>
          </view>
        </view>
        <!-- <u-line color="rgba(0,0,0,.8)" margin="10rpx 0rpx" /> -->

        <view
          v-for="sub_floor in sub_floors"
          :key="sub_floor.id"
          :class="['subFloor-holder', sub_floor.is_deleted ? 'is-deleted' : '']"
        >
          <view :class="['content-holder', 'bubble', sub_floor.id === prosecutedFloorId ? 'red-dashed' : '']">
            <view style="flex:1;">
              <view style="margin-bottom:10rpx;display:flex;padding-right:15rpx">
                <u-icon name="account-fill" color="grey" size="26rpx"></u-icon>
                <text class="nick" style="flex:1;">{{ sub_floor.nickname }} [ uid: {{ sub_floor.uid }} ]</text>
                <u-icon
                  :name="require('../../../../static/more.png')"
                  size="32"
                  @click="startActions(sub_floor, 'sub_floor')"
                  v-if="vuex_user.adminType == '超级管理员'"
                ></u-icon>
              </view>
              <view class="content-text">
                <text v-if="sub_floor.reply_to_name">
                  回复
                  <text class="nick">{{ sub_floor.reply_to_name }}</text>
                  ：
                </text>
                <text
                  v-for="(s, i) in textProcessing(sub_floor.content)"
                  :key="i"
                  @tap.stop="i % 2 != 0 ? newPost(s) : () => {}"
                  :class="[i % 2 != 0 ? 'link' : '']"
                >
                  {{ s }}
                </text>
              </view>
              <view v-if="sub_floor.image_url" class="post-pic-group-holder">
                <view @click="startPreviewImg(sub_floor.image_url, 0)" style="margin-right: 20rpx;">
                  <u-image
                    :src="picImgSrc(sub_floor.image_url)"
                    mode="aspectFill"
                    width="175rpx"
                    height="175rpx"
                    border-radius="12rpx"
                  >
                    <u-loading slot="loading"></u-loading>
                  </u-image>
                </view>
                <!-- [0]因为一二级评论图片一张 -->
              </view>
            </view>
            <view class="additional">
              <view>
                <u-icon :name="sub_floor.like_count ? 'thumb-up-fill' : 'thumb-up'" class="icon"></u-icon>
                <text>{{ sub_floor.like_count }}</text>
              </view>
              <view style="flex: 1;"></view>
              <view class="timestamp_normal">
                <text>{{ timeFromNow(sub_floor.created_at) }}</text>
              </view>
            </view>
          </view>
        </view>
      </view>
      <view :class="['prettier', isEmptyStr(getMoreTip) ? '' : 'extended']">{{ getMoreTip }}</view>
    </scroll-view>
    <u-popup v-model="openBox" mode="center" border-radius="20">
      <view style="width: 510rpx; padding: 30rpx 35rpx;">
        <view class="box-title">真实姓名：{{ truth.realname }}</view>
        <view class="box-title">学号：{{ truth.userNumber }}</view>
        <view class="box-title">性别：{{ truth.gender }}</view>
        <view class="box-title">校区：{{ truth.campus }}</view>
        <view class="box-title">院系：{{ truth.department }}</view>
        <view class="box-title">专业：{{ truth.major }}</view>
        <view class="box-title">学历：{{ truth.stuType }}</view>
        <view class="box-title">电话：{{ truth.telephone.trim().length ? truth.telephone : '暂无' }}</view>
        <view class="box-title">邮箱：{{ truth.email }}</view>
        <view class="box-title">昵称：{{ truth.nickname }}</view>
        <!-- <view class="box-title">身份：{{ truth.role }}</view> -->
      </view>
    </u-popup>
    <view>
      <u-action-sheet
        :list="
          item_info.type == 'floor' ? actionList_temp : item_info.is_deleted ? actionList_deleted : actionList_active
        "
        @click="handleActionClick"
        v-model="showActions"
        :cancel-btn="false"
        border-radius="30"
        :safe-area-inset-bottom="true"
      ></u-action-sheet>
    </view>
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
import { getTheFloor, getSubFloors, deleteFloor, recoverFloor, reveal, getPostTypes } from '../../../../api';
export default {
  data() {
    return {
      floor: {},
      sub_floors: [],
      item_info: {
        id: 0,
        uid: 0,
        is_deleted: false,
        type: 'floor' || 'sub_floor',
      },
      actionList_active: [
        {
          text: '开盒',
          color: 'black',
          fontSize: 30,
          subText: '查看真实身份',
          disabled: true,
        },
        {
          text: '删除',
          color: 'black',
          fontSize: 30,
          subText: '感谢您对论坛的维护',
        },
      ],
      actionList_deleted: [
        {
          text: '开盒',
          color: 'black',
          fontSize: 30,
          subText: '查看真实身份',
          disabled: true,
        },
        {
          text: '恢复',
          color: 'black',
          fontSize: 30,
          subText: '撤销删除操作',
        },
      ],
      actionList_temp: [
        {
          text: '开盒',
          color: 'black',
          fontSize: 30,
          subText: '查看真实身份',
          disabled: true,
        },
      ],
      showActions: false,
      openBox: false,
      truth: {
        telephone: '',
      },
      prosecutedFloorId: 0,
      delete_item_id: 0,
      recover_item_id: 0,
      isPostDeleted: true,

      actionText: '',
      makeSure: false,
      pageForSubFloors: 1,
      getMoreTip: '',

      typeList: [],
    };
  },
  onLoad() {
    if (this.vuex_user.adminType === '超级管理员') {
      this.actionList_active[0].disabled = false;
      this.actionList_deleted[0].disabled = false;
      this.actionList_temp[0].disabled = false;
    }
    getPostTypes().then(res => {
      if (res.code === 200) {
        res.data.list.forEach(type => {
          if (type.id != 1)
            this.typeList.push({
              value: type.id,
              label: type.shortname,
            });
        });
      } else this.tip('获取帖子类型失败！', 'warning');
    });
    // #ifdef APP-NVUE
    const eventChannel = this.$scope.eventChannel; // 兼容APP-NVUE
    // #endif
    // #ifndef APP-NVUE
    const eventChannel = this.getOpenerEventChannel();
    // #endif  // 监听acceptDataFromOpenerPage事件，获取上一页面通过eventChannel传送到当前页面的数据
    var _this = this;
    eventChannel.on('acceptDataFromOpenerPage', function(data) {
      _this.floor = {};
      _this.replys = [];
      _this.prosecutedFloorId = data.prosecutedFloorId;
      _this.isPostDeleted = data.isPostDeleted;
      _this.showDetail(data.comment_id);
    });
  },
  computed: {
    textProcessing() {
      return function(content) {
        if (typeof content == 'string') {
          var splitArr = content.split('#MP');
          var contentArr = [splitArr[0]];
          for (let i = 1; i < splitArr.length; i++) {
            var id = splitArr[i].substring(0, 6);
            if (parseInt(id)) {
              var link = `#MP${id}`;
              var str = splitArr[i].replace(id, '');
              contentArr.push(link, str);
            }
          }
          return contentArr;
        } else return [];
      };
    },
    imgHeader() {
      return this.$store.state.urls_apply.imgHeader;
    },
    btnInfo() {
      return this.$store.state.menuButtonInfo;
    },
    toTop() {
      return `${this.btnInfo.top}px`;
    },
    subdetailsHeight() {
      return `calc(100vh - ${this.btnInfo.top}px - 80rpx)`;
    },
  },
  methods: {
    reachBottom() {
      if (this.sub_floors.length === this.pageForSubFloors * 10) {
        this.pageForSubFloors++;
        this.showSubFloors();
      } else this.getMoreTip = '~ 已加载全部 ~';
    },
    newPost(s) {
      var id = parseInt(s.split('#MP')[1]);
      var post = {
        id,
        rating: 0,
      };
      let _this = this;
      uni.navigateTo({
        url: '/pages/content/detail/index',
        success: function(res) {
          res.eventChannel.emit('acceptDataFromOpenerPage', {
            typeList: _this.typeList,
            post,
            is_from_sub: true,
          });
        }, // 通过eventChannel向被打开页面传送数据
      });
    },
    showDetail(floor_id) {
      getTheFloor({
        floor_id,
      }).then(res => {
        if (res.code === 200) {
          this.floor = res.data.floor;
          this.showSubFloors();
        } else if (res.code === 20001) this.relog();
        else this.tip('帖子获取失败！', 'warning');
      });
    },
    showSubFloors() {
      getSubFloors({
        floor_id: this.floor.id,
        page: this.pageForSubFloors,
      }).then(res => {
        if (res.code === 200) {
          console.log(res.data.list);
          var subFloorsData = [];
          subFloorsData = this.sortByTimestream(res.data.list, 'created_at');
          this.sub_floors = [...this.sub_floors, ...subFloorsData];
          this.tip('数据获取成功！', 'success');
        } else this.tip('数据获取失败！', 'warning');
      });
    },
    goBack() {
      uni.navigateBack();
    },
    delComment(floor_id) {
      this.delete_item_id = floor_id;
      this.actionText = '确认删除此楼层？';
      this.makeSure = true;
    },
    recComment(floor_id) {
      if (this.isPostDeleted) {
        this.tip('该帖已删除, 如需操作请先恢复该贴', 'warning');
        return;
      }
      this.recover_item_id = floor_id;
      this.actionText = '确认恢复此楼层？';
      this.makeSure = true;
    },
    confirmed() {
      if (this.actionText === '确认删除此楼层？')
        deleteFloor({
          floor_id: this.delete_item_id,
        }).then(res => {
          if (res.code == 200) {
            this.tip('楼层删除成功！', 'success');
            // setTimeout(() => {
            //   let pages = getCurrentPages();
            //   let beforePage = pages[pages.length - 2];
            //   uni.navigateBack({
            //     success: function() {
            //       beforePage.refreshFloors();
            //     },
            //   });
            // }, 800);
            this.refreshSubFloors();
          } else if (res.code == 20001) this.relog();
          else this.tip('楼层删除失败！', 'warning');
        });
      else
        recoverFloor({
          floor_id: this.recover_item_id,
        }).then(res => {
          if (res.code == 200) {
            this.tip('楼层恢复成功！', 'success');
            // setTimeout(() => {
            //   let pages = getCurrentPages();
            //   let beforePage = pages[pages.length - 2];
            //   uni.navigateBack({
            //     success: function() {
            //       beforePage.refreshFloors();
            //     },
            //   });
            // }, 800);
            this.refreshSubFloors();
          } else if (res.code == 20001) this.relog();
          else this.tip('楼层恢复失败！', 'warning');
        });
    },
    refreshSubFloors() {
      this.pageForSubFloors = 1;
      this.sub_floors = [];
      this.showSubFloors();
    },
    startActions(obj, type) {
      this.item_info = { ...obj, type };
      this.showActions = true;
    },
    handleActionClick(index) {
      if (index === 0) {
        reveal({
          uid: this.item_info.uid,
        }).then(res => {
          if (res.code === 200) {
            this.truth = res.data.detail;
            this.openBox = true;
          }
        });
      } else if (!this.item_info.is_deleted) {
        this.delComment(this.item_info.id);
      } else {
        this.recComment(this.item_info.id);
      }
    },
    picImgSrc(pic) {
      // return this.imgHeader + '/thumb/' + pic;
      return this.imgHeader + '/origin/' + pic;
    },
    startPreviewImg(data, index) {
      let urlArray = this.transformImgUrl(data);
      return this.previewImg(urlArray, index);
    },
    transformImgUrl(data) {
      let urlArray = [];
      if (typeof data === 'string') {
        urlArray.push(this.imgHeader + '/origin/' + data);
      } else {
        data.forEach(item => {
          urlArray.push(this.imgHeader + '/origin/' + item);
        });
      }
      return urlArray;
    },
    previewImg(urlArray, index) {
      if (urlArray == null || urlArray === '' || urlArray == false) return;
      uni.previewImage({
        current: index,
        urls: urlArray,
      });
    },
    sortByTimestream(array, key) {
      return array.sort(function(a, b) {
        var xx = a[key];
        var xy = b[key];
        return xx > xy ? 1 : xx < xy ? -1 : 0;
      });
    },
    isEmptyStr(str) {
      if (str == null || str === '') return true;
      else return false;
    },
    isEmptyArr(arr) {
      if (arr == undefined || arr == null || arr.length <= 0 || this.isEmptyStr(arr[0])) {
        return true;
      } else return false;
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
        ':' +
        (`${date.getMinutes() < 10 ? '0' : ''}` + date.getMinutes()) +
        ':' +
        (`${date.getSeconds() < 10 ? '0' : ''}` + date.getSeconds())
      );
    },
    timeFromNow(inputTime) {
      let now = new Date(),
        past = new Date(inputTime);
      let gap = now.getTime() - past.getTime();
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
#subDetail {
  width: 100%;
  background-color: #f5f5f5;
}
@import '../../../../assets/content.scss';
</style>
