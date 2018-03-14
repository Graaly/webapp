const
  express = require('express'),
  serveStatic = require('serve-static'),
  port = process.env.PORT || 80

const app = express()

app.use(serveStatic('/var/www/prod/webapp/dist/'))
app.listen(port)
console.log('Server successfully started on PRODUCTION on port ' + port);