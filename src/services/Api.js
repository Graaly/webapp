import axios from "axios";
import state from "../store/index"

// otherwise cookies are not sent back to server
axios.defaults.withCredentials = true;
axios.defaults.timeout = 5000;
axios.defaults.headers.common["Authorization"] = `Bearer ${
  localStorage["jwt"]
}`;

// Note: HTTPS is mandatory here because HTTPS is required for front (geolocation)

export default () => {
  let baseUrl = process.env.SERVER_URL;
  let myAxios = axios.create({
    // currently for proto, API will be always available from same host as webapp
    // => localhost, 78.247.66.31, etc.
    baseURL: baseUrl,
    validateStatus: function(status) {
      return true; // let app also treat 500 error
      //return status < 500 //let app treat 3xx and 4xx errors
    }
  });
  // intercept timeouts
  myAxios.interceptors.response.use(
    (res) => {
      console.log('response success intercepted')
      console.log('WE CAN CONSIDER THAT WE ARE ONLINE')
      console.log('navigator.connection', navigator.connection)
      state.setNetworkStatus(true)
      return res
    },
    (err) => {
      console.log('response error intercepted', err)
      if (err.code === 'ECONNABORTED') {
        console.log('*** TIMEOUT DETECTED: WE CAN CONSIDER THAT WE ARE OFFLINE !')
        state.setNetworkStatus(false)
      }
      console.log('navigator.connection', navigator.connection)
    }
  )
  return myAxios
};
