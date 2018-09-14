// The Vue build version to load with the `import` command
// (runtime-only or standalone) has been set in webpack.base.conf with an alias.
import Vue from 'vue'
import App from './App'
import router from './router'
import museUI from 'muse-ui'

import 'muse-ui/dist/muse-ui.css';
import 'muse-ui/dist/theme-light.css'
Vue.config.productionTip = false;
Vue.prototype.path='http://172.30.128.37:8080/swdAPP/common/activity/';
Vue.prototype.token='9b948be81b38b7f653572225a3578bde';
import $ from 'jquery';
import './assets/iconfont/iconfont.css'
Vue.use(museUI);
/* eslint-disable no-new */
new Vue({
  el: '#app',
  router,
  components: { App },
  template: '<App/>'
})
