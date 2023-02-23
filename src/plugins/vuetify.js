import Vue from 'vue'
import Vuetify from 'vuetify/lib'
import i18n from '@/i18n'
import '@/sass/overrides.sass'
import DjsaCompanyIcon from '@/custom/DjsaCompanyIcon'
import DjsaInactiveCompanyIcon from '@/custom/DjsaInactiveCompanyIcon'
import SalvageIcon from '@/custom/SalvageIcon'

Vue.use(Vuetify)

const theme = {
  primary: '#00A3E4',
  secondary: '#023B68',
  accent: '#FFF900',
  error: '#C32F27',
  info: '#000000',
  success: '#1E972D',
  warning: '#FF8500',
}

export default new Vuetify({
  lang: {
    t: (key, ...params) => i18n.t(key, params),
  },
  theme: {
    themes: {
      dark: theme,
      light: theme,
    },
  },
  icons: {
    values: {
      djsaCompany: { component: DjsaCompanyIcon },
      djsaInactiveCompany: { component: DjsaInactiveCompanyIcon },
      salvage: { component: SalvageIcon },
    },
  },
})
