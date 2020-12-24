import axios from "axios";

axios.defaults.timeout = 15000;
// Note: HTTPS is mandatory here because HTTPS is required for front (geolocation)

export default (url) => {
  //this is the default url, but can be overridden with the param
  var baseUrl = process.env.SERVER_URL;

  if (url !== null && url !== undefined && url !== '') {
    baseUrl = url;
  }

  return axios.create({
    // currently for proto, API will be always available from same host as webapp
    // => localhost, 78.247.66.31, etc.
    baseURL: baseUrl,
    validateStatus: function (status) {
      return true; // let app also treat 500 error
      //return status < 500 //let app treat 3xx and 4xx errors
    }
  });
};
