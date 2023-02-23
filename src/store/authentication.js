import axios from 'axios'
import cookies from 'js-cookie'

export const authentication = {
  state: {
    user: {},
    role: null,
    token: null,
    username: '',
    password: '',
    verified: false,
  },
  mutations: {
    SET_USER (state, data) {
      state.user = data
      if (data) {
        state.user.full_name = data.first_name + ' ' + data.last_name
      }
    },
    SET_ROLE (state, data) {
      state.role = data
    },
    SET_TOKEN (state, data) {
      state.token = data
    },
    SET_VERIFIED (state, data) {
      state.verified = data
    },
    SET_USERNAME (state, data) {
      state.username = data
    },
    SET_PASSWORD (state, data) {
      state.password = data
    },
    RESET (state) {
      delete axios.defaults.headers.common.Authorization
      cookies.remove('cdt-token')
      cookies.remove('unlocked')
    },
  },
  actions: {
    async login ({ commit }, data) {
      const res = await axios.post(data.url, data)
      if (res.data.verified) {
        commit('SET_USER', res.data.user)
        commit('SET_ROLE', res.data.role)
        commit('SET_TOKEN', res.data.token)
        commit('SET_VERIFIED', true)
        axios.defaults.headers.common.Authorization = 'Bearer ' + res.data.token
        cookies.set('cdt-token', res.data.token, { expires: data.rememberMe ? 365 : 1 })
        cookies.set('unlocked', 1, { expires: data.rememberMe ? 365 : 7 })
      } else {
        commit('SET_VERIFIED', false)
        commit('SET_USERNAME', data.username)
        commit('SET_PASSWORD', data.password)
      }
      return res
    },
    async logout ({ commit }) {
      await commit('RESET')
      await this.reset()
      return true
    },
    check ({ commit }, token) {
      if (token) {
        axios.defaults.headers.common.Authorization = 'Bearer ' + token
        return new Promise((resolve, reject) => {
          axios.post('auth/me')
            .then(res => {
              commit('SET_USER', res.data.user)
              commit('SET_ROLE', res.data.role)
              commit('SET_TOKEN', token)
              resolve(res)
            })
            .catch(err => {
              commit('RESET')
              this.reset()
              reject(err)
            })
        })
      }
    },
  },
}
