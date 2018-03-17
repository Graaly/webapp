import axios from 'axios'

// otherwise cookies are not sent back to server
axios.defaults.withCredentials = true

// Note: HTTPS is mandatory here because HTTPS is required for front (geolocation)

export default() => {
  // temp hack
  var baseUrl = (window.location.hostname.indexOf("graaly.com") === -1 ? 'https://' + window.location.hostname + ':3000' : 'https://api.graaly.com')
  return axios.create({
    // currently for proto, API will be always available from same host as webapp
    // => localhost, 78.247.66.31, etc.
    baseURL: baseUrl,
    validateStatus: function (status) {
      return status < 500 //let app treat 3xx and 4xx errors
    }
  })
}
