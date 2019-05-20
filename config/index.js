module.exports = function (envCode) {
  var vars = require('./' + envCode + '.env.js')
  // stringify environment variables (required by Quasar conf)
  for (let key in vars) {
    vars[key] = JSON.stringify(vars[key])
  }
  return vars
}