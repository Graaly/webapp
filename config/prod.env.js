module.exports = {
  NODE_ENV: 'production',
  SERVER_URL: 'https://api.graaly.com', // prod
  //SERVER_URL: 'https://graaly.duckdns.org:38512', // preprod
  MQTT_URL: 'wss://api.graaly.com:9001', // to be confirmed
  MQTT_TOPIC: 'Graaly',
  PERSIST_STATE_COOKIE_DURATION: 30, // days,
  VERSION: "1.9.4"
}
