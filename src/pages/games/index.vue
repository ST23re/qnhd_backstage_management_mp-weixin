<template>
  <view>
    <navbar :index="8"></navbar>
    <view id="mainContainer" :style="{ paddingTop: toTop }">
      <view v-for="(game, index) in games" :key="game.title" class="game-card" @click="clickHandler(game)">
        <view class="game-content-holder">
          <view class="game-title">{{ game.title }}</view>
          <view class="game-intp">
            <text>{{ game.introduction }}</text>
          </view>
          <!-- <view class="game-url">
              <u-link :href="game.link_url" :under-line="true">{{ game.link_url }}</u-link>
            </view> -->
        </view>
        <view class="game-pic-holder" v-if="game.image_url">
          <view style="flex: 1;"></view>
          <image :src="game.image_url.replace(/[\r\n]/g, '')" mode="aspectFit" class="game-pic"></image>
          <view style="flex: 1;"></view>
        </view>
        <view :class="['edit-board', game.showEdit ? 'show' : 'hide']">
          <view class="item" @tap.stop="prepareToModify(game, index)">
            <u-icon name="edit-pen" color="#363c54" size="28"></u-icon>
            <text class="item-text">编辑</text>
          </view>
          |
          <view class="item" @tap.stop="prepareToDelete(game, index)">
            <u-icon name="trash" color="#363c54" size="28"></u-icon>
            <text class="item-text">删除</text>
          </view>
        </view>
      </view>
      <view id="addBtnHolder">
        <u-button :custom-style="addBtnStyle" ripple @click="prepareToAdd">+ 添加</u-button>
      </view>
    </view>
    <u-popup v-model="newGame" mode="center" border-radius="30" width="690" height="780">
      <view class="new-card">
        <view class="item">
          <view class="item-text">标题：</view>
          <u-input
            type="text"
            v-model="gameTemp.title"
            :custom-style="active_input"
            height="50"
            placeholder="请输入游戏标题"
          />
        </view>
        <view class="item">
          <view class="item-text">简介：</view>
          <u-input
            type="textarea"
            v-model="gameTemp.introduction"
            :custom-style="active_input"
            maxlength="1000"
            height="300"
            placeholder="请输入游戏简介"
          />
        </view>
        <view class="item">
          <view class="item-text">链接：</view>
          <u-input
            type="text"
            v-model="gameTemp.link_url"
            :custom-style="active_input"
            height="50"
            placeholder="请输入跳转链接"
          />
        </view>
        <view class="item">
          <view class="item-text">图片：</view>
          <view class="new-pic-holder" @click="startChooseImg">
            <view class="addpic" v-if="gameTemp.image_url == ''">+</view>
            <view class="delpic" v-else @tap.stop="gameTemp.image_url = ''">
              <u-icon
                name="close"
                :custom-style="{
                  color: 'rgba(42, 42, 42, 0.5)',
                  transform: 'scale(0.5)',
                }"
                size="45"
              ></u-icon>
            </view>
            <image
              :src="gameTemp.image_url.replace(/[\r\n]/g, '')"
              mode="aspectFit"
              class="new-pic"
              v-if="gameTemp.image_url"
            />
          </view>
        </view>
        <view class="sure-btn-holder">
          <u-button type="primary" ripple :custom-style="btnTwo" @click="startPublish" :loading="publishLoading">
            {{ publishLoading ? '上传中...' : status == 0 ? '确认修改' : '确认' }}
          </u-button>
        </view>
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
import { getGames, modifyGames } from '../../api';
import navbar from '../../components/navbar/navbar.vue';
export default {
  components: { navbar },
  data() {
    return {
      games: [],
      tempBase64: '',
      defaultData: [
        {
          title: '北洋维基',
          introduction: 'Wikipedia of TJU',
          image_url: '',
          link_url: 'https://wiki.tjubot.cn',
        },
        {
          title: '52Hz',
          introduction:
            '52Hz的我\n是无数次想要触碰又收回的手\n在这里你可以进行一场“零风险表白”\n发出你独特的“频率”\n期待Ta与你的共鸣',
          image_url: '',
          link_url: 'https://52Hz.twt.edu.cn',
        },
      ],
      newGame: false,
      addBtnStyle: {
        height: '70rpx',
        lineHeight: '70rpx',
        borderRadius: '30rpx',
        textAlign: 'center',
        backgroundColor: 'white',
        color: '#363C54',
        fontSize: '30rpx',
        fontWeight: 'bold',
      },
      active_input: {
        width: '480rpx',
        fontSize: '26rpx',
        lineHeight: '50rpx',
        backgroundColor: 'white',
        border: '1.5px solid #ddd',
        borderRadius: '15rpx',
        padding: '0 10rpx',
        textAlign: 'left',
      },
      btnTwo: {
        width: '240rpx',
        height: '60rpx',
        backgroundColor: '#3f465b',
      },
      gameTemp: {
        title: '',
        introduction: '',
        image_url: '',
        link_url: '',
      },
      status: 0,
      publishLoading: false,
      actionIndex: -1,
      makeSure: false,
      actionText: '',
    };
  },
  onLoad() {
    if (this.vuex_user.adminType === '请登录')
      uni.redirectTo({
        url: '/pages/index/index',
      });
    else this.showGames();
  },
  computed: {
    toTop() {
      let info = this.$store.state.menuButtonInfo;
      return `calc(${info.top}px + 90rpx)`;
    },
  },
  methods: {
    showGames() {
      getGames().then(res => {
        if (res.code === 200) {
          var pretreat = JSON.parse(res.data.content);
          if (pretreat.length) {
            this.games = pretreat;
            for (var i = 0; i < this.games.length; i++)
              this.games[i] = {
                ...this.games[i],
                showEdit: false,
              };
            this.games = JSON.parse(JSON.stringify(this.games)); // to solve an unknown bug
            this.tip('游戏列表获取成功！', 'success');
          } else {
            this.games = this.defaultData;
            this.tip('暂无游戏数据，已展示默认数据。', 'info');
          }
        } else if (res.code === 20001) this.relog();
        else this.tip('游戏列表获取失败！', 'warning');
      });
    },
    clickHandler(game) {
      var preBool = game.showEdit;
      if (preBool === undefined) {
        this.tip('默认数据无法更改！', 'warning');
        return;
      }
      if (!preBool)
        for (var i = 0; i < this.games.length; i++)
          if (this.games[i].showEdit) {
            this.games[i].showEdit = false;
            break;
          }
      game.showEdit = !preBool;
      this.status = 0;
    },
    startChooseImg() {
      var self = this;
      uni.chooseImage({
        count: 1,
        // sizeType: ['original'],
        success: function(res) {
          self.gameTemp.image_url = res.tempFilePaths[0];
        },
      });
    },
    prepareToAdd() {
      this.gameTemp = {
        title: '',
        introduction: '',
        image_url: '',
        link_url: '',
      };
      this.status = 1;
      this.newGame = true;
    },
    prepareToModify(game, index) {
      this.gameTemp = JSON.parse(JSON.stringify(game));
      this.actionIndex = index;
      this.newGame = true;
    },
    startPublish() {
      var self = this;
      this.publishLoading = true;
      if (this.gameTemp.title.length && this.gameTemp.introduction.length) {
        if (this.isURL(this.gameTemp.link_url)) {
          if (this.gameTemp.image_url != '') {
            if (this.gameTemp.image_url.substr(0, 21) != 'data:image/png;base64')
              uni.getFileSystemManager().readFile({
                filePath: this.gameTemp.image_url,
                encoding: 'base64',
                success: res => {
                  var base64URL = 'data:image/png;base64,' + res.data;
                  this.gameTemp.image_url = base64URL.replace(/[\r\n]/g, '');
                  operate();
                },
              });
          }
          operate();
        } else {
          this.tip('不是有效的链接！', 'warning');
          this.publishLoading = false;
        }
      } else {
        this.tip('游戏标题、简介不能为空！', 'warning');
        this.publishLoading = false;
      }
      function operate() {
        if (self.status === 0) {
          //修改
          var arr = [...self.games];
          arr[self.actionIndex] = self.gameTemp;
          self.modifyList(arr);
        } else {
          //新建
          self.modifyList([...self.games, self.gameTemp]);
        }
      }
    },
    prepareToDelete(game, index) {
      this.gameTemp = JSON.parse(JSON.stringify(game));
      this.actionIndex = index;
      this.actionText = '确认删除游戏？[操作不可逆]';
      this.makeSure = true;
    },
    confirmed() {
      var arr = [...this.games];
      arr.splice(this.actionIndex, 1);
      this.modifyList(arr);
    },
    modifyList(data) {
      modifyGames({
        content: JSON.stringify(data),
      }).then(res => {
        if (res.code === 200) {
          this.tip('游戏列表修改成功', 'success');
          this.newGame = false;
          this.gameTemp = {
            title: '',
            introduction: '',
            image_url: '',
            link_url: '',
          };
          this.showGames();
        } else if (res.code === 20001) this.relog();
        else this.tip('游戏列表修改失败！', 'warning');
      });
      this.publishLoading = false;
    },
    // getBase64FromImageURL(url, callback) {
    //   var canvas = document.createElement("canvas"),
    //     ctx = canvas.getContext("2d"),
    //     img = new Image(),
    //     base64URL;
    //   img.crossOrigin = "Anonymous";
    //   img.onload = function() {
    //     canvas.height = img.height;
    //     canvas.width = img.width;
    //     ctx.drawImage(img, 0, 0);
    //     base64URL = canvas.toDataURL("image/png");
    //     callback(base64URL);
    //     canvas = null;
    //   };
    //   img.src = url;
    // },
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
}
.game-card {
  background-color: white;
  border-radius: 30rpx;
  width: calc(100% - 80rpx);
  padding: 20rpx;
  margin: auto;
  margin-bottom: 20rpx;
  display: flex;
  font-size: 26rpx;
  transform: scale(1);
  .game-content-holder {
    flex: 1;
    display: flex;
    flex-direction: column;
    padding: 0 0 10rpx 5rpx;
    .game-title {
      font-size: 32rpx;
      font-weight: bold;
    }
    .game-intp {
      flex: 1;
      word-break: break-all;
      margin-top: 10rpx;
      margin-bottom: 10rpx;
    }
  }
  .game-pic-holder {
    flex-shrink: 0;
    display: flex;
    flex-direction: column;
    .game-pic {
      width: 180rpx;
      height: 180rpx;
      border-radius: 20rpx;
    }
  }
  .edit-board {
    position: fixed;
    left: 0;
    top: 0;
    background-image: linear-gradient(to right bottom, rgba(255, 255, 255, 0.6), rgba(255, 255, 255, 0.1));
    backdrop-filter: blur(8px);
    transition: all 0.2s;
    border-radius: 30rpx;
    width: 100%;
    height: 100%;
    display: flex;
    justify-content: center;
    align-items: center;
    font-size: 28rpx;
    .item {
      width: 180rpx;
      text-align: center;
      .item-text {
        margin-left: 10rpx;
      }
    }
  }
  .show {
    opacity: 1;
  }
  .hide {
    opacity: 0;
    z-index: -1;
  }
}
#addBtnHolder {
  margin-top: 30rpx;
  width: 240rpx;
  margin-left: 40rpx;
}
.new-card {
  width: 100%;
  height: 780rpx;
  overflow: hidden;
  padding: 40rpx 25rpx 20rpx;
  .item {
    width: 640rpx;
    margin-bottom: 15rpx;
    display: flex;
    .item-text {
      width: 90rpx;
      height: 50rpx;
      line-height: 50rpx;
      text-align: center;
    }
  }
  .new-pic-holder {
    width: 180rpx;
    height: 180rpx;
    transform: scale(1);
    .addpic {
      width: 180rpx;
      height: 180rpx;
      border-radius: 20rpx;
      font-size: 42rpx;
      font-weight: bold;
      display: flex;
      justify-content: center;
      align-items: center;
      color: rgba(42, 42, 42, 0.5);
      position: fixed;
      top: 0;
      left: 0;
      border: 2px dashed rgba(42, 42, 42, 0.5);
    }
    .delpic {
      width: 45rpx;
      height: 45rpx;
      position: fixed;
      right: 0;
      bottom: 0;
      background-color: #dbdada;
      border-radius: 20rpx 0 20rpx 0;
      z-index: 10;
    }
    .new-pic {
      width: 180rpx;
      height: 180rpx;
      border-radius: 20rpx;
    }
  }
  .sure-btn-holder {
    width: 210rpx;
    margin: auto;
    margin-top: 25rpx;
  }
}
</style>
