var merge = require('webpack-merge')
var prodEnv = require('./prod.env')

module.exports = merge(prodEnv, {
  NODE_ENV: 'development',
  //SERVER_URL: 'https://78.247.66.31:3000'
  SERVER_URL: 'https://localhost:3000'
})
