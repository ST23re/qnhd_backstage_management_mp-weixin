import store from '@/store';

export const service = options => {
  return new Promise((resolve, reject) => {
    uni.request({
      url: store.state.urls_apply.baseUrl + options.url,
      method: options.method || 'GET',
      data: options.data || {},
      header: {
        'Content-Type': options.method === 'GET' ? 'application/json' : 'application/x-www-form-urlencoded',
        token: store.state.vuex_token,
      },
      success: ({ data: res }) => {
        console.log(res);
        if (res.code && res.code != 200)
          uni.showToast({
            title: `msg: ${res.msg ? res.msg : '未知错误'}`,
            icon: 'none',
            position: 'bottom',
          });
        resolve(res);
      },
      fail: err => {
        reject(err);
      },
    });
  });
};
