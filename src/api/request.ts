import axios from 'axios'

const request = axios.create({
  baseURL: import.meta.env.DEV ? '/api' : '',
  timeout: 10000,
  headers: {
    'Accept': 'application/json'
  }
})

request.interceptors.request.use(
  (config) => {
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

request.interceptors.response.use(
  (response) => {
    return response.data
  },
  (error) => {
    console.warn('[Discourse API Network Notice]', error.message)
    return Promise.reject(error)
  }
)

export default request
