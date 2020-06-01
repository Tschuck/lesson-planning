// The Vue build version to load with the `import` command
// (runtime-only or standalone) has been set in webpack.base.conf with an alias.
import BootstrapVue from 'bootstrap-vue';
import vSelect from 'vue-select';
import Vue from 'vue';
import Vuex from 'vuex';
import vuexI18n from 'vuex-i18n';

import App from './App';
import router from './router';
import translations from './i18n';

Vue.config.productionTip = false;

Vue.component('v-select', vSelect);
Vue.use(BootstrapVue);
Vue.use(Vuex);

// setup vuex store
const store = new Vuex.Store({
  state: { },
  strict: false,
});

// setup i18n
Vue.use(vuexI18n.plugin, store);
Object.keys(translations).forEach(key => Vue.i18n.add(key, translations[key]));
Vue.i18n.set(window.navigator.language.split('-')[0]);
// Vue.i18n.set('de');

/* eslint-disable no-new */
export default new Vue({
  components: { App },
  el: '#app',
  router,
  store,
  template: '<App/>',
});
