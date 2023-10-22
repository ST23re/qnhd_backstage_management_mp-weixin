import Vue from 'vue';
import App from './App';
import uView from 'uview-ui';
import store from '@/store';
import Md5 from 'js-md5';
// #ifdef MP-WEIXIN
import share from './utils/share';
// #endif

let vuexStore = require('@/store/$u.mixin.js');
Vue.mixin(vuexStore);
// #ifdef MP-WEIXIN
Vue.mixin(share);
// #endif
Vue.use(uView);
Vue.prototype.$md5 = Md5;
// Vue.prototype.$avatarBaseUrl = 'https://www.zrzz.site:7013/avatar/beam/20';
Vue.config.productionTip = false;

App.mpType = 'app';

const app = new Vue({
  store,
  ...App,
  // #ifdef MP-WEIXIN
  share,
  // #endif
});
app.$mount();
