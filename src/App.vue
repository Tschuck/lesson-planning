<template>
  <router-view :key="$route.fullPath" />
</template>

<script>
export default {
  name: 'App',
  created() {
    // set dynamic page title
    document.title = this.$t('_lp.title');
  },
};
</script>

<style lang="scss">
  $primary: #880e4f;
  $info: #c51162;

  @import "node_modules/vue-select/src/scss/vue-select.scss";
  @import 'node_modules/bootstrap/scss/bootstrap';
  @import 'node_modules/bootstrap-vue/src/index.scss';

  $mdi-font-path: '~@mdi/font/fonts/';
  @import '~@mdi/font/scss/materialdesignicons.scss';

  html, body {
    height: 100%;
  }
</style>
