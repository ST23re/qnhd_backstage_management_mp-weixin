export default {
  data() {
    return {
      share: {
        title: '求实青年湖底分区管理',
        path: '/pages/login/index',
        imageUrl:
          'https://b0.bdstatic.com/ugc/zQ3HOUwZ8soa78l9N_syOA97bb110fceb8bdb039c081245c3423de.jpg?x-bce-process=image/watermark,image_NDU0ZjAyZDU5YjQ1LnBuZw==,bucket_searchbox,w_32,text_QFNTVFQyMDIy,type_RlpMYW5UaW5nSGVp,size_32,x_22,y_22,interval_4,color_FFFFFF,effect_softoutline,shc_000000,blr_2,align_1' +
          '?temp=' +
          Date.parse(new Date()), //防止缓存
      },
    };
  },
  onShareAppMessage(res) {
    //转发
    if (res.from === 'menu') console.log("I'm shared through menu.");
    return this.share;
  },
  onShareTimeline(res) {
    //分享到朋友圈
    return this.share;
  },
};
