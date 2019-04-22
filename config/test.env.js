var merge = require('webpack-merge')
var prodEnv = require('./prod.env')

module.exports = merge(prodEnv, {
  NODE_ENV: 'testing',
  //SERVER_URL: 'https://78.247.66.31:3000'
  //SERVER_URL: 'https://192.168.0.10:3000'
  //SERVER_URL: 'https://192.168.137.1:3000'
  //SERVER_URL: 'https://172.20.204.51:3000'
  SERVER_URL: 'https://localhost:3000'
})
