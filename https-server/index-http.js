const
  express = require('express'),
  serveStatic = require('serve-static'),
  port = process.env.PORT || 80

const app = express()

app.use(function(req, res, next) {
  if ((!req.secure) && (req.get('X-Forwarded-Proto') !== 'https')) {
    res.redirect('https://' + req.get('Host') + req.url);
  } else
    next(); 
});
//redirect www > non www
app.get('/*', function(req, res, next) {
    if (req.headers.host.match(/^www/) !== null ) {
        res.redirect('http://' + req.headers.host.replace(/^www\./, '') + req.url);
    } else {
        next();
    }
})

app.use(serveStatic('/var/www/prod/webapp/dist'))

app.listen(port)
console.log('Server successfully started on PRODUCTION on port ' + port);
