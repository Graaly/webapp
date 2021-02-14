import axios from "axios"
import store from "../store/index"
import axiosRetry from 'axios-retry'

// Note: HTTPS is mandatory here because HTTPS is required for front (geolocation)

let baseUrl = process.env.SERVER_URL;
let myAxios = axios.create({
  baseURL: baseUrl,
  validateStatus: function(status) {
    return true; // let app also treat 500 error
    //return status < 500 //let app treat 3xx and 4xx errors
  }
});

myAxios.defaults.timeout = 4500;
myAxios.defaults.headers.common["Authorization"] = `Bearer ${
  localStorage["jwt"]
}`;

axiosRetry(myAxios, {
  retries: 100,
  /*retryCondition: (err) => {
    console.log('*retryCondition!*', JSON.stringify(err, null, 2), 'attempt#' + err.config['axios-retry'].retryCount, err.code)
    if (!err.response) {
      store.dispatch('setNetworkStatus', false)
    }
    return !err.response; // same as default
  },*/
  shouldResetTimeout: true,
  retryDelay: () => { return 5000 }
})

// intercept timeouts
/*myAxios.interceptors.response.use(
  (res) => {
    //console.log('response success intercepted')
    //console.log('WE CAN CONSIDER THAT WE ARE ONLINE')
    store.dispatch('setNetworkStatus', true)
    return res
  },
  (err) => {
    //console.log('response error intercepted', err)
    if (err.code === 'ECONNABORTED') {
      //console.log('*** TIMEOUT DETECTED: WE CAN CONSIDER THAT WE ARE OFFLINE !')
      store.dispatch('setNetworkStatus', false)
    }
  }
)*/

export default () => { return myAxios }
