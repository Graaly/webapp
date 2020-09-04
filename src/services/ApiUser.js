import axios from 'axios'

// otherwise cookies are not sent back to server
axios.defaults.withCredentials = false
axios.defaults.timeout = 15000

export default () => {
  return axios.create({
    baseURL: process.env.USER_SERVER_URL,
    validateStatus: function (status) {
      return true // let app also treat 500 error
      //return status < 500 //let app treat 3xx and 4xx errors
    }
  })
}
