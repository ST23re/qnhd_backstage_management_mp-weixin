<template>
  <view style="overflow: hidden;">
    <navbar :index="7"></navbar>
    <view id="loadingReports" v-show="!renderFinished">
      <image src="../../static/loading.png" mode="aspectFit" width="250" />
    </view>
    <view :style="{ marginTop: toTop }">
      <view id="add-search-area">
        <view class="subTitle">管理员 查询 | 注册</view>
        <view style="display:flex;justify-content:center;">
          <u-button :custom-style="{ ...btnZero, top: toTop }" ripple @click="startNewing">
            注册以分配
          </u-button>
        </view>
        <view style="display: flex;">
          <view class="input-holder">
            <input
              type="text"
              placeholder="查询人员(账号)"
              v-model="val_search"
              :class="{ 'input-focus': in_search }"
              @focus="in_search = true"
              @blur="in_search = false"
              @confirm="newSearch"
            />
            <view id="clearIcon">
              <u-icon name="close-circle-fill" size="35" v-if="val_search" @click="clearInput"></u-icon>
            </view>
          </view>
          <view style="width: 180rpx; display: flex; justify-content: space-around;">
            <view>
              <u-button :custom-style="btnOne" ripple @click="startFilter">
                <u-icon :name="require('../../static/filter.png')" size="36"></u-icon>
              </u-button>
            </view>
            <view>
              <u-button :custom-style="btnOne" ripple @click="newSearch" :loading="searchLoading">
                <u-icon name="search" size="36" color="#363c54" v-if="!searchLoading"></u-icon>
                <text v-if="searchLoading">···</text>
              </u-button>
            </view>
          </view>
        </view>
      </view>
      <view class="admin-list">
        <view class="subTitle modified">
          管理员列表
          <text style="margin-left: 30rpx; font-size: 24rpx">共计：{{ total }} 位</text>
        </view>
        <scroll-view id="list" :style="{ height: adminsHeight }" scroll-y="true" @scrolltolower="reachBottom">
          <view :class="['fade-in', renderFinished ? 'show' : 'hide']">
            <view v-for="(admin, index) in adminList" :key="index" class="list-item">
              <view>
                <image
                  class="account-icon"
                  :src="
                    admin.is_sch_admin || admin.is_stu_admin
                      ? require('../../static/admin.svg')
                      : require('../../static/admin-initial.svg')
                  "
                />
              </view>
              <view class="flex-column" style="flex: 1;">
                <view class="item">账号：{{ admin.nickname }}</view>
                <view class="item">电话：{{ admin.phone_number.trim().length ? admin.phone_number : '暂无' }}</view>
                <view class="item">
                  身份：{{
                    admin.is_sch_admin
                      ? `校管--${admin.department_name.trim().length ? admin.department_name : '未分配部门'}`
                      : admin.is_stu_admin
                      ? '学生管理员'
                      : '未分配'
                  }}
                </view>
              </view>
              <view class="flex-buttons">
                <u-button ripple :custom-style="btnThree" @click="admSetting(admin, 'info')">
                  <u-icon name="setting-fill" size="36"></u-icon>
                  <view>信息</view>
                </u-button>
                <u-button ripple :custom-style="btnThree" @click="admSetting(admin, 'power')">
                  <u-icon name="setting-fill" size="36"></u-icon>
                  <view>权限</view>
                </u-button>
              </view>
            </view>
            <view id="getMoreTip">{{ getMoreTip }}</view>
          </view>
        </scroll-view>
      </view>
      <u-popup v-model="infoShow" mode="center" border-radius="20">
        <view style="width: 510rpx; padding: 30rpx">
          <view class="info-holder">
            <view class="info-item">账号：{{ adminTemp.nickname }}</view>
            <view class="action-button">
              <u-button :custom-style="delBtnStyle" ripple @click="startDeleteAdmin">删除</u-button>
            </view>
          </view>
          <view class="info-holder">
            <view class="info-item">
              电话：
              <view class="action-link" @click="changePhoneShow = true">
                {{ adminTemp.phone_number.trim().length ? adminTemp.phone_number : '暂无' }}
              </view>
            </view>
          </view>
          <view class="info-holder">
            <view class="info-item">
              密码：
              <view class="action-link" @click="changePassShow = true">修改密码</view>
            </view>
          </view>
        </view>
      </u-popup>

      <u-popup v-model="changePhoneShow" mode="center" border-radius="20">
        <view style="padding: 20rpx 0">
          <view class="item" style="text-align: center; font-size: 32rpx;">请输入新手机号</view>
          <input
            class="input-normal"
            style="display: block; top: 0; left: 0; margin: 10rpx 20rpx 15rpx"
            v-model="changePhone"
          />
          <view style="display: flex;justify-content: center;">
            <u-button
              type="primary"
              size="medium"
              :custom-style="btnTwo"
              ripple
              @click="changeInfo('phone')"
              :loading="changeLoading"
            >
              {{ changeLoading ? '修改中' : '确认' }}
            </u-button>
          </view>
        </view>
      </u-popup>

      <u-popup v-model="changePassShow" mode="center" border-radius="20">
        <view style="padding: 20rpx 0">
          <view class="item" style="text-align: center; font-size: 32rpx;">请输入新密码</view>
          <input
            class="input-normal"
            style="display: block; top: 0; left: 0; margin: 10rpx 20rpx 15rpx"
            v-model="changePass"
          />
          <view style="display: flex;justify-content: center;">
            <u-button
              type="primary"
              size="medium"
              :custom-style="btnTwo"
              ripple
              @click="changeInfo('password')"
              :loading="changeLoading"
            >
              {{ changeLoading ? '修改中' : '确认' }}
            </u-button>
          </view>
        </view>
      </u-popup>

      <u-popup v-model="filterShow" mode="center" border-radius="20">
        <view style="padding:20rpx 5rpx 15rpx;">
          <view style="padding: 20rpx;">
            <u-radio-group v-model="filterValue">
              <u-radio :name="1">只看学管</u-radio>
              <u-radio :name="2">只看校管</u-radio>
            </u-radio-group>
          </view>
          <view v-if="filterValue === 2" class="select-holder">
            <view class="select-btn-holder">
              <u-button :custom-style="selectBtnStyle" ripple @click="showDepartments = true">
                {{ departmentName === '' ? '只看指定部门' : departmentName }}
              </u-button>
            </view>
          </view>
          <view style="display: flex;justify-content: space-evenly;">
            <u-button
              type="primary"
              size="medium"
              :custom-style="btnTwo"
              ripple
              @click="cancelFilter"
              v-if="is_filtered"
            >
              取消筛选
            </u-button>
            <u-button type="primary" size="medium" :custom-style="btnTwo" ripple @click="filterAdmin">确认</u-button>
          </view>
        </view>
      </u-popup>
      <u-popup v-model="powerShow" mode="center" border-radius="20">
        <view style="padding:20rpx 5rpx 15rpx;">
          <view style="padding: 20rpx;">
            <u-radio-group v-model="radioValue">
              <u-radio :name="1">学生管理员</u-radio>
              <u-radio :name="2">校方管理员</u-radio>
            </u-radio-group>
          </view>
          <view v-if="radioValue === 2" class="select-holder">
            <view class="select-btn-holder">
              <u-button :custom-style="selectBtnStyle" ripple @click="showDepartments = true">
                {{ departmentName === '' ? '请选择一个部门' : departmentName }}
              </u-button>
            </view>
          </view>
          <view style="display: flex;justify-content: center;">
            <u-button type="primary" size="medium" :custom-style="btnTwo" ripple @click="dispatchRight">确认</u-button>
          </view>
        </view>
      </u-popup>
      <u-popup v-model="newShow" mode="center" border-radius="20">
        <view class="title">注册人员</view>
        <view class="it">账号</view>
        <input type="text" class="input-normal" style="margin: 10rpx 20rpx 20rpx 20rpx" v-model="newName" />
        <view class="it">密码</view>
        <input type="text" class="input-normal" style="margin: 10rpx 20rpx 20rpx 20rpx" v-model="newPassword" />
        <view class="it">电话</view>
        <input type="text" class="input-normal" style="margin: 10rpx 20rpx 20rpx 20rpx" v-model="newPhoneNumber" />
        <view style="display: flex; justify-content: center; padding-bottom: 15rpx">
          <u-button type="primary" size="medium" :custom-style="btnTwo" ripple @click="newAdmin" :loading="newLoading">
            {{ newLoading ? '创建中' : '确认' }}
          </u-button>
        </view>
      </u-popup>
      <u-select
        v-model="showDepartments"
        mode="single-column"
        :list="departmentList"
        @confirm="confirmDepartment"
      ></u-select>
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
  </view>
</template>

<script>
import {
  changeAdminInfo,
  changeRight,
  deleteAdmin,
  getAdmin,
  getDepartments,
  modifyDepartment,
  newUser,
} from '../../api';
import navbar from '../../components/navbar/navbar.vue';
export default {
  components: { navbar },
  data() {
    return {
      adminList: [],
      adminTemp: {
        active: 1,
        department_introduction: '',
        department_name: '',
        id: 0,
        is_sch_admin: false,
        is_stu_admin: false,
        is_super: false,
        is_user: false,
        number: '',
        phone_number: '',
      },
      departmentList: [],
      val_search: '',
      in_search: false,
      searchLoading: false,
      is_filtered: false,
      filterValue: 0,
      filterShow: false,

      btnZero: {
        width: '175rpx',
        height: '70rpx',
        color: 'white',
        fontSize: '26rpx',
        borderRadius: '20rpx',
        backgroundColor: '#363c54',
        boxShadow: '1px 1px 2px rgba(0, 0, 0, 0.2)',
        position: 'absolute',
        right: '50rpx',
      },
      btnOne: {
        width: '70rpx',
        height: '70rpx',
        borderRadius: '25rpx',
        backgroundColor: '#f5f5f5',
        boxShadow: '1px 1px 2px rgba(0, 0, 0, 0.2)',
        margin: 'auto',
        transform: 'translateX(5rpx)',
        zIndex: '2',
      },
      btnTwo: {
        width: '100rpx',
        height: '70rpx',
        backgroundColor: '#363c54',
      },
      btnThree: {
        width: '150rpx',
        height: '60rpx',
        borderRadius: '20rpx',
        boxShadow: '1px 1px 2px rgba(0, 0, 0, 0.2)',
        fontSize: '26rpx',
      },
      selectBtnStyle: {
        borderRadius: '20rpx',
        border: '1px solid #c0c4cc',
      },
      delBtnStyle: {
        backgroundColor: '#363c54',
        boxShadow: '1px 1px 2px rgba(0, 0, 0, 0.2)',
        color: 'white',
        height: '50rpx',
        lineHeight: '50rpx',
        fontSize: '26rpx',
      },
      infoShow: false,
      changePassShow: false,
      changePhoneShow: false,
      changePass: '',
      changePhone: '',
      changeLoading: false,
      powerShow: false,
      radioValue: 0,
      newShow: false,
      newName: '',
      newPassword: '',
      newPhoneNumber: '',
      newLoading: false,
      departmentName: '',
      departmentId: 0,
      showDepartments: false,
      makeSure: false,
      actionText: '',
      pageForAdmins: 1,
      getMoreTip: '',

      renderFinished: false,
    };
  },
  onLoad() {
    if (this.vuex_user.adminType != '超级管理员')
      uni.redirectTo({
        url: '/pages/index/index',
      });
    else {
      getDepartments({}).then(res => {
        if (res.code === 200) {
          res.data.list.forEach(dep => {
            this.departmentList.push({
              value: dep.id,
              label: dep.name,
            });
          });
        } else this.tip('获取部门列表失败');
      });
      this.showAdmin();
    }
  },
  computed: {
    total() {
      return this.adminList.length;
    },
    btnInfo() {
      return this.$store.state.menuButtonInfo;
    },
    toTop() {
      return `calc(${this.btnInfo.top}px + 90rpx)`;
    },
    adminsHeight() {
      return `calc(100vh - ${this.btnInfo.top}px - 410rpx)`;
    },
  },
  methods: {
    reachBottom() {
      if (this.adminList.length === this.pageForAdmins * 50) {
        this.pageForAdmins++;
        this.showAdmin();
      } else this.getMoreTip = '~ 已加载全部 ~';
    },
    newSearch(info) {
      this.adminList = [];
      this.pageForAdmins = 1;
      if (info === 'update') this.val_search = '';
      this.showAdmin(info);
      this.getMoreTip = '';
    },
    showAdmin(info) {
      let admin_n = '';
      if (this.nameValidation(this.val_search)) admin_n = this.val_search;
      else if (this.val_search != '') {
        this.tip('查询条件有误！', 'warning');
        return;
      }
      this.searchLoading = true;
      this.renderFinished = false;
      setTimeout(() => {
        getAdmin({
          user: admin_n,
          page: this.pageForAdmins,
          page_size: 50,
        }).then(res => {
          if (res.code == 200) {
            this.adminList = [...this.adminList, ...res.data.list];
            if (this.adminList.length != 0) {
              if (info !== 'update') this.tip('获取列表成功！', 'success');
            } else this.tip('暂无管理员数据', 'info');
            setTimeout(() => {
              this.renderFinished = true;
            }, 500);
          } else if (res.code === 20001) {
            this.relog();
          } else {
            this.tip('获取列表失败！', 'warning');
            this.renderFinished = true;
          }
        });
      }, 500);
      this.searchLoading = false;
    },
    startFilter() {
      this.filterValue = 0;
      this.departmentName = '';
      this.filterShow = true;
    },
    filterAdmin() {
      if (this.filterValue === 0) return this.tip('未添加筛选条件！', 'warning');
      this.filterShow = false;
      this.searchLoading = true;
      this.renderFinished = false;
      this.adminList = [];
      let type = this.filterValue === 1 ? 'is_stu_admin' : 'is_sch_admin';
      setTimeout(() => {
        getAdmin({
          user: '',
          page_disable: 1,
        }).then(res => {
          if (res.code == 200) {
            res.data.list.forEach(admin => {
              if (admin[type]) {
                if (this.filterValue === 1 || this.departmentName === '') this.adminList.push(admin);
                else if (admin['department_name'] === this.departmentName) this.adminList.push(admin);
              }
            });
            this.is_filtered = true;
            if (this.adminList.length) this.tip('获取列表成功！', 'success');
            else this.tip('暂无相关数据', 'info');
            setTimeout(() => {
              this.renderFinished = true;
            }, 500);
          } else if (res.code === 20001) {
            this.relog();
          } else {
            this.tip('获取列表失败！', 'warning');
            this.renderFinished = true;
          }
        });
      }, 500);
      this.searchLoading = false;
    },
    cancelFilter() {
      this.filterShow = false;
      this.filterValue = 0;
      this.departmentName = '';
      this.is_filtered = false;
      this.newSearch('update');
    },
    startNewing() {
      this.newName = '';
      this.newPassword = '';
      this.newPhoneNumber = '';
      this.newShow = true;
    },
    newAdmin() {
      this.newLoading = true;
      if (this.newName != '' && this.nameValidation(this.newName)) {
        if (this.newPassword != null && this.newPassword !== '') {
          if (this.newPhoneNumber != '' && this.phoneValidation(this.newPhoneNumber)) {
            newUser({
              nickname: this.newName,
              password: this.$md5(this.newPassword),
              phone_number: this.newPhoneNumber,
            }).then(res => {
              if (res.code === 200) {
                this.newShow = false;
                this.newSearch('update');
                this.tip('管理员注册成功！', 'success');
              } else if (res.code === 10004) this.tip('该用户已存在', 'warning');
              else if (res.code === 20001) this.relog();
              else this.tip('管理员注册失败！', 'warning');
            });
          } else this.tip('手机号不合法', 'warning');
        } else this.tip('密码不能为空', 'warning');
      } else this.tip('账号限制为中、英文，数字，下划线', 'warning');
      this.newLoading = false;
    },
    admSetting(admin, type) {
      this.adminTemp = JSON.parse(JSON.stringify(admin));
      if (type === 'info') this.startChanging();
      else if (type === 'power') this.startDispatching();
      else return;
    },
    startChanging() {
      this.infoShow = true;
      this.changePass = '';
      this.changePhone = '';
    },
    changeInfo(type) {
      if (type === 'phone') {
        if (!this.phoneValidation(this.changePhone)) {
          this.tip('不是有效的手机号码！', 'warning');
          return;
        }
      } else if (type === 'password') {
        if (this.changePass == null || this.changePass === '') {
          this.tip('请输入新密码！', 'warning');
          return;
        }
      }
      this.changeLoading = true;
      changeAdminInfo({
        uid: this.adminTemp.id,
        new_password: this.$md5(this.changePass),
        new_phone: this.changePhone,
      }).then(res => {
        if (res.code === 200) {
          if (type === 'phone') {
            this.tip('手机号码修改成功！', 'success');
            this.changePhoneShow = false;
          } else if (type === 'password') {
            this.tip('修改密码成功！', 'success');
            this.changePassShow = false;
          }
          this.infoShow = false;
        } else if (res.code === 20001) {
          this.relog();
        } else {
          this.tip('修改密码失败！', 'warning');
        }
      });
      this.changeLoading = false;
    },
    startDeleteAdmin() {
      this.actionText = '确认删除此管理员？[操作不可逆]';
      this.makeSure = true;
    },
    startDispatching() {
      this.radioValue = this.getInitialValue(this.adminTemp);
      this.departmentName = '';
      this.departmentId = 0;
      this.powerShow = true;
    },
    dispatchRight() {
      if (this.radioValue === 0) {
        this.tip('请选择一种身份！', 'warning');
        return;
      } else if (this.radioValue === this.getInitialValue(this.adminTemp)) {
        if (this.radioValue === 1) {
          this.tip('身份未变化！', 'warning');
          return;
        } else {
          //this.radioValue === 2
          if (this.departmentName === '') {
            this.tip('请选择一个部门！', 'warning');
            return;
          } else if (this.departmentName === this.adminTemp.department_name) {
            this.tip('身份未变化！', 'warning');
            return;
          }
        }
      }
      this.actionText = '确认更改用户权限？';
      this.makeSure = true;
    },
    getInitialValue(obj) {
      if (Object.keys(obj).length) {
        return obj.is_sch_admin ? 2 : obj.is_stu_admin ? 1 : 0;
      } else return 0;
    },
    confirmDepartment(e) {
      this.departmentName = e[0].label;
      this.departmentId = e[0].value;
    },
    confirmed() {
      if (this.actionText === '确认更改用户权限？') {
        let obj = {};
        if (this.radioValue === 1)
          obj = {
            uid: this.adminTemp.id,
            sch_admin: 0,
            stu_admin: 1,
          };
        else
          obj = {
            uid: this.adminTemp.id,
            sch_admin: 1,
            stu_admin: 0,
          };
        changeRight(obj).then(res => {
          if (res.code === 200) {
            if (this.radioValue === 2) {
              modifyDepartment({
                uid: this.adminTemp.id,
                department_id: this.departmentId,
              }).then(res => {
                if (res.code === 200) {
                  this.newSearch('update');
                  this.tip('权限分配成功！', 'success');
                } else if (res.code === 20001) {
                  this.relog();
                } else this.tip('权限分配失败！', 'warning');
              });
              return;
            } else {
              this.newSearch('update');
              this.tip('权限分配成功！', 'success');
            }
          } else if (res.code === 20001) {
            this.relog();
          } else this.tip('权限分配失败！', 'warning');
        });
        this.powerShow = false;
      } else if (this.actionText === '确认删除此管理员？[操作不可逆]') {
        deleteAdmin({
          user_id: this.adminTemp.id,
        }).then(res => {
          if (res.code === 200) {
            this.newSearch('update');
            this.tip('删除管理员成功！', 'success');
          } else if (res.code === 20001) this.relog();
          else this.tip('删除管理员失败！', 'warning');
        });
        this.infoShow = false;
      }
    },
    clearInput() {
      this.val_search = '';
      this.newSearch();
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
    nameValidation(number) {
      var reg = /^(?!_)(?!.*?_$)[a-zA-Z0-9_\u4e00-\u9fa5]+$/; //限制中英文数字下划线
      return reg.test(number);
    },
    phoneValidation(phone_number) {
      var reg = /^1(3|4|5|6|7|8|9)\d{9}$/;
      return reg.test(phone_number);
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
#add-search-area {
  padding: 0 50rpx;
  height: 200rpx;
}
.subTitle {
  color: #363c54;
  font-size: 36rpx;
  padding-left: 10rpx;
  padding-top: 10rpx;
  padding-bottom: 40rpx;
}
.modified {
  padding-top: 0rpx;
  padding-left: 60rpx;
  padding-bottom: 30rpx;
}
.input-holder {
  transform: scale(1);
  flex: 1;
  input {
    height: 70rpx;
    padding: 0 70rpx 0 50rpx;
    margin-right: 15rpx;
    text-align: center;
    font-size: 26rpx;
    border-radius: 20rpx;
    box-sizing: border-box;
    background-color: #f5f5f5;
    box-shadow: 1px 1px 2px rgba(0, 0, 0, 0.2);
  }
}
.input-normal {
  width: 470rpx;
  height: 70rpx;
  outline: none;
  text-align: center;
  font-size: 26rpx;
  transition: 0.3s ease-in;
  opacity: 0.8;
  background-color: rgb(250, 250, 250);
  border: 2px solid #ddd;
  color: #363c54;
  font-family: Roboto, sans-serif;
  border-radius: 20rpx;
  box-sizing: border-box;
  margin: auto;
}
.input-focus {
  background-color: rgb(255, 255, 255);
  opacity: 1;
}
#clearIcon {
  width: 70rpx;
  height: 70rpx;
  position: fixed;
  top: 0rpx;
  right: 15rpx;
  z-index: 3;
  display: flex;
  justify-content: center;
  align-items: center;
}
.admin-list {
  padding: 10rpx 0 20rpx;
  color: #363c54;
  font-family: Roboto, sans-serif;
  font-size: 36rpx;
  overflow: hidden;
}
#list {
  width: calc(100% - 60rpx);
  margin: auto;
  overflow: auto;
}
.list-item {
  display: flex;
  padding: 10rpx;
  background-color: #f5f5f5;
  border-radius: 15rpx;
  margin: auto 20rpx 10rpx;
  box-shadow: 3px 3px 3px rgba(0, 0, 0, 0.2);
}
.item {
  font-size: 26rpx;
  color: #363c54;
  padding: 5rpx;
}
.flex-column {
  display: flex;
  flex-direction: column;
  justify-content: space-evenly;
}
.link-class {
  color: #007acc;
  cursor: pointer;
}
.title {
  font-size: 36rpx;
  text-align: center;
  padding: 15rpx;
}
.it {
  font-size: 26rpx;
  padding-left: 40rpx;
}
.account-icon {
  padding: 0 15rpx 0 10rpx;
  position: relative;
  top: 50%;
  transform: translateY(-50%);
  width: 80rpx;
  height: 80rpx;
  color: #363c54;
}
.select-holder {
  padding: 0 20rpx 20rpx;
}
.select-btn-holder {
  width: 100%;
}
.flex-buttons {
  display: flex;
  flex-direction: column;
  width: 150rpx;
  margin-right: 20rpx;
  justify-content: space-around;
}
#getMoreTip {
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
.info-holder {
  font-size: 26rpx;
  display: flex;
  padding-left: 5rpx;
  height: 50rpx;
}
.info-item {
  flex: 1;
  display: flex;
  line-height: 50rpx;
}
.action-button {
  width: 100rpx;
}
.action-link {
  color: #007acc;
  text-decoration: underline;
}
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
</style>
