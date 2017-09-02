import Vue from 'vue'
import App from './App.vue'
import Modal from './Modal.vue'
import VueOnsen from 'vue-onsenui';
import mies from './mies.json';
import nainen from './nainen.json';
Vue.use(VueOnsen);

Vue.component('modal', Modal);

new Vue({
  el: '#app',
  components: { Modal },
  render: h => h(App),
  data() { return {}}
});
