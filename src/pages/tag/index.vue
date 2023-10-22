<template>
  <view>
    <navbar :index="3"></navbar>
    <view id="loading" v-if="isQnhd && !renderFinished">
      <image src="../../static/loading.png" mode="aspectFit" width="250" />
    </view>
    <view id="mainContainer" :style="{ paddingTop: toTop }">
      <view id="typeHolder" v-if="vuex_user.adminType === '超级管理员'">
        <view :class="['type-text', !isQnhd ? 'type-text-active' : '']" @click="isQnhd = false">
          校务专区
        </view>
        <view id="division"></view>
        <view :class="['type-text', isQnhd ? 'type-text-active' : '']" @click="switchToQnhd">
          帖子标签
        </view>
        <view :class="['slider', isQnhd ? 'slider-right' : 'slider-left']"></view>
      </view>
      <view class="contentContainer">
        <view v-show="isQnhd">
          <view class="inputHolder">
            <image src="../../static/search.svg" class="icon-search" @click="tagNewSearch" />
            <input
              type="text"
              class="input-search"
              v-model="search_tag"
              placeholder="搜索帖子标签..."
              @confirm="tagNewSearch"
            />
          </view>

          <scroll-view
            :class="['listContainer', 'fade-in', renderFinished ? 'show' : 'hide']"
            :style="{ height: vuex_user.adminType === '超级管理员' ? superHeight : commonHeight }"
            scroll-y="true"
            @scrolltolower="reachBottom"
          >
            <!-- <view
            :class="['listContainer', 'fade-in', renderFinished ? 'show' : 'hide']"
            :style="{ height: vuex_user.adminType === '超级管理员' ? superHeight : commonHeight }"
          > -->
            <view v-for="(tag, index) in tagsFiltered" :key="tag.id" @click="itemClicked(tag)" class="tag-item">
              <view
                v-if="showOrder && tag.point != 0 && index < 5"
                :class="['tag-symbol', 'tag-order', `tag-order-${index + 1}`]"
              >
                {{ index + 1 }}
              </view>
              <view v-else class="tag-symbol"><image src="../../static/tag.svg" class="icon-tag" /></view>
              <view class="tag-item-text">
                <text v-for="(unit, indexSon) in tag.name.split('**')" :key="indexSon">
                  <text :class="{ strong: indexSon % 2 != 0 }">{{ unit }}</text>
                </text>
              </view>
              <view class="additional">
                <view class="tag-point">{{ tag.point ? tag.point : '' }}</view>
              </view>
              <view :class="['edit-board', tag.focus ? 'show' : 'hide']">
                <view
                  @tap.stop="startExploreTag(tag.id)"
                  class="tag-icon-holder"
                  v-if="vuex_user.adminType === '超级管理员'"
                >
                  <u-icon :name="require('../../static/empty-box.png')" size="30"></u-icon>
                  <text>开盒</text>
                </view>
                <view v-if="vuex_user.adminType === '超级管理员'">|</view>
                <view @tap.stop="startDeleteTag(tag.id)" class="tag-icon-holder">
                  <u-icon name="trash" size="30"></u-icon>
                  <text>删除</text>
                </view>
              </view>
            </view>
            <view :class="['prettier', isEmptyStr(getMoreTip) ? '' : 'extended']">{{ getMoreTip }}</view>
            <!-- </view> -->
          </scroll-view>
        </view>
        <view v-if="vuex_user.adminType === '超级管理员'">
          <view v-show="!isQnhd">
            <view class="inputHolder">
              <image src="../../static/search.svg" class="icon-search" @click="showDeps" />
              <input
                type="text"
                class="input-search"
                v-model="search_dep"
                placeholder="搜索校务部门..."
                @confirm="showDeps"
              />
            </view>
            <view class="listContainer" :style="{ height: superHeight }">
              <view style="margin: 10rpx 20rpx 0">
                <view v-for="dep in departments" :key="dep.id" class="dep-item" @click="startModifyDep(dep)">
                  {{ dep.name }}
                </view>
                <view id="addBtnHolder">
                  <u-button :custom-style="addBtnStyle" ripple @click="newDep = true">+</u-button>
                </view>
              </view>
            </view>
          </view>
        </view>
      </view>
    </view>
    <u-popup v-model="newDep" mode="center" border-radius="30">
      <view style="width: 650rpx; overflow: hidden;">
        <view class="newDepHolder">
          <view class="text">部门</view>
          <view>
            <u-input
              type="text"
              v-model="newDepName"
              placeholder="请输入部门名称"
              height="70"
              :custom-style="newInputStyle"
            />
          </view>
        </view>
        <view class="newDepHolder">
          <view class="text">简介</view>
          <view>
            <u-input
              v-model="newDepIntp"
              type="textarea"
              :height="400"
              :maxlength="1000"
              :auto-height="true"
              :custom-style="textareaStyle"
              placeholder="请输入部门简介"
            />
          </view>
        </view>
        <view class="sureButHolder">
          <u-button :custom-style="btnStyle" ripple @click="addNewDep" :loading="addLoading">
            {{ addLoading ? '创建中' : '确认' }}
          </u-button>
        </view>
      </view>
    </u-popup>
    <u-popup v-model="modifyDep" mode="center" border-radius="30" @close="isModifyingIntp = false">
      <view style="width: 650rpx; overflow: hidden;">
        <view class="newDepHolder">
          <view class="text">部门</view>
          <view style="flex: 1;">
            <u-input
              type="text"
              v-model="departmentTemp.name"
              height="70"
              :custom-style="disabledInputStyle"
              disabled
            />
          </view>
          <view class="delete-dep-holder" v-if="!isModifyingIntp">
            <u-button :custom-style="modifyBtnStyle" ripple @click="startDeleteDep">删除部门</u-button>
          </view>
          <view style="width: 30rpx;"></view>
        </view>
        <view class="newDepHolder">
          <view class="text">简介</view>
          <view>
            <u-input
              v-model="departmentTemp.introduction"
              type="textarea"
              :height="400"
              :maxlength="1000"
              :auto-height="true"
              :disabled="!isModifyingIntp"
              :custom-style="textareaStyle"
              placeholder="部门简介"
            />
          </view>
        </view>
        <view class="modify-dep-holder" v-if="!isModifyingIntp">
          <u-button :custom-style="modifyBtnStyle" ripple @click="isModifyingIntp = true">修改部门简介</u-button>
        </view>
        <view class="sureButHolder" v-else>
          <u-button :custom-style="btnStyle" ripple @click="dealModifyDep" :loading="modifyLoading">
            {{ modifyLoading ? '修改中' : '确认修改' }}
          </u-button>
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
import {
  addDepartment,
  deleteDepartment,
  deleteTag,
  getDepartments,
  getHotTags,
  getTags,
  modifyDepIntroduction,
  revealThroughTag,
} from '../../api';
import navbar from '../../components/navbar/navbar.vue';
export default {
  components: { navbar },
  data() {
    return {
      isQnhd: false,
      search_tag: '',
      search_dep: '',
      tags: [],
      hotTags: [],
      tags_hot_fake: [
        {
          id: 5,
          name: '和青年湖底打招呼',
          point: 2483,
          focus: false,
        },
        {
          id: 9,
          name: 'Tag带😁',
          point: 1632,
          focus: false,
        },
        {
          id: 30,
          name: 'Tag带**加粗字体**',
          point: 1897,
          focus: false,
        },
        {
          id: 23,
          name: '我就是热搜',
          point: 139,
          focus: false,
        },
        {
          id: 25,
          name: '加一个tag',
          point: 56,
          focus: false,
        },
        {
          id: 71,
          name: '吃烧烤',
          point: 32,
          focus: false,
        },
        {
          id: 19,
          name: '最热第一名',
          point: 18361,
          focus: false,
        },
      ],
      showOrder: true,
      delete_tag_id: 0,
      departments: [],
      departmentTemp: {
        id: 0,
        name: 0,
        introduction: '',
      },
      newDepName: '',
      newDepIntp: '',
      newInputStyle: {
        width: '455rpx !important',
        padding: '0 10rpx',
        borderRadius: '15rpx',
        fontSize: '26rpx',
        border: '1.5px solid #f5f5f5',
      },
      disabledInputStyle: {
        fontSize: '26rpx',
        marginLeft: '20rpx',
      },
      textareaStyle: {
        width: '455rpx !important',
        borderRadius: '15rpx',
        border: '1.5px solid #f5f5f5',
        backgroundColor: 'white',
        fontSize: '28rpx',
        padding: '10rpx',
        maxHeight: '800rpx',
      },
      disabledTextareaStyle: {
        borderRadius: '25rpx',
        color: '#6c6c6c',
      },
      btnStyle: {
        width: '200rpx',
        height: '70rpx',
        backgroundColor: '#363C54',
        color: 'white',
      },
      addBtnStyle: {
        height: '45rpx',
        lineHeight: '45rpx',
        borderRadius: '25rpx',
        textAlign: 'center',
        backgroundColor: '#363C54',
        color: 'white',
        fontSize: '30rpx',
      },
      modifyBtnStyle: {
        fontSize: '26rpx',
        height: '70rpx',
        lineHeight: '70rpx',
        fontWeight: 'bold',
        color: 'blue',
        textDecoration: 'underline',
        textAlign: 'center',
        borderRadius: '20rpx',
      },
      addLoading: false,
      modifyLoading: false,
      isModifyingIntp: false,
      newDep: false,
      modifyDep: false,
      makeSure: false,
      actionText: '',
      openBox: false,
      truth: {
        telephone: '',
      },

      pageForTags: 1,
      getMoreTip: '',
      renderFinished: false,
    };
  },
  onLoad() {
    if (this.vuex_user.adminType === '请登录') {
      uni.redirectTo({
        url: '/pages/index/index',
      });
      return;
    }
    getHotTags()
      .then(res => {
        if (res.code === 200)
          res.data.list.forEach(hotTag => {
            this.hotTags.push({
              id: hotTag.tag_id,
              name: hotTag.name,
              point: hotTag.point,
              focus: false,
            });
          });
        else if (res.code === 20001) this.relog();
        else this.tip('获取热榜失败！', 'warning');
      })
      .then(() => {
        if (this.vuex_user.adminType === '学生管理员') {
          this.isQnhd = true;
          this.showTags('init');
        } else {
          this.showDeps('init');
          this.showTags('init');
        }
      });
  },
  computed: {
    tagsFiltered() {
      return this.tags.filter((tag, index) => index < this.pageForTags * 30);
    },
    btnInfo() {
      return this.$store.state.menuButtonInfo;
    },
    toTop() {
      return `calc(${this.btnInfo.top}px + 90rpx)`;
    },
    superHeight() {
      return `calc(100vh - ${this.btnInfo.top + 4}px - 350rpx)`;
    },
    commonHeight() {
      return `calc(100vh - ${this.btnInfo.top + 4}px - 220rpx)`;
    },
  },
  methods: {
    switchToQnhd() {
      if (this.tags == false) this.showTags('init');
      this.isQnhd = true;
    },
    reachBottom() {
      if (this.isQnhd) {
        if (this.tagsFiltered.length === this.pageForTags * 30) this.pageForTags++;
        else this.getMoreTip = '~ 已加载全部 ~';
      }
    },
    tagNewSearch(info) {
      if (this.search_tag.length) this.showOrder = false;
      else this.showOrder = true;
      this.tags = [];
      this.showTags(info);
    },
    showTags(info) {
      this.renderFinished = false;
      var tagStore = [],
        idStore = [];
      getTags({
        name: this.search_tag,
      })
        .then(res => {
          if (res.code === 200) {
            res.data.list.forEach(tag => {
              tagStore.push({
                id: tag.id,
                name: tag.name,
                point: 0,
                focus: false,
              });
              idStore.push(tag.id);
            });
          } else if (res.code === 20001) this.relog();
          else {
            this.tip('获取话题失败！', 'warning');
            this.renderFinished = true;
          }
          return tagStore;
        })
        .then(data => {
          this.hotTags.forEach(hotTag => {
            var replaceIndex = idStore.indexOf(hotTag.id);
            if (replaceIndex !== -1) data.splice(replaceIndex, 1, hotTag);
          });
          return data;
        })
        .then(data => {
          this.tags = this.sortByPoint(data, 'point');
          if (typeof info != 'string') {
            if (this.tags == false) this.tip('暂无相关话题', 'info');
            else this.tip('获取话题成功！', 'success');
          }
          this.renderFinished = true;
        });
    },
    itemClicked(tag) {
      if (tag.focus) {
        tag.focus = false;
        return;
      }
      this.clearFocused();
      tag.focus = true;
    },
    clearFocused() {
      for (var i = 0; i < this.tags.length; i++)
        if (this.tags[i].focus) {
          this.tags[i].focus = false;
          break;
        }
    },
    startDeleteTag(id) {
      this.actionText = '确认删除该话题？[操作不可逆]';
      this.delete_tag_id = id;
      this.makeSure = true;
    },
    startExploreTag(id) {
      revealThroughTag({
        id,
      }).then(res => {
        console.log(res);
        if (res.code === 200) {
          this.truth = res.data.detail;
          this.openBox = true;
        }
      });
    },
    showDeps(info) {
      getDepartments({
        name: this.search_dep,
      }).then(res => {
        if (res.code === 200) {
          this.departments = res.data.list;
          if (typeof info != 'string') {
            if (!res.data.list.length) this.tip('暂无数据', 'info');
            else this.tip('获取部门成功！', 'success');
          }
        } else if (this.code === 20001) this.relog();
        else this.tip('获取部门失败！', 'warning');
      });
    },
    addNewDep() {
      this.addLoading = true;
      if (this.newDepName.length) {
        if (this.newDepIntp.length) {
          addDepartment({
            name: this.newDepName,
            introduction: this.newDepIntp,
          }).then(res => {
            if (res.code === 200) {
              this.newDep = false;
              this.tip('部门添加成功！', 'success');
              this.search_dep = '';
              this.showDeps('update');
            } else if (res.code === 20001) this.relog();
            else this.tip('部门添加失败！', 'warning');
          });
        } else {
          this.tip('部门简介不能为空！', 'warning');
        }
      } else {
        this.tip('部门名称不能为空！', 'warning');
      }
      this.addLoading = false;
      this.newDepName = '';
      this.newDepIntp = '';
    },
    startModifyDep(dep) {
      this.departmentTemp = JSON.parse(JSON.stringify(dep));
      this.modifyDep = true;
    },
    startDeleteDep() {
      this.actionText = '确认删除该部门？[操作不可逆]';
      this.makeSure = true;
    },
    dealModifyDep() {
      this.modifyLoading = true;
      if (this.departmentTemp.introduction.length) {
        modifyDepIntroduction({
          department_id: this.departmentTemp.id,
          introduction: this.departmentTemp.introduction,
        }).then(res => {
          if (res.code === 200) {
            this.modifyDep = false;
            this.tip('部门内容修改成功！', 'success');
            this.search_dep = '';
            this.showDeps('update');
          } else if (res.code === 20001) this.relog();
          else this.tip('部门内容修改失败!', 'warning');
        });
      } else this.tip('部门简介不能为空', 'warning');
      this.modifyLoading = false;
    },
    confirmed() {
      if (this.actionText === '确认删除该话题？[操作不可逆]') {
        deleteTag({
          id: this.delete_tag_id,
        }).then(res => {
          if (res.code === 200) {
            this.tip('话题删除成功！', 'success');
            this.search_tag = '';
            this.tagNewSearch('delete');
          } else if (res.code === 20001) this.relog();
          else this.tip('话题删除失败！', 'warning');
        });
      } else if (this.actionText === '确认删除该部门？[操作不可逆]') {
        deleteDepartment({
          id: this.departmentTemp.id,
        }).then(res => {
          if (res.code === 200) {
            this.modifyDep = false;
            this.tip('部门删除成功！', 'success');
            this.search_dep = '';
            this.showDeps('update');
          } else if (res.code === 20001) this.relog();
          else this.tip('部门删除失败！', 'warning');
        });
      }
    },
    sortByPoint(array, key) {
      return array.sort(function(a, b) {
        var xx = a[key];
        var xy = b[key];
        return xx > xy ? -1 : xx < xy ? 1 : 0;
      });
    },
    isEmptyStr(str) {
      if (str == null || str === '') return true;
      else return false;
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
  box-sizing: border-box;
  background-color: #f5f5f5;
  position: fixed;
  top: 0;
  left: 0;
}
#typeHolder {
  width: calc(100% - 80rpx);
  height: 100rpx;
  margin: auto;
  margin-bottom: 30rpx;
  display: flex;
  background-color: white;
  border-radius: 30rpx;
  transform: scale(1);
  .type-text {
    flex: 1;
    text-align: center;
    font-size: 36rpx;
    font-weight: 500;
    line-height: 85rpx;
    color: #6c6c6c;
  }
  .type-text-active {
    color: #2a2a2a;
  }
  #division {
    width: 2rpx;
    height: 45rpx;
    background-color: #c4c4c4;
    transform: translateY(27.5rpx);
  }
  .slider {
    width: 70rpx;
    height: 6.5rpx;
    background-color: #363c54;
    border-radius: 6rpx;
    transition: all 0.5s;
    position: fixed;
    top: 75rpx;
  }
  .slider-right {
    left: calc(75% - 35rpx);
  }
  .slider-left {
    left: calc(25% - 35rpx);
  }
}
.contentContainer {
  width: calc(100% - 80rpx);
  margin: auto;
  padding: 20rpx 0;
  background-color: white;
  border-radius: 30rpx;
  .inputHolder {
    display: flex;
    margin-left: 40rpx;
    height: 60rpx;
    align-items: center;
    .icon-search {
      width: 36rpx;
      height: 36rpx;
      margin-right: 15rpx;
      cursor: pointer;
    }
    .input-search {
      outline: none;
      font-size: 36rpx;
      color: #2a2a2a;
      width: calc(100% - 140rpx);
      height: 60rpx;
    }
  }
  .listContainer {
    width: 100%;
    padding: 2px 0;
    overflow: auto;
    .tag-item {
      padding: 15rpx 25rpx;
      margin: 5rpx 15rpx;
      font-size: 26rpx;
      display: flex;
      align-items: center;
      border-radius: 15rpx;
      transition: all 0.1s;
      transform: scale(1);
      .tag-symbol {
        width: 32rpx;
        height: 32rpx;
        margin-right: 20rpx;
        display: flex;
        align-items: center;
        justify-content: center;
      }
      .icon-tag {
        width: 32rpx;
        height: 32rpx;
      }
      .tag-item-text {
        width: 210px;
        overflow: hidden; /*超出部分隐藏*/
        white-space: nowrap; /*不换行*/
        text-overflow: ellipsis; /*超出部分文字以...显示*/
        .strong {
          font-weight: bold;
        }
      }
      .additional {
        flex: 1;
        display: flex;
        align-items: center;
        .tag-point {
          flex: 1;
          color: #aaaaaa;
          font-size: 24rpx;
          text-align: right;
        }
        .tag-icon-holder {
          flex: 1;
          display: flex;
          align-items: center;
          cursor: pointer;
        }
      }
      .tag-order {
        color: white;
        border-radius: 10rpx;
      }
      .tag-order-1 {
        background-color: #cf4624;
      }
      .tag-order-2 {
        background-color: #e6611c;
      }
      .tag-order-3 {
        background-color: #ed7f14;
      }
      .tag-order-4 {
        background-color: #f29e11;
      }
      .tag-order-5 {
        background-color: #e8ad10;
      }
    }
    .dep-item {
      background-color: #eaeaea;
      font-size: 24rpx;
      padding: 0 25rpx;
      margin: 15rpx;
      float: left;
      height: 45rpx;
      line-height: 45rpx;
      border-radius: 25rpx;
    }
    #addBtnHolder {
      width: 100rpx;
      float: left;
      margin: 15rpx;
    }
  }
}
.contentContainer ::-webkit-scrollbar {
  width: 0;
  height: 0;
  background-color: transparent;
}
.newDepHolder {
  display: flex;
  width: 610rpx;
  margin: 30rpx 15rpx 30rpx 25rpx;
  .text {
    width: 90rpx;
    flex-shrink: 0;
    font-size: 32rpx;
    font-weight: bold;
    height: 70rpx;
    line-height: 70rpx;
  }
  .delete-dep-holder {
    flex-shrink: 0;
    width: 160rpx;
  }
}
.modify-dep-holder {
  width: 200rpx;
  margin-left: 410rpx;
  margin-bottom: 20rpx;
}
.sureButHolder {
  width: 200rpx;
  margin-left: calc(50% - 100rpx);
  margin-bottom: 20rpx;
}
.box-title {
  text-align: left;
  font-size: 26rpx;
  color: #363c54;
  line-height: 50rpx;
}
.edit-board {
  position: fixed;
  left: 0;
  top: 0;
  background-image: linear-gradient(to right bottom, rgba(255, 255, 255, 0.6), rgba(255, 255, 255, 0.1));
  backdrop-filter: blur(8px);
  transition: all 0.2s;
  border-radius: 15rpx;
  width: 100%;
  height: 100%;
  display: flex;
  justify-content: space-evenly;
  align-items: center;
  font-size: 26rpx;
  .tag-icon-holder {
    padding: 0 20rpx;
    display: flex;
    align-items: center;
    text {
      margin-left: 15rpx;
    }
  }
}
#loading {
  position: fixed;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  z-index: 10;
}
.fade-in {
  transition: all 0.2s;
}
.show {
  opacity: 1;
}
.hide {
  opacity: 0;
  z-index: -1;
}
.prettier {
  height: 10rpx;
  width: 100%;
}
.extended {
  height: 60rpx;
  font-size: 30rpx;
  line-height: 60rpx;
  text-align: center;
  font-weight: 800;
}
</style>
