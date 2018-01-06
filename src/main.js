import Vue from 'vue'
import App from './App.vue'
import VueSocketIO from 'vue-socket.io';
// import AnimatedVue from 'animated-vue';
// import './libs/css/animate.css';
import { store } from './store/store';

Vue.use(VueSocketIO, '/', store);
// Vue.use(AnimatedVue);
export const appBus = new Vue();

new Vue({
  el: '#app',
  store,
  render: h => h(App)
});
