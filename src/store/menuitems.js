import axios from 'axios'
// import { guardAPI } from '@/shared/management'

export const menuitems = {
  state: {
    alertItems: {
      alerts: [],
    },

    // states above to be removed
    vessels: [],
    fleets: [],
    networks: [],
    internalUsers: [],
    accountManagers: [],
    vesselClasses: [],
    plans: [],
    countries: [],
    companies: [],
    regions: [],
    vendorTypes: [],
    insurers: [],
    providers: [],
    userTypes: [],
    roles: [],
    planNumbers: [],
    zones: [],
    societies: [],
    qis: [],
    pis: [],
    vesselTypes: [],
    billingModes: [],
    reports: [],
  },
  mutations: {
    SET_ALERTS (state, { data }) {
      state.alertItems = data
    },

    // mutations above to be removed
    SET_ITEMS (state, { data }) {
      state[data.state] = data.items
    },
  },

  actions: {
    async getInitials ({ commit }, mixins) {
      // const authMixins = mixins.filter(mixin => {
      //   if (this.state.authentication.role) {
      //     return guardAPI(mixin.url, this.state.authentication.role.id)
      //   } else {
      //     this.watch(state => state.authentication.role, role => {
      //       console.log(mixin.url)
      //       console.log(guardAPI(mixin.url, role.id))
      //       return role && guardAPI(mixin.url, role.id)
      //     })
      //   }
      // })
      // console.log(authMixins)

      const promises = mixins.map(mixin => (
        axios.get(mixin.url).then(res => res.data)
      ))

      const items = await Promise.all(promises)
      mixins.forEach((mixin, index) => {
        commit({ type: 'SET_ITEMS', data: { state: mixin.item, items: items[index] } })
      })
    },

    // actions below to be removed
    getAlerts ({ commit }) {
      return new Promise((resolve, reject) => {
        axios.get('alerts')
          .then(res => {
            commit({ type: 'SET_ALERTS', data: res.data })
            resolve()
          })
          .catch(err => reject(err))
      })
    },
  },
}
