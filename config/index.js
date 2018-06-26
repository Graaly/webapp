module.exports = function (isDev) {
  var vars = require('./' + (isDev ? 'dev' : 'prod') + '.env.js')
  // stringify environment variables (required by Quasar conf)
  for (key in vars) {
    vars[key] = JSON.stringify(vars[key])
  }
  return vars
}