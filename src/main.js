import Vue from 'vue'
import App from './App.vue'
import router from './router'
import store from './store/index'
import './plugins/base'
import './plugins/chartist'
import './plugins/vee-validate'
import './plugins/vue-world-map'
import vuetify from './plugins/vuetify'
import i18n from './i18n'
import VuetifyConfirm from 'vuetify-confirm'
import VueClipboard from 'vue-clipboard2'
import FlagIcon from 'vue-flag-icon'
import axios from 'axios'
import cookies from 'js-cookie'
import VueToast from 'vue-toast-notification'
import 'vue-toast-notification/dist/theme-sugar.css'
import { apiUrl } from '../config'

axios.defaults.baseURL = apiUrl
const token = cookies.get('cdt-token')
const check = async (token) => {
  try {
    if (token) {
      await store.dispatch('check', token)
    }
  } catch (error) {
    cookies.remove('cdt-token')
    // if (router.history.current.path !== '/login') router.push('/login')
  }
}
check(token)

var VueTruncate = require('vue-truncate-filter')
Vue.use(VueTruncate)
Vue.config.productionTip = false

Vue.use(VuetifyConfirm, { vuetify })
Vue.use(VueClipboard)
Vue.use(FlagIcon)
Vue.use(VueToast, {
  queue: true,
})

new Vue({
  router,
  store,
  vuetify,
  i18n,
  render: h => h(App),
}).$mount('#app')
