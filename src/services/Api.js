import axios from "axios";

// otherwise cookies are not sent back to server
axios.defaults.withCredentials = true;
axios.defaults.timeout = 15000;
axios.defaults.headers.common["Authorization"] = `Bearer ${
  localStorage["jwt"]
}`;

// Note: HTTPS is mandatory here because HTTPS is required for front (geolocation)

export default () => {
  var baseUrl = process.env.SERVER_URL;
  return axios.create({
    // currently for proto, API will be always available from same host as webapp
    // => localhost, 78.247.66.31, etc.
    baseURL: baseUrl,
    validateStatus: function(status) {
      return true; // let app also treat 500 error
      //return status < 500 //let app treat 3xx and 4xx errors
    }
  });
};
