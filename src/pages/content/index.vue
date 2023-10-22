<template>
  <view>
    <navbar :index="2"></navbar>
    <view id="mainContainer" :style="{ paddingTop: toTop }">
      <view id="loadingReports" v-show="status === 0 && !renderFinished">
        <image src="../../static/loading.png" mode="aspectFit" width="250" />
      </view>
      <view id="typeHolder">
        <view :class="['type-text', status === 0 ? 'type-text-active' : '']" @click="status = 0">
          举报列表
        </view>
        <view id="division"></view>
        <view :class="['type-text', status === 1 ? 'type-text-active' : '']" @click="switchToPosts">
          浏览帖子
        </view>
        <view :class="['slider', status === 0 ? 'slider-left' : 'slider-right']"></view>
      </view>

      <view id="searchArea" v-show="status === 1">
        <!-- <view class="subTitle">帖子受理中心</view> -->
        <view style="display:flex;padding: 10rpx 20rpx;">
          <view style="flex:4;transform: scale(1);">
            <input type="text" placeholder="搜索帖子 / #MPid" v-model="keyWord" @confirm="e => startSearching()" />
            <u-button :custom-style="filterStyle" ripple>
              <u-icon
                v-if="!specifiedTag"
                :name="require('../../static/more.svg')"
                size="60"
                @click="showFilter = !showFilter"
              ></u-icon>
              <u-icon v-else :name="require('../../static/initialize.svg')" size="45" @click="cancelFilter"></u-icon>
            </u-button>
          </view>
          <view style="flex:1;display:flex;justify-content:center;">
            <u-button :custom-style="btnOne" ripple @click="e => startSearching()" :loading="searchLoading">
              确认
              <!-- <u-icon :name="require('../../static/search.svg')" size="45" /> -->
            </u-button>
          </view>
        </view>
      </view>

      <scroll-view
        class="list list-half"
        :style="{ height: status === 0 ? reportsHeight : postsHeight }"
        scroll-y="true"
        @scrolltolower="reachBottom"
      >
        <view style="margin: 0 30rpx; border-radius: 30rpx;">
          <view :class="['fade-in', renderFinished ? 'show' : 'hide']">
            <u-swipe-action
              v-for="report in postsModified"
              :key="report.id"
              :options="options"
              @click="(index, action) => swipeReport(report, index, action)"
              @content-click="index => toDetail(report, index)"
              bg-color="#f5f5f5"
              v-show="status === 0"
            >
              <view
                class="preview-holder-modify bubble title-wrap"
                style="font-size: 26rpx;padding-right: 20rpx; width: calc(100vw - 60rpx)"
              >
                <view style="display: flex;font-size: 26rpx;padding: 10rpx 0;">
                  <view class="reportTimes">
                    <view class="times-item">{{ report.times }}</view>
                  </view>
                  <view style="flex:1;display: flex;">
                    <view style="display: flex; flex-direction: column;">
                      <view :class="['type-holder', report.type === 1 ? 'type-holder-post' : 'type-holder-floor']">
                        {{ report.type === 1 ? '帖子' : '评论' }}
                      </view>
                      <view class="sub-title" style="margin-top: 10rpx;">摘要:</view>
                      <view class="sub-title">原因:</view>
                    </view>
                    <view v-if="report.reasons" style="flex: 1;padding-left:20rpx; line-height: 45rpx;">
                      <view class="timestampHolder">
                        <view class="timestamp">
                          <text style="font-weight: bold;">更新于：</text>
                          {{ timeFromNow(report.created_at) }}
                        </view>
                      </view>
                      <!-- <view v-if="report.times > 1"> -->
                      <view class="ellipsis" style="margin-right: 30rpx;">
                        <!-- 摘要： -->
                        <text class="report-abstract">{{ report.abstract }}</text>
                      </view>
                      <view v-for="(item, indexSon) in report.reasons" :key="indexSon">
                        <view v-if="indexSon < 3 || report.showDetail" class="reason-holder">
                          <view v-for="(l, i) in item.reason.split('')" :key="i">{{ l }}</view>
                          <view class="reason-info">{{ `uid:` + item.uid }}</view>
                        </view>
                      </view>
                      <!-- </view> -->
                      <!-- <view v-else class="reason-holder">
                        <view>原因：</view>
                        <view v-for="(l, j) in post.list[0].reason.split('')" :key="j">{{ l }}</view>
                        <text class="reason-info">{{ `uid:` + post.list[0].uid }}</text>
                      </view> -->
                    </view>
                  </view>
                </view>
                <view class="show-more" v-if="report.times > 3">
                  <view style="flex: 1;"></view>
                  <view @tap.stop="() => {}">
                    <view @tap="switchFold(report)" class="show-more-item">
                      <img src="../../static/fold.svg" :class="['icon', report.showDetail ? '' : 'rotate']" alt="<<" />
                      {{ report.showDetail ? '收起' : '展开' }}
                    </view>
                  </view>
                </view>
              </view>
            </u-swipe-action>
          </view>

          <view
            v-for="post in postsModified"
            :key="post.id"
            class="preview-holder bubble"
            @click="toDetail(post)"
            v-show="status === 1"
          >
            <view
              :class="{ 'is-deleted': post.is_deleted }"
              style="font-size: 26rpx; transform: scale(1); padding-top: 5rpx"
            >
              <!-- status === 1 -->
              <view class="post-title shortened ellipsis" style="margin-top: 4rpx;">
                <text>{{ post.title }}</text>
              </view>
              <view v-if="post.type === 1" class="post-solve">
                <image
                  :src="
                    post.solved === 2
                      ? '../../static/solved.svg'
                      : post.solved === 3
                      ? '../../static/dispatched.svg'
                      : '../../static/unsolved.svg'
                  "
                  class="icon-small"
                />
                <view>
                  <text>
                    {{
                      post.solved ? (post.solved === 1 ? '已回复' : post.solved === 2 ? '已解决' : '已分发') : '未解决'
                    }}
                  </text>
                </view>
              </view>
              <view v-else class="post-solve">
                <view style="padding-left: 15rpx;">
                  <text>{{ '#MP' + `${1000000 + post.id}`.slice(1) }}</text>
                </view>
              </view>
              <view style="display: flex;">
                <view style="flex: 1;display: flex; flex-direction: column; padding-right: 20rpx">
                  <view>
                    <view class="post-tag" @tap.stop="viaTag(post)" v-if="post.tag || post.department">
                      <view :class="['icon-holder', post.type === 1 ? 'flag-bg' : 'tag-bg']">
                        <image
                          :src="post.type === 1 ? '../../static/flag.svg' : '../../static/tag.svg'"
                          :class="post.type === 1 ? 'icon-tiny-reverse' : 'icon-tiny'"
                        />
                      </view>
                      <text>{{ post.type === 1 ? post.department.name : post.tag.name }}</text>
                    </view>
                    <view class="post-tag post-partition" @tap.stop="startTransfer(post)">
                      <view class="icon-holder">
                        <image src="../../static/hive.svg" class="icon-large" />
                      </view>
                      <text>{{ postPartition(post.type) }}</text>
                    </view>
                    <view class="post-campus" v-if="post.campus != 0">
                      <text>{{ post.campus === 1 ? '卫津路' : '北洋园' }}</text>
                    </view>
                    <view class="post-value" v-if="post.e_tag" @tap.stop="startRefine(post)">
                      <!-- 加精值 env => test -->
                      <view style="display: flex;">
                        <view :class="['logo', `logo-${post.e_tag}`]">
                          {{ post.e_tag == 'recommend' ? '加精' : post.e_tag == 'theme' ? '活动' : '置顶' }}
                        </view>
                        <text v-if="post.e_tag != 'recommend' && post.e_tag != 'theme'">{{ post.value }}</text>
                      </view>
                    </view>
                  </view>
                  <view class="post-content" @tap.stop="() => {}">
                    <text
                      v-for="(s, i) in textProcessing(post.content)"
                      :key="i"
                      @tap="i % 2 != 0 ? startSearching(s) : toDetail(post)"
                      :class="[i % 2 != 0 ? 'link' : '']"
                    >
                      {{ s }}
                    </text>
                  </view>
                </view>
                <view v-if="!isEmptyArr(post.image_urls)" class="post-preview-img-holder">
                  <view @tap.stop="startPreviewImg(post.image_urls[0], 0)" style="margin-top: 16rpx">
                    <u-image
                      :src="picImgSrc(post.image_urls[0])"
                      mode="aspectFill"
                      width="175rpx"
                      height="125rpx"
                      border-radius="12rpx"
                    >
                      <u-loading slot="loading"></u-loading>
                    </u-image>
                  </view>
                </view>
              </view>
              <view class="additional">
                <view style="display: flex;align-items: center;">
                  <image
                    :src="post.comment_count ? '../../static/chat-fill.svg' : '../../static/chat.svg'"
                    class="icon"
                  />
                  <text>{{ post.comment_count }}</text>
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
                <view class="timestamp">
                  <text>{{ timeFromNow(post.created_at) }}</text>
                </view>
              </view>
            </view>
            <!-- <u-line color="rgba(0,0,0,.8)" margin="10rpx 0rpx" /> -->
          </view>
        </view>
        <view :class="['prettier', isEmptyStr(getMoreTip) ? '' : 'extended']">{{ getMoreTip }}</view>
      </scroll-view>
      <!-- 收 list -->
    </view>
    <u-popup v-model="showFilter" mode="center" :border="true" border-radius="25">
      <view id="filterHolder">
        <view id="filter-title">配置筛选条件</view>

        <view style="display: inline-flex; margin-left: 50%; transform: translateX(-50%);">
          <view class="search-delete-holder">
            状态：
          </view>
          <view class="search-solved-holder deleted-modified">
            <view style="display: flex;">
              <view class="solved-item" @click="searchDeleted = 0">未删除</view>
              <view class="solved-item" @click="searchDeleted = 1">已删除</view>
            </view>
            <view :class="['division', `division-deleted-${searchDeleted}`]"></view>
          </view>
        </view>
        <view style="display: inline-flex; margin-left: 50%; transform: translateX(-50%);">
          <view class="search-delete-holder">
            标签：
          </view>
          <view class="search-solved-holder deleted-modified">
            <view style="display: flex;">
              <view class="solved-item" @click="searchEtag = ''">全部</view>
              <view class="solved-item" @click="searchEtag = 'top'">置顶</view>
              <view class="solved-item" @click="searchEtag = 'recommend'">加精</view>
              <view class="solved-item" @click="searchEtag = 'theme'">活动</view>
            </view>
            <view :class="['division', `division-etag-${searchEtag}`]"></view>
          </view>
        </view>
        <view class="search-refined-holder">
          <view style="display: flex;">
            <view class="solved-item" @click="handleModeSwitch(0, 1)">
              置顶优先
            </view>
            <view class="solved-item" @click="handleModeSwitch(1, 1)">
              动态优先
            </view>
            <view class="solved-item" @click="handleModeSwitch(1, 0)">
              时间排序
            </view>
          </view>
          <view
            :class="[
              'division',
              searchRefinedMode === 0
                ? 'division-left'
                : searchRefinedMode === 1 && searchTimeMode === 1
                ? 'division-middle'
                : 'division-right',
            ]"
          ></view>
        </view>
        <view class="search-condition-holder">
          <view style="text-align: center;">
            <view
              v-for="(type, index) in postTypes"
              :key="type.value"
              class="type-item"
              :style="{ fontWeight: index == ptIndex ? 'bold' : 'normal' }"
              @click="toCertainType(type.value, index)"
            >
              {{ type.label }}
            </view>
          </view>
          <!-- <view class="division" :style="{ left: `${(450 / ptSum) * (ptIndex + 0.5) - 25}rpx` }"></view> -->
        </view>
        <view v-if="searchType === 1" style="width: 100%;display: flex; justify-content: center;">
          <view class="select-holder">
            <view class="select-btn-holder">
              <u-button :custom-style="selectBtnStyle" ripple @click="showDepartments = true">
                {{
                  departmentName === '' ? `请选择一个部门 ${showDepartments ? '▲' : '▼'}` : `当前：${departmentName}`
                }}
              </u-button>
            </view>
          </view>
        </view>
        <view
          v-if="searchType === 1"
          class="search-condition-holder"
          style="width: 500rpx;transform: translateY(-8rpx)"
        >
          <view style="text-align: center;">
            <view
              v-for="type in solvedTypes"
              :key="type.value"
              class="type-item"
              :style="{ fontWeight: type.value === searchSolved ? 'bold' : 'normal' }"
              @click="searchSolved = type.value"
            >
              {{ type.label }}
            </view>
          </view>
          <!-- <view :class="['division', `division-${searchSolved}`]"></view> -->
        </view>
      </view>
    </u-popup>
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
        <view class="refine-tip" v-if="refineType === 0">
          只看置顶等筛选模式请点击搜索框旁「更多」按钮设置
        </view>
        <input
          v-if="refineType === 0"
          type="text"
          placeholder="请输入权值"
          v-model="refineValue"
          class="refine-input"
          @confirm="confirmRefineValue(refineValue)"
        />
        <view class="btn-holder">
          <view class="refine-btn-holder" v-if="initialEtagType">
            <u-button :custom-style="cancelBtnStyle" @click="confirmRefineValue('0', 'reset')">撤出</u-button>
          </view>
          <view class="refine-btn-holder" v-if="initialEtagType != 'recommend' && initialEtagType != 'theme'">
            <u-button :custom-style="refineBtnStyle" @click="confirmRefineValue(refineValue)">提交</u-button>
          </view>
        </view>
      </view>
    </u-popup>
    <u-select
      v-model="showDepartments"
      mode="single-column"
      :list="departmentList"
      @confirm="confirmDepartment"
    ></u-select>
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
  getPostsPreview,
  getReports,
  getDepartments,
  getPostTypes,
  deleteReport,
  refinePost,
  transferPostType,
  getPost,
  setETag,
} from '../../api';
import navbar from '../../components/navbar/navbar.vue';
export default {
  components: { navbar },
  data() {
    return {
      status: 0,
      posts: [],
      reports: [],

      keyWord: '',
      finalKeyWord: '',
      searchType: 0,
      searchTagId: '',

      solvedTypes: [
        {
          value: '',
          label: '全部',
        },
        {
          value: 0,
          label: '未解决',
        },
        {
          value: 1,
          label: '已回复',
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
      searchSolved: '',

      searchDepartmentId: '',
      searchEtag: '',
      searchTimeMode: 1,
      searchRefinedMode: 0,
      searchDeleted: 0,
      specifiedTag: false,

      postTypes: [],
      ptSum: 0,
      ptIndex: 0,
      transferShow: false,
      toTransferPostId: 0,
      toTransferPostTypeId: 0,

      departmentList: [],
      departmentName: '',
      showDepartments: false,

      refineId: 0,
      refineType: 0,
      refineValue: '',
      initialEtagType: 0,
      openRefine: false,

      searchLoading: false,

      btnOne: {
        width: '120rpx',
        height: '70rpx',
        backgroundColor: '#363c54',
        color: 'white',
        borderRadius: '20rpx',
        zIndex: '0',
      },
      filterStyle: {
        height: '50rpx',
        width: '90rpx',
        backgroundColor: 'white',
        position: 'fixed',
        top: '10rpx',
        right: 'calc(2.5% + 10rpx)',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: '2',
      },
      selectBtnStyle: {
        height: '60rpx',
        fontSize: '26rpx',
        borderRadius: '20rpx',
        // border: '1.5px solid #363c54',
      },
      switchBtnStyle: {
        height: '60rpx',
        lineHeight: '60rpx',
        fontSize: '30rpx',
        padding: '10rpx 20rpx',
        borderRadius: '20rpx 20rpx 0 0',
        color: '#eee',
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
      options: [
        {
          text: '已处理',
          style: {
            backgroundColor: '#ff9900',
            borderRadius: '25rpx',
            fontWeight: 'bold',
            fontSize: '26rpx',
            marginBottom: '20rpx',
          },
        },
      ],

      showFilter: false,

      pageForReports: 1,
      pageForPosts: 1,
      getMoreTip: '',

      renderFinished: false,
      postIdStore: [],
      duplicatedNum: 0,
    };
  },
  onLoad() {
    if (this.vuex_user.adminType == '请登录')
      uni.redirectTo({
        url: '/pages/index/index',
      });
    else {
      getPostTypes().then(res => {
        if (res.code === 200) {
          this.postTypes = [
            {
              value: 0,
              label: '全部',
            },
          ];
          res.data.list.forEach(type => {
            this.postTypes.push({
              value: type.id,
              label: type.shortname,
            });
          });
          this.ptSum = res.data.total + 1;
        } else this.tip('获取帖子类型失败！', 'warning');
      });
      getDepartments({}).then(res => {
        if (res.code === 200) {
          this.departmentList = [];
          res.data.list.forEach(dep => {
            this.departmentList.push({
              value: dep.id,
              label: dep.name,
            });
          });
        } else this.tip('获取部门列表失败', 'warning');
      });
      this.showReports(1500);

      // #ifdef APP-NVUE
      const eventChannel = this.$scope.eventChannel; // 兼容APP-NVUE
      // #endif
      // #ifndef APP-NVUE
      const eventChannel = this.getOpenerEventChannel();
      // #endif  // 监听acceptDataFromOpenerPage事件，获取上一页面通过eventChannel传送到当前页面的数据
      if (Object.keys(eventChannel).length) {
        var _vm = this;
        eventChannel.on('acceptDataFromOpenerPage', function(data) {
          if (typeof data === 'object') _vm.viaTag(data);
        });
      }
    }
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
    postsModified() {
      if (!this.status)
        return this.reports.filter(
          (report, index) => index < this.pageForReports * 15 && !report.solved && !report.is_deleted
        );
      else return this.posts;
    },
    typeList() {
      return this.postTypes.filter(type => type.value != 0 && type.value != 1);
    },
    // uniqueReportKey() {
    //   return function(post) {
    //     return post.id + '.' + post.reason;
    //   };
    // },
    imgHeader() {
      return this.$store.state.urls_apply.imgHeader;
    },
    btnInfo() {
      return this.$store.state.menuButtonInfo;
    },
    toTop() {
      return `calc(${this.btnInfo.top}px + 80rpx)`;
    },
    reportsHeight() {
      return `calc(100vh - ${this.btnInfo.top}px - 220rpx)`;
    },
    postsHeight() {
      return `calc(100vh - ${this.btnInfo.top}px - 330rpx)`;
    },
  },
  watch: {
    status: {
      handler(newValue, oldValue) {
        this.getMoreTip = '';
        if (newValue === 0) {
          this.pageForReports = 1;
          this.showReports(1000);
        } else {
          this.renderFinished = false;
          this.pageForPosts = 1; // default
        }
      },
      // immediate: true,
    },
  },
  methods: {
    reachBottom() {
      if (this.status) {
        if (this.posts.length === this.pageForPosts * 10 - this.duplicatedNum) {
          this.pageForPosts++;
          this.showPosts();
        } else this.getMoreTip = '~ 已加载全部 ~';
      } else {
        if (this.postsModified.length === this.pageForReports * 15) this.pageForReports++;
        else this.getMoreTip = '~ 已加载全部 ~';
      }
    },
    switchToPosts() {
      if (this.posts == false) this.newSearch();
      this.status = 1;
    },
    newSearch() {
      this.postIdStore = [];
      this.duplicatedNum = 0;
      this.posts = [];
      this.pageForPosts = 1;
      this.showPosts();
      this.getMoreTip = '';
    },
    showPosts() {
      getPostsPreview({
        type: this.searchType,
        search_mode: this.searchTimeMode,
        solved: this.searchSolved,
        department_id: this.searchDepartmentId,
        content: this.finalKeyWord,
        tag_id: this.searchTagId,
        etag: this.searchEtag,
        value_mode: this.searchRefinedMode,
        is_deleted: this.searchDeleted,
        page_size: 10,
        page: this.pageForPosts,
      }).then(res => {
        if (res.code === 200) {
          var i = 0;
          res.data.list.forEach(post => {
            if (this.postIdStore.indexOf(post.id) !== -1) {
              // 动态排序获取数组导致重贴
              this.duplicatedNum++;
            } else {
              this.postIdStore.push(post.id);
              this.posts.push(post);
            }
            i++;
          });
          this.duplicatedNum += 10 - i; // 有时莫名获取数不足10
          console.log(this.duplicatedNum, i);
          if (res.data.list.length) this.tip('帖子获取成功！', 'success');
          else this.tip('No data', 'info');
        } else if (res.code === 20001) this.relog();
        else this.tip('帖子获取失败！', 'warning');
      });
    },
    showReports(timeout) {
      this.renderFinished = false;
      var reports_post = [],
        reports_floor = [];
      getReports({
        type: 1,
      })
        .then(res => {
          if (res.code === 200) {
            for (let i = 0; i < res.data.list.length; i++) {
              var { post, reports } = res.data.list[i];
              var l = reports.length - 1;
              reports_post.push({
                id: post.id,
                abstract: post.content,
                type: 1,
                times: l + 1,
                post_id: reports[l].post_id,
                floor_id: reports[l].floor_id,
                solved: reports[l].solved,
                is_deleted: reports[l].is_deleted,
                created_at: reports[l].created_at,
                reasons: this.storeReasons(reports),
                showDetail: false,
              });
            }
            return reports_post;
          } else if (res.code === 20001) {
            this.relog();
            return;
          } else {
            this.tip('举报数据获取失败！', 'warning');
            this.renderFinished = true;
            return;
          }
        })
        .then(data => {
          getReports({
            type: 2,
          })
            .then(res => {
              if (res.code === 200) {
                console.log(res.data.list);
                for (let i = 0; i < res.data.list.length; i++) {
                  var { floor, reports } = res.data.list[i];
                  var l = reports.length - 1;
                  reports_post.push({
                    id: floor.id,
                    abstract: floor.content,
                    type: 2,
                    times: l + 1,
                    post_id: reports[l].post_id,
                    floor_id: reports[l].floor_id,
                    solved: reports[l].solved,
                    is_deleted: reports[l].is_deleted,
                    created_at: reports[l].created_at,
                    reasons: this.storeReasons(reports),
                    showDetail: false,
                  });
                }
                return [...data, ...reports_floor];
              } else if (res.code === 20001) {
                this.relog();
                return;
              } else {
                this.tip('举报数据获取失败！', 'warning');
                this.renderFinished = true;
                return;
              }
            })
            .then(data => {
              if (data == false) {
                this.tip('暂无举报内容', 'info');
                this.renderFinished = true;
              } else {
                this.reports = this.sortByTimes(data, ['times', 'created_at']);
                // console.log(this.reports);
                this.tip('举报数据获取成功', 'success');
                setTimeout(() => {
                  this.renderFinished = true; // spare time for rendering
                }, timeout);
              }
            });
        });
    },
    toDetail(post) {
      console.log(post);
      let _this = this;
      uni.navigateTo({
        url: '/pages/content/detail/index',
        success: function(res) {
          res.eventChannel.emit('acceptDataFromOpenerPage', {
            post,
            typeList: _this.typeList,
            is_from_sub: false,
          });
        }, // 通过eventChannel向被打开页面传送数据
      });
    },
    swipeReport(report) {
      console.log(report);
      deleteReport({
        type: report.type,
        id: report.type === 1 ? report.post_id : report.floor_id,
      }).then(res => {
        if (res.code === 200) {
          this.tip('处理中...', 'info');
          this.renderFinished = false;
          this.reports = [];
          setTimeout(() => {
            this.showReports();
          }, 2000);
        } else this.tip('处理失败！', 'warning');
      });
    },
    startSearching(link) {
      var str = link || this.keyWord;
      var search_by_id = str.trim().split('')[0] === '#';
      if (search_by_id) {
        var post_id = parseInt(str.split('#MP')[1]);
        var thePost = {};
        getPost({
          id: post_id,
        })
          .then(res => {
            if (res.code === 200) thePost = res.data.post;
            else if (res.code === 20001) this.relog();
            else this.tip('帖子获取失败！', 'warning');
          })
          .then(() => {
            this.toDetail(thePost);
          });
      } else {
        this.finalKeyWord = this.keyWord;
        this.newSearch();
      }
    },
    viaTag(post, bool) {
      // console.log(this.posts);
      if (this.specifiedTag) return;
      this.specifiedTag = true;
      if (post.type !== 1) {
        this.searchTagId = post.tag.id;
        this.searchDepartmentId = '';
      } else {
        this.searchTagId = '';
        this.searchDepartmentId = post.department.id;
      }
      this.searchType = 0;
      this.finalKeyWord = '';
      this.searchSolved = '';
      this.searchRefinedMode = 0;
      this.newSearch(bool);
      this.status = 1;
    },
    handleModeSwitch(a, b) {
      this.searchRefinedMode = a;
      this.searchTimeMode = b;
    },
    startTransfer(post) {
      if (post.is_deleted) {
        this.tip('该帖已删除, 如需操作请先恢复该贴', 'warning');
        return;
      }
      this.toTransferPostId = post.id;
      this.toTransferPostTypeId = post.type;
      this.transferShow = true;
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
    cancelFilter() {
      this.showFilter = false;
      this.finalKeyWord = '';
      this.searchTagId = '';
      this.searchDepartmentId = '';
      this.searchRefinedMode = 0;
      this.newSearch();
      this.specifiedTag = false;
    },
    confirmDepartment(e) {
      this.departmentName = e[0].label;
      this.searchDepartmentId = e[0].value;
    },
    confirmModifyType(e) {
      if (e[0].value != this.toTransferPostTypeId)
        transferPostType({
          post_id: this.toTransferPostId,
          new_type_id: e[0].value,
        }).then(res => {
          if (res.code === 200) {
            this.tip('您的类型修改已成功上传', 'success');
            this.transferShow = false;
          } else this.tip('帖子类型修改失败！', 'warning');
        });
      else this.tip('该贴已是此类型！', 'warning');
    },
    toCertainType(typeId, index) {
      this.ptIndex = index;
      this.searchType = typeId;
      if (typeId !== 1) {
        this.searchDepartmentId = '';
        this.departmentName = '';
        this.searchSolved = '';
      }
    },
    postPartition(typeId) {
      if (this.postTypes.length) {
        return this.postTypes.filter(type => type.value == typeId)[0].label;
      } else return '全部';
    },
    picImgSrc(pic) {
      return this.imgHeader + '/thumb/' + pic;
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
    switchFold(report) {
      report.showDetail = !report.showDetail;
    },
    storeReasons(arr) {
      var reasons = [];
      arr.forEach((item, index) => {
        var { reason, uid } = item;
        reason = reason.replace(/\n/g, ' ');
        reasons.push({ reason, uid });
      });
      return reasons;
    },
    // distinct(arr) {
    //   var len = arr.length,
    //     i,
    //     j;
    //   if (len)
    //     for (i = len - 1; i >= 0; i--) {
    //       arr[i] = {
    //         ...arr[i],
    //         list: [
    //           {
    //             reason: arr[i].reason.replace(/\n/g, ' '),
    //             uid: arr[i].uid,
    //           },
    //         ],
    //       };
    //       delete arr[('reason', 'uid')];
    //       if (i) {
    //         for (j = i - 1; j >= 0; j--) {
    //           if (arr[i].post_id === arr[j].post_id && arr[i].floor_id === arr[j].floor_id) {
    //             arr[i].times++;
    //             if (arr[i].list.length < 3)
    //               arr[i].list.push({
    //                 reason: arr[j].reason.replace(/\n/g, ' '),
    //                 uid: arr[j].uid,
    //               });
    //             arr.splice(j, 1);
    //             i--;
    //           }
    //         }
    //       }
    //     }
    //   return arr;
    // },
    sortByTimes(array, keys) {
      return array.sort(function(a, b) {
        return a[keys[0]] > b[keys[0]] //举报次数高者优先
          ? -1
          : a[keys[0]] < b[keys[0]]
          ? 1
          : a[keys[1]] < b[keys[1]] //举报时间早者优先
          ? -1
          : a[keys[1]] > b[keys[1]]
          ? 1
          : 0;
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
@import '../../assets/content.scss';
#loadingReports {
  position: fixed;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
}
.fade-in {
  transition: all 0.5s;
}
.show {
  opacity: 1;
}
.hide {
  opacity: 0;
}
.reason-holder {
  display: flex;
  flex-shrink: 0;
  flex-wrap: wrap;
}
.report-abstract {
  line-height: 20px;
  font-weight: bold;
  color: #363c54;
  text {
    height: 20px;
    width: 100%;
  }
}
.reason-info {
  margin-left: 8rpx;
  color: #989898;
}
.search-delete-holder {
  width: 100rpx;
  height: 54rpx;
  line-height: 54rpx;
  font-size: 26rpx;
  font-weight: bold;
  text-align: center;
}
.sub-title {
  height: 45rpx;
  line-height: 45rpx;
  font-size: 26rpx;
  text-align: center;
  font-weight: bold;
}
.show-more {
  font-size: 26rpx;
  color: #0366d6;
  display: flex;
  margin-right: 30rpx;
  margin-bottom: 3rpx;
  .show-more-item {
    display: flex;
    align-items: center;
  }
}
.rotate {
  transform: rotate(180deg);
}
</style>
