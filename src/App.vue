<style lang="scss">
@import 'uview-ui/index.scss';
button::after {
  border: none !important;
}
</style>

<script>
export default {
  onLaunch: function() {
    let envType = this.$store.state.envType;
    if (envType != '') this.$store.commit(`switchTo${envType}Env`);
    // #ifdef MP-WEIXIN
    let menuButtonInfo = uni.getMenuButtonBoundingClientRect();
    this.$store.commit('emitMenuInfo', menuButtonInfo);
    // #endif
  },
  onShow: function() {},
  onHide: function() {},
};
</script>
