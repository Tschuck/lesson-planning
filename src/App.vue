<template>
  <router-view :key="$route.fullPath" />
</template>

<script>
export default {
  name: 'App',
};
</script>

<style lang="scss">
  $primary: #97266D;

  @import 'node_modules/bootstrap/scss/bootstrap';
  @import 'node_modules/bootstrap-vue/src/index.scss';

  $mdi-font-path: '~@mdi/font/fonts/';
  @import '~@mdi/font/scss/materialdesignicons.scss';

  html, body {
    height: 100%;
  }
</style>
