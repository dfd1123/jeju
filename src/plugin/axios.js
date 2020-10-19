'use strict'

import Vue from 'vue'
import axios from 'axios'
import router from '../router'

Vue.prototype.$APIURI = process.env.VUE_APP_API_URL

// Full config:  https://github.com/axios/axios#request-config
axios.defaults.baseURL = process.env.VUE_APP_API_URL || ''
// axios.defaults.headers.post['Content-Type'] = 'application/x-www-form-urlencoded';
axios.defaults.headers.common['X-Requested-With'] = 'XMLHttpRequest'

const config = {
  // timeout: 60 * 1000, // Timeout
  // withCredentials: true, // Check cross-site Access-Control
}

const _axios = axios.create(config)

_axios.interceptors.request.use(
  function (config) {
    // Do something before request is sent
    if (Vue.$cookies.get('access_token')) {
      config.headers.Authorization = `Bearer ${Vue.$cookies.get('access_token')}`
    }
    return config
  },
  function (error) {
    // Do something with request error
    if (error.response && error.response.status === 401) {
      router.push('/login')
    }

    return Promise.reject(error)
  }
)

// Add a response interceptor
_axios.interceptors.response.use(
  function (response) {
    // Do something with response data

    return response
  },
  function (error) {
    if (error.response && error.response.status === 401) {
      if (!error.response.config.url.includes('login')) {
        if (Vue.$cookies.isKey('access_token')) {
          Vue.$cookies.remove('access_token')
        }

        router.push('/login')
      }
    } else if (error.code === 'ECONNABORTED') {
      Vue.$notify({
        group: 'error',
        text: '네트워크 접속 상태가 불안정합니다.'
      })
    }

    return Promise.reject(error)
  }
)

Plugin.install = function (Vue, options) {
  Vue.axios = _axios
  window.axios = _axios
  Object.defineProperties(Vue.prototype, {
    axios: {
      get () {
        return _axios
      }
    },
    $axios: {
      get () {
        return _axios
      }
    }
  })
}

Vue.use(Plugin)

export default Plugin
