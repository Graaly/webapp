module.exports = {
  NODE_ENV: 'production',
  SERVER_URL: 'https://api.graaly.com', // prod
  //SERVER_URL: 'https://192.168.1.39:3000',
  //SERVER_URL: 'https://graaly.duckdns.org:38512', // preprod
  //UPLOAD_URL: '', // prod: TO BE DEFINED
  UPLOAD_URL: 'https://graaly-upload.s3-accelerate.amazonaws.com', // preprod
  //UPLOAD_URL: 'https://graaly-upload.s3.eu-west-3.amazonaws.com', // preprod
  MQTT_URL: 'wss://api.graaly.com:9001', // to be confirmed
  MQTT_TOPIC: 'Graaly',
  PERSIST_STATE_COOKIE_DURATION: 30, // days,
  VERSION: "2.3.9"
}
