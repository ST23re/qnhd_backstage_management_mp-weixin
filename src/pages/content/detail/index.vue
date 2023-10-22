<template>
  <view>
    <view id="mainContainer" :style="{ paddingTop: toTop }">
      <view id="back" @click="goBack">
        <u-icon name="arrow-leftward" color="#ffffff" size="28"></u-icon>
        <text style="margin-left: 5rpx;">{{ is_from_sub ? '返回详情' : '返回受理中心' }}</text>
      </view>
      <scroll-view
        class="list list-whole"
        :style="{ height: detailsHeight }"
        scroll-y="true"
        @scrolltolower="reachBottom"
      >
        <view id="extraHolder">
          <!-- showWhole === true -->
          <view :class="['item', post.is_deleted ? 'is-deleted' : '']">
            <view :class="['content-holder', 'bubble', post.id === prosecutedPostId ? 'red-dashed' : '']">
              <view class="prime-area">
                <view style="flex: 5;" v-if="post.type !== 1">
                  <u-icon name="account-fill" color="grey" size="32rpx"></u-icon>
                  <text class="poster">{{ post.nickname }} [ uid: {{ post.uid }} ]</text>
                </view>
                <view v-else>
                  <text class="poster">{{ post.nickname }} ({{ post.uid }})</text>
                </view>
                <view class="actions-more">
                  <u-button
                    ripple
                    :custom-style="{ height: '42rpx', backgroundColor: '#f5f5f5', borderRadius: '20rpx' }"
                    @click="startActions(post)"
                  >
                    <u-icon :name="require('../../../static/more.png')" size="32"></u-icon>
                    <!-- <view class="delete-tip">删帖</view> -->
                  </u-button>
                </view>
              </view>
              <!--  -->
              <view style="transform: scale(1); padding-top: 5rpx">
                <view :class="['post-title', post.type === 1 ? 'shortened' : '']">
                  <text>{{ post.title }}</text>
                </view>
                <view v-if="post.type === 1" class="post-solve">
                  <image
                    :src="
                      post.solved === 2
                        ? '../../../static/solved.svg'
                        : post.solved === 3
                        ? '../../../static/dispatched.svg'
                        : '../../../static/unsolved.svg'
                    "
                    class="icon-small"
                  />
                  <view>
                    <text>
                      {{
                        post.solved
                          ? post.solved === 1
                            ? '已回复'
                            : post.solved === 2
                            ? '已解决'
                            : '已分发'
                          : '未解决'
                      }}
                    </text>
                  </view>
                </view>
                <view style="display: flex;">
                  <view>
                    <view class="post-tag" @tap.stop="viaTag(post)" v-if="post.tag || post.department">
                      <view :class="['icon-holder', post.type === 1 ? 'flag-bg' : 'tag-bg']">
                        <image
                          :src="post.type === 1 ? '../../../static/flag.svg' : '../../../static/tag.svg'"
                          :class="post.type === 1 ? 'icon-tiny-reverse' : 'icon-tiny'"
                        />
                      </view>
                      <text>{{ post.type === 1 ? post.department.name : post.tag.name }}</text>
                    </view>
                    <view class="post-tag post-partition" @tap.stop="startTransfer(post)">
                      <view class="icon-holder">
                        <image src="../../../static/hive.svg" class="icon-large" />
                      </view>
                      <text>{{ postPartition(post.type) }}</text>
                    </view>
                    <view class="post-campus" v-if="post.campus != 0">
                      <text>{{ post.campus === 1 ? '老校区' : '新校区' }}</text>
                    </view>
                    <view class="post-value" @tap.stop="startRefine(post)">
                      <view v-if="post.e_tag" style="display: flex;">
                        <view :class="['logo', `logo-${post.e_tag}`]">
                          {{ post.e_tag == 'recommend' ? '加精' : post.e_tag == 'theme' ? '活动' : '置顶' }}
                        </view>
                        <text v-if="post.e_tag != 'recommend' && post.e_tag != 'theme'">{{ post.value }}</text>
                      </view>
                      <view v-else>
                        <view class="start-to-refine"><text>🔥标签</text></view>
                      </view>
                    </view>
                  </view>
                </view>
                <view class="post-content-detail content-text">
                  <text
                    v-for="(s, i) in textProcessing(post.content)"
                    :key="i"
                    @tap.stop="i % 2 != 0 ? newPost(s) : () => {}"
                    :class="[i % 2 != 0 ? 'link' : '']"
                  >
                    {{ s }}
                  </text>
                </view>
                <view v-if="!isEmptyArr(post.image_urls)" class="post-pic-group-holder">
                  <view
                    v-for="(pic, index) in post.image_urls"
                    :key="picKey(index, pic)"
                    @tap.stop="startPreviewImg(post.image_urls, index)"
                    style="margin-right: 20rpx;"
                  >
                    <u-image
                      :src="picImgSrc(pic)"
                      mode="aspectFill"
                      width="175rpx"
                      height="175rpx"
                      border-radius="12rpx"
                    >
                      <u-loading slot="loading"></u-loading>
                    </u-image>
                  </view>
                </view>
                <view class="additional">
                  <view style="display: flex;align-items: center;">
                    <image
                      :src="post.comment_count ? '../../../static/chat-fill.svg' : '../../../static/chat.svg'"
                      class="icon"
                    />
                    <text>{{ post.comment_count ? post.comment_count : 0 }}</text>
                  </view>
                  <view>
                    <u-icon :name="post.like_count ? 'thumb-up-fill' : 'thumb-up'" class="icon"></u-icon>
                    <text>{{ post.like_count }}</text>
                  </view>
                  <view>
                    <u-icon :name="post.fav_count ? 'star-fill' : 'star'" class="icon"></u-icon>
                    <text>{{ post.fav_count }}</text>
                  </view>
                  <view style="flex: 1;"></view>
                  <view class="timestamp_normal">
                    <text>{{ timeFromNow(post.created_at) }}</text>
                  </view>
                </view>
              </view>
            </view>
            <!--  -->
            <!-- <u-line color="rgba(0,0,0,.8)" margin="10rpx 0rpx" /> -->
          </view>

          <view class="subTitle-comment" v-if="post.type !== 1">评论区</view>
          <view class="subTitle-comment" v-if="post.type === 1 && replys">回复</view>

          <!-- 若是校务帖，getFloors时也搜校方回复，在这里展示，带部门 -->
          <view v-if="post.type === 1 && replys">
            <view v-for="(reply, index) in replys" :key="reply.id" :class="[index === 0 ? 'item' : 'subFloor-holder']">
              <view class="content-holder bubble">
                <view v-if="reply.sender === 1" class="reply-header-official">
                  <image
                    src="https://gimg2.baidu.com/image_search/src=http%3A%2F%2Fblog.tsyzz.com%2Fupload%2F2016%2F0525%2F0156061529.png&refer=http%3A%2F%2Fblog.tsyzz.com&app=2002&size=f9999,10000&q=a80&n=0&g=0n&fmt=jpeg?sec=1645766520&t=f5b635f791a4727dfadad840d5cc2875"
                    class="official-logo"
                    mode="aspectFill"
                  />
                  <view class="reply-header-text">
                    <view style="flex: 1;"></view>
                    <view class="official-department">{{ post.department.name }}</view>
                    <view class="timeStampOfficial">{{ timeFromNow(reply.created_at) }}</view>
                    <view style="flex: 1;"></view>
                  </view>
                </view>

                <view v-else class="reply-header-user">
                  <u-icon name="account-fill" color="grey" size="26"></u-icon>
                  <text style="font-size: 26rpx;font-weight: bold;color: grey;">楼主</text>
                  <view class="timeStampOfficial" style="margin-left: 20rpx;">{{ timeFromNow(reply.created_at) }}</view>
                </view>

                <view class="reply-content content-text">
                  <rich-text :nodes="reply.content"></rich-text>
                </view>
                <view v-if="!isEmptyArr(reply.image_urls)" class="post-pic-group-holder">
                  <view
                    v-for="(pic, indexSon) in reply.image_urls"
                    :key="picKey(indexSon, pic)"
                    @tap.stop="startPreviewImg(reply.image_urls, indexSon)"
                    style="margin-right: 20rpx;"
                  >
                    <u-image
                      :src="picImgSrc(pic)"
                      mode="aspectFill"
                      width="175rpx"
                      height="175rpx"
                      border-radius="12rpx"
                    >
                      <u-loading slot="loading"></u-loading>
                    </u-image>
                  </view>
                </view>
                <view
                  v-if="index === 0 && reply.sender === 1"
                  style="font-weight: bold; color: #363c54; margin-bottom: 5rpx;"
                >
                  楼主评分：{{ post.rating }} / 10
                </view>
              </view>
            </view>
          </view>

          <view class="subTitle-comment" v-if="post.type === 1">用户评论</view>

          <view v-for="comment in floors" :key="comment.id" :class="['item', comment.is_deleted ? 'is-deleted' : '']">
            <view :class="['content-holder', 'bubble', comment.id === prosecutedFloorId ? 'red-dashed' : '']">
              <view style="flex:1;">
                <view style="margin-bottom:10rpx;display:flex;padding-right:15rpx" v-if="post.type !== 1">
                  <u-icon name="account-fill" color="grey" size="26rpx"></u-icon>
                  <text class="nick" style="flex:1;">{{ comment.nickname }} [ uid: {{ comment.uid }} ]</text>
                  <view style="margin-left: 15rpx" @click="startActions(comment)">
                    <u-icon :name="require('../../../static/more.png')" size="32"></u-icon>
                  </view>
                </view>
                <view style="margin-bottom:10rpx;display:flex;padding-right:15rpx" v-else>
                  <!-- <u-icon name="account-fill" color="grey" size="26rpx"></u-icon> -->
                  <text class="nick nick-modify" style="flex:1;">{{ comment.nickname }} ({{ comment.uid }})</text>
                  <view style="margin-left: 15rpx" @click="startActions(comment)">
                    <u-icon :name="require('../../../static/more.png')" size="32"></u-icon>
                  </view>
                </view>
                <view class="content-text">
                  <text
                    v-for="(s, i) in textProcessing(comment.content)"
                    :key="i"
                    @tap.stop="i % 2 != 0 ? newPost(s) : () => {}"
                    :class="[i % 2 != 0 ? 'link' : '']"
                  >
                    {{ s }}
                  </text>
                </view>
                <view v-if="comment.image_url" class="post-pic-group-holder">
                  <view @click="startPreviewImg(comment.image_url, 0)" style="margin-right: 20rpx;">
                    <u-image
                      :src="picImgSrc(comment.image_url)"
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
                    :src="comment.sub_floor_cnt ? '../../../static/chat-fill.svg' : '../../../static/chat.svg'"
                    class="icon"
                  />
                  <text>{{ comment.sub_floor_cnt }}</text>
                </view>
                <view>
                  <u-icon :name="comment.like_count ? 'thumb-up-fill' : 'thumb-up'" class="icon"></u-icon>
                  <text>{{ comment.like_count }}</text>
                </view>
                <view style="flex: 1;"></view>
                <view class="timestamp_normal">
                  <text>{{ timeFromNow(comment.created_at) }}</text>
                </view>
              </view>
            </view>
            <!-- <u-line color="rgba(0,0,0,.8)" margin="10rpx 0rpx" /> -->

            <view
              v-for="sub_floor in comment.sub_floors"
              :key="sub_floor.id"
              :class="['subFloor-holder', sub_floor.is_deleted ? 'is-deleted' : '']"
            >
              <view :class="['content-holder', 'bubble', sub_floor.id === prosecutedFloorId ? 'red-dashed' : '']">
                <view style="flex:1;">
                  <view style="margin-bottom:10rpx;display:flex;padding-right:15rpx" v-if="post.type !== 1">
                    <u-icon name="account-fill" color="grey" size="26rpx"></u-icon>
                    <text class="nick" style="flex:1;">{{ sub_floor.nickname }} [ uid: {{ sub_floor.uid }} ]</text>
                    <view style="margin-left: 15rpx" @click="startActions(sub_floor)">
                      <u-icon :name="require('../../../static/more.png')" size="32"></u-icon>
                    </view>
                  </view>
                  <view style="margin-bottom:10rpx;display:flex;padding-right:15rpx" v-else>
                    <!-- <u-icon name="account-fill" color="grey" size="26rpx"></u-icon> -->
                    <text class="nick nick-modify" style="flex:1;">{{ sub_floor.nickname }} ({{ sub_floor.uid }})</text>
                    <view style="margin-left: 15rpx" @click="startActions(sub_floor)">
                      <u-icon :name="require('../../../static/more.png')" size="32"></u-icon>
                    </view>
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
            <view
              v-if="comment.sub_floor_cnt > comment.sub_floors.length"
              class="show-more"
              @click="showMore(comment.id)"
            >
              查看回复详情 >>
            </view>
          </view>
        </view>
        <!-- 收 extraHolder -->
        <view :class="['prettier', isEmptyStr(getMoreTip) ? '' : 'extended']">{{ getMoreTip }}</view>
      </scroll-view>
      <!-- 收 list -->
    </view>
    <u-popup v-model="openRefine" mode="center" border-radius="25" @close="refineValue = ''">
      <view class="refine-holder">
        <view style="padding: 40rpx 30rpx 15rpx; display: flex;">
          <view style="font-weight: bold;">
            模式：
          </view>
          <view class="refine-type-holder">
            <view style="display: flex;" v-if="!initialEtagType">
              <view :class="['types', refineType === 0 ? 'types-active' : '']" @click="refineType = 0">置顶</view>
              <view :class="['types', refineType === 1 ? 'types-active' : '']" @click="refineType = 1">加精</view>
              <view :class="['types', refineType === 2 ? 'types-active' : '']" @click="refineType = 2">活动</view>
            </view>
            <view style="display: flex;" v-else>
              <view class="types types-active">
                {{ refineType == 1 ? '加精✨' : refineType == 2 ? '活动🎉' : '置顶' }}
              </view>
            </view>
          </view>
        </view>
        <view class="refine-tip-title" v-if="refineType === 0">请您为帖子赋予/修改置顶权值🔥，0~30000以内</view>
        <input
          v-if="refineType === 0"
          type="text"
          placeholder="请输入权值"
          v-model="refineValue"
          class="refine-input"
          @confirm="confirmRefineValue(refineValue)"
        />
        <view class="btn-holder">
          <view class="refine-btn-holder" v-if="post.e_tag">
            <u-button :custom-style="cancelBtnStyle" @click="confirmRefineValue('0', 'reset')">撤出</u-button>
          </view>
          <view class="refine-btn-holder" v-if="post.e_tag != 'recommend' && post.e_tag != 'theme'">
            <u-button :custom-style="refineBtnStyle" @click="confirmRefineValue(refineValue)">提交</u-button>
          </view>
        </view>
      </view>
    </u-popup>
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
          actionObject.is_deleted
            ? actionList_deleted
            : actionObject.rating === undefined || isEmptyArr(actionObject.image_urls)
            ? actionList_active
            : actionList_active_post
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
    <u-select
      v-model="transferShow"
      mode="single-column"
      title="为该帖修改类型"
      cancel-text="取消操作"
      confirm-text="确认修改"
      :list="typeList"
      @confirm="confirmModifyType"
    ></u-select>
    <u-toast ref="uToast" />
  </view>
</template>

<script>
import {
  deleteFloor,
  deletePost,
  deletePostPic,
  getFloors,
  getPost,
  getReplys,
  recoverFloor,
  recoverPost,
  refinePost,
  reveal,
  setETag,
  transferPostType,
} from '../../../api';
export default {
  data() {
    return {
      post: {},
      replys: [],
      floors: [],
      sub_floors: [],
      typeList: [],
      transferShow: false,
      refineId: 0,
      refineType: 0,
      refineValue: '',
      initialEtagType: 0,
      openRefine: false,
      solvedTypes: [
        {
          value: '',
          label: '全部',
        },
        {
          value: 0,
          label: '未分发',
        },
        {
          value: 1,
          label: '未解决',
        },
        {
          value: 2,
          label: '已解决',
        },
        {
          value: 3,
          label: '已分发',
        },
      ],
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
      actionList_active_post: [
        {
          text: '开盒',
          color: 'black',
          fontSize: 30,
          subText: '查看真实身份',
          disabled: true,
        },
        {
          text: '删除帖子',
          color: 'black',
          fontSize: 30,
          subText: '感谢您对论坛的维护',
        },
        {
          text: '删除图片',
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
          disabled: true,
        },
      ],
      delete_reasons: [
        '散布宗教、迷信、谣言与虚假信息',
        '含有淫秽色情、赌博传销、血腥暴力信息',
        '侵犯他人肖像权或隐私权、恶意辱骂他人进行人身攻击',
        '发布敏感话题',
        '干扰论坛正常运营，侵犯其他用户权益或第三方合法权益',
        '违反相关法律法规或违反《普通高等学校学生管理规定》和天津大学学生管理规定',
      ],
      actionObject: {},
      showActions: false,
      openBox: false,
      truth: {
        telephone: '',
      },
      refineBtnStyle: {
        height: '60rpx',
        backgroundColor: '#363c54',
        color: '#f5f5f5',
        boxShadow: '0.5px 0.5px 2px #363c54',
      },
      cancelBtnStyle: {
        height: '60rpx',
        backgroundColor: 'white',
        color: '#363c54',
        boxShadow: '0.5px 0.5px 2px #363c54',
      },
      prosecutedPostId: 0,
      prosecutedFloorId: 0,
      makeSure: false,
      actionText: '',
      delete_item_id: 0,
      recover_item_id: 0,
      pageForFloors: 1,
      getMoreTip: '',

      is_from_sub: false,
    };
  },
  onLoad(option) {
    if (this.vuex_user.adminType === '超级管理员') {
      this.actionList_active[0].disabled = false;
      this.actionList_active_post[0].disabled = false;
      this.actionList_deleted[0].disabled = false;
      this.actionList_deleted[1].disabled = false;
    }
    // #ifdef APP-NVUE
    const eventChannel = this.$scope.eventChannel; // 兼容APP-NVUE
    // #endif
    // #ifndef APP-NVUE
    const eventChannel = this.getOpenerEventChannel();
    // #endif  // 监听acceptDataFromOpenerPage事件，获取上一页面通过eventChannel传送到当前页面的数据
    var _this = this;
    eventChannel.on('acceptDataFromOpenerPage', function(data) {
      _this.typeList = data.typeList;
      _this.post = {};
      _this.replys = [];
      _this.floors = [];
      _this.showDetail(data.post);
      _this.is_from_sub = data.is_from_sub;
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
    picKey() {
      return function(index, pic) {
        return `${index}.${pic}`;
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
    detailsHeight() {
      return `calc(100vh - ${this.btnInfo.top}px - 80rpx)`;
    },
  },
  methods: {
    reachBottom() {
      if (this.floors.length === this.pageForFloors * 10) {
        this.pageForFloors++;
        this.showFloors();
      } else this.getMoreTip = '~ 已加载全部 ~';
    },
    newPost(s) {
      this.replys = [];
      this.floors = [];
      this.getMoreTip = '';
      var id = parseInt(s.split('#MP')[1]);
      var data = {
        id,
        rating: 0,
      };
      this.showDetail(data);
    },
    showDetail(data) {
      var post_id;
      if (data.rating === undefined) {
        // to locate
        if (data.type == 1) this.prosecutedPostId = data.post_id;
        else if (data.type == 2) this.prosecutedFloorId = data.floor_id;
        post_id = data.post_id;
      } else post_id = data.id;
      getPost({
        id: post_id,
      }).then(res => {
        if (res.code === 200) {
          console.log(res.data.post);
          this.post = res.data.post;
          this.showFloors();
          if (this.post.type === 1) this.showReplys();
        } else if (res.code === 20001) this.relog();
        else this.tip('帖子获取失败！', 'warning');
      });
    },
    showFloors() {
      getFloors({
        post_id: this.post.id,
        page: this.pageForFloors,
      }).then(res => {
        if (res.code === 200) {
          console.log(res.data.list);
          this.floors = [...this.floors, ...res.data.list];
          this.tip('数据获取成功！', 'success');
        } else this.tip('数据获取失败！', 'warning');
      });
    },
    refreshFloors() {
      this.floors = [];
      this.pageForFloors = 1;
      this.getMoreTip = '';
      this.showFloors();
    },
    showReplys() {
      getReplys({
        post_id: this.post.id,
      }).then(res => {
        if (res.code === 200) {
          console.log(res.data.list);
          this.replys = res.data.list;
          this.tip('数据获取成功！', 'success');
        } else this.tip('数据获取失败！', 'warning');
      });
    },
    showMore(comment_id) {
      let _this = this;
      uni.navigateTo({
        url: '/pages/content/detail/subdetail/index',
        success: function(res) {
          res.eventChannel.emit('acceptDataFromOpenerPage', {
            comment_id,
            prosecutedFloorId: _this.prosecutedFloorId,
            isPostDeleted: _this.post.is_deleted,
          });
        }, // 通过eventChannel向被打开页面传送数据
      });
    },
    goBack() {
      uni.navigateBack();
    },
    viaTag(post) {
      uni.navigateTo({
        url: '/pages/content/index',
        success: function(res) {
          res.eventChannel.emit('acceptDataFromOpenerPage', post);
        }, // 通过eventChannel向被打开页面传送数据
      });
    },
    postPartition(typeId) {
      let partition = '全部';
      if (this.typeList.length)
        for (var i = 0; i < this.typeList.length; i++)
          if (this.typeList[i].value === typeId) partition = this.typeList[i].label;
      return partition;
    },
    startTransfer(post) {
      if (post.is_deleted) {
        this.tip('该帖已删除, 如需操作请先恢复该贴', 'warning');
        return;
      }
      this.transferShow = true;
    },
    confirmModifyType(e) {
      if (e[0].value != this.post.type)
        transferPostType({
          post_id: this.post.id,
          new_type_id: e[0].value,
        }).then(res => {
          if (res.code === 200) {
            this.tip('您的类型修改已成功上传', 'success');
            this.transferShow = false;
          } else this.tip('帖子类型修改失败！', 'warning');
        });
      else this.tip('该贴已是此类型！', 'warning');
    },
    startRefine(post) {
      if (post.is_deleted) {
        this.tip('该帖已删除, 如需操作请先恢复该贴', 'warning');
        return;
      }
      this.refineId = post.id;
      this.refineType = post.e_tag === 'recommend' ? 1 : post.e_tag === 'theme' ? 2 : 0;
      this.refineValue = post.value;
      this.initialEtagType = post.e_tag;
      this.openRefine = true;
    },
    confirmRefineValue(value, info) {
      if (this.refineType === 0) {
        value = parseInt(value);
        var valid = /^[+]{0,1}(\d+)$|^[+]{0,1}(\d+\.\d+)$/.test(value); //非负数
        if (valid) {
          if (value <= 30000) {
            refinePost({
              post_id: this.refineId,
              value,
            }).then(res => {
              if (res.code === 200) {
                this.tip('处理上传成功', 'success');
                this.openRefine = false;
              } else if (res.code === 20001) this.relog();
              else {
                this.tip('处理上传失败！', 'warning');
                this.openRefine = false;
              }
            });
          } else this.tip('数值小于30000！', 'warning');
        } else this.tip('请输入一个非负数！', 'warning');
      } else {
        setETag({
          post_id: this.refineId,
          value: info === 'reset' ? 0 : this.refineType,
        }).then(res => {
          if (res.code === 200) {
            this.tip('您的处理已成功上传', 'success');
            this.openRefine = false;
          } else if (res.code === 20001) this.relog();
          else {
            this.tip('处理上传失败！', 'warning');
            this.openRefine = false;
          }
        });
      }
    },
    delPost(post_id) {
      this.delete_item_id = post_id;
      this.actionText = '确认删除此条帖子？';
      this.makeSure = true;
    },
    delPostPic(post_id) {
      this.delete_item_id = post_id;
      this.actionText = '确认删除帖子配图？';
      this.makeSure = true;
    },
    delComment(floor_id) {
      this.delete_item_id = floor_id;
      this.actionText = '确认删除此楼层？';
      this.makeSure = true;
    },
    recPost(post_id) {
      this.recover_item_id = post_id;
      this.actionText = '确认恢复此条帖子？';
      this.makeSure = true;
    },
    recComment(floor_id) {
      if (this.post.is_deleted) {
        this.tip('该帖已删除, 如需操作请先恢复该贴', 'warning');
        return;
      }
      this.recover_item_id = floor_id;
      this.actionText = '确认恢复此楼层？';
      this.makeSure = true;
    },
    confirmed() {
      if (this.actionText === '确认删除此条帖子？') {
        deletePost({
          id: this.delete_item_id,
        }).then(res => {
          if (res.code === 200) {
            this.tip('帖子删除成功', 'success');
            setTimeout(() => {
              //需求：不堆加页面栈返回并刷新前页面
              let pages = getCurrentPages(); // 当前页面
              let beforePage = pages[pages.length - 2]; // 前一个页面
              uni.navigateBack({
                success: function() {
                  beforePage.onLoad(); // 执行前一个页面的onLoad方法
                },
              });
            }, 1000);
          } else if (res.code === 20001) this.relog();
          else this.tip('帖子删除失败！', 'warning');
        });
      } else if (this.actionText === '确认删除此楼层？') {
        deleteFloor({
          floor_id: this.delete_item_id,
        }).then(res => {
          if (res.code == 200) {
            this.tip('楼层删除成功！', 'success');
            setTimeout(() => {
              this.refreshFloors();
            }, 800);
          } else if (res.code == 20001) this.relog();
          else this.tip('楼层删除失败！', 'warning');
        });
      } else if (this.actionText === '确认恢复此条帖子？') {
        recoverPost({
          post_id: this.recover_item_id,
        }).then(res => {
          if (res.code === 200) {
            this.tip('帖子恢复成功', 'success');
            setTimeout(() => {
              //需求：不堆加页面栈返回并刷新前页面
              let pages = getCurrentPages(); // 当前页面
              let beforePage = pages[pages.length - 2]; // 前一个页面
              uni.navigateBack({
                success: function() {
                  beforePage.onLoad(); // 执行前一个页面的onLoad方法
                },
              });
            }, 1000);
          } else if (res.code === 20001) this.relog();
          else this.tip('帖子恢复失败！', 'warning');
        });
      } else if (this.actionText === '确认恢复此楼层？') {
        recoverFloor({
          floor_id: this.recover_item_id,
        }).then(res => {
          if (res.code == 200) {
            this.tip('楼层恢复成功！', 'success');
            setTimeout(() => {
              this.refreshFloors();
            }, 800);
          } else if (res.code == 20001) this.relog();
          else this.tip('楼层恢复失败！', 'warning');
        });
      } else if ((this.actionText = '确认删除帖子配图？')) {
        deletePostPic({
          post_id: this.delete_item_id,
        }).then(res => {
          if (res.code === 200) {
            this.tip('帖子配图删除成功！', 'success');
            setTimeout(() => {
              this.replys = [];
              this.floors = [];
              this.showDetail({
                id: this.delete_item_id,
                rating: 0,
              });
            }, 800);
          } else if (res.code === 20001) this.relog();
          else this.tip('帖子配图删除失败！', 'warning');
        });
      }
    },
    startActions(obj) {
      this.actionObject = obj;
      this.showActions = true;
    },
    handleActionClick(index) {
      if (index === 0) {
        reveal({
          uid: this.actionObject.uid,
        }).then(res => {
          if (res.code === 200) {
            this.truth = res.data.detail;
            this.openBox = true;
          }
        });
      } else if (index === 1) {
        if (!this.actionObject.is_deleted) {
          console.log(this.actionObject);
          if (this.actionObject.rating !== undefined) this.delPost(this.actionObject.id);
          else this.delComment(this.actionObject.id);
        } else {
          if (this.actionObject.rating !== undefined) this.recPost(this.actionObject.id);
          else this.recComment(this.actionObject.id);
        }
      } else if (index === 2) this.delPostPic(this.actionObject.id);
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
@import '../../../assets/content.scss';
.show-more {
  font-size: 26rpx;
  font-weight: bold;
  color: #363c54;
  margin-left: calc(10% + 30rpx);
  margin-bottom: 20rpx;
}
</style>
