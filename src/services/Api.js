import axios from 'axios'

// otherwise cookies are not sent back to server
axios.defaults.withCredentials = true

// Note: HTTPS is mandatory here because HTTPS is required for front (geolocation)

export default() => {
  return axios.create({
    // currently for proto, API will be always available from same host as webapp
    // => localhost, 78.247.66.31, etc.
    baseURL: 'https://' + window.location.hostname + ':3000'
  })
}
