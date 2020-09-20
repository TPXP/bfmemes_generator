// Make babel happy (required for async functions)
import "regenerator-runtime/runtime";

import Vue from 'vue';
import store from './lib/vuex';

import "./scss/style.scss";
import App from "./component/App";

// Initialize Vue
new Vue({
  el: '#app',
  store,
  render(h) {
    return h(App);
  }
});