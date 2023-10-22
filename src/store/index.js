import Vue from 'vue';
import Vuex from 'vuex';
Vue.use(Vuex);

let lifeData = {};

try {
  lifeData = uni.getStorageSync('lifeData');
} catch (e) {}

let saveStateKeys = ['vuex_user', 'vuex_token', 'envType'];

const saveLifeData = function(key, value) {
  // one to one
  if (saveStateKeys.indexOf(key) != -1) {
    let tmp = uni.getStorageSync('lifeData');
    tmp = tmp ? tmp : {};
    tmp[key] = value;
    uni.setStorageSync('lifeData', tmp);
  }
};
const store = new Vuex.Store({
  state: {
    vuex_user: lifeData.vuex_user ? lifeData.vuex_user : { adminType: '请登录', adminName: '请登录' },
    vuex_token: lifeData.vuex_token ? lifeData.vuex_token : '',
    envType: lifeData.envType ? lifeData.envType : '',
    productionUrls: {
      baseUrl: 'https://qnhd.twt.edu.cn/api/v1/b',
      imgHeader: 'https://qnhdpic.twt.edu.cn/download',
    },
    testUrls: {
      baseUrl: 'https://www.zrzz.site:7013/api/v1/b',
      imgHeader: 'https://www.zrzz.site:7015/download',
    },
    urls_apply: {
      // 初值为生产
      baseUrl: 'https://qnhd.twt.edu.cn/api/v1/b',
      imgHeader: 'https://qnhdpic.twt.edu.cn/download',
    },
    // #ifdef MP-WEIXIN
    menuButtonInfo: {},
    // #endif
    // #ifndef MP-WEIXIN
    menuButtonInfo: {
      top: 0,
      height: 35,
    },
    // #endif
  },
  mutations: {
    $uStore(state, payload) {
      let nameArr = payload.name.split('.');
      let saveKey = '';
      let len = nameArr.length;
      if (nameArr.length >= 2) {
        let obj = state[nameArr[0]];
        for (let i = 1; i < len - 1; i++) {
          obj = obj[nameArr[i]];
        }
        obj[nameArr[len - 1]] = payload.value;
        saveKey = nameArr[0];
      } else {
        state[payload.name] = payload.value;
        saveKey = payload.name;
      }
      saveLifeData(saveKey, state[saveKey]);
    },
    switchToTestEnv(state) {
      state.urls_apply = state.testUrls;
    },
    switchToProdEnv(state) {
      state.urls_apply = state.productionUrls;
    },
    emitMenuInfo(state, obj) {
      state.menuButtonInfo = obj;
    },
  },
});

export default store;
