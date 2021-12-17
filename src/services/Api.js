import axios from "axios"

// Note: HTTPS is mandatory here because HTTPS is required for front (geolocation)

let baseUrl = process.env.SERVER_URL
let myAxios = axios.create({
  baseURL: baseUrl,
  validateStatus: function(status) {
    return true; // let app also treat 500 error
    //return status < 500 //let app treat 3xx and 4xx errors
  }
});

myAxios.defaults.timeout = 5000

// Send the JWT token from local storage every time an HTTP request is made
// Could not use this to change the authorization header:
// myAxios.defaults.headers.common["Authorization"] = `Bearer ${localStorage["jwt"]}`
// Instead, use an interceptor (see https://forum.vuejs.org/t/add-header-token-to-axios-requests-after-login-action-in-vuex/38834)
myAxios.interceptors.request.use(
  (config) => {
    let token = localStorage.getItem('jwt')
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

export default () => {
  return myAxios
}
