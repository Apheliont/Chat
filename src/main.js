import Vue from 'vue'
import App from './App.vue'
import VueSocketIO from 'vue-socket.io';
import socketio from 'socket.io-client';
import { store } from './store/store';

Vue.use(VueSocketIO, socketio('/'), store);
export const appBus = new Vue();

new Vue({
  el: '#app',
  store,
  render: h => h(App)
});
