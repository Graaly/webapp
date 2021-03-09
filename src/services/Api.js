import axios from "axios"
import axiosRetry from 'axios-retry'

// Note: HTTPS is mandatory here because HTTPS is required for front (geolocation)

let baseUrl = process.env.SERVER_URL
let myAxios = axios.create({
  baseURL: baseUrl,
  validateStatus: function(status) {
    return true; // let app also treat 500 error
    //return status < 500 //let app treat 3xx and 4xx errors
  }
});

myAxios.defaults.timeout = 4500 // slightly before axiosRetry delay
myAxios.defaults.headers.common["Authorization"] = `Bearer ${localStorage["jwt"]}`

axiosRetry(myAxios, {
  retries: 10,
  retryCondition: (err) => {
    return err.code && err.code === 'ECONNABORTED' // any other error than timeout: no retry
  },
  shouldResetTimeout: true,
  retryDelay: () => { return 5000 }
})

export default () => {
  return myAxios
}
