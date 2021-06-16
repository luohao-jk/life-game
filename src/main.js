import Vue from 'vue'
import App from './core/GameScreen.vue'
import Vant from 'vant';
import VCharts from 'v-charts'
import 'vant/lib/index.css';

Vue.use(VCharts);
Vue.use(Vant);
Vue.config.productionTip = false

new Vue({
  render: h => h(App),
}).$mount('#app');
