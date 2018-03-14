var express  = require('express');
var https    = require('https');
var fs       = require('fs');
var app      = express();

var favicon      = require('serve-favicon');
// var basicAuth    = require('basic-auth-connect');
// var cookieParser = require('cookie-parser');
// var bodyParser   = require('body-parser');

var server = app;

// app.use(basicAuth('kimind', 'cix4ever'));
// app.use(cookieParser()); // read cookies (needed for auth)
// app.use(bodyParser.urlencoded({ extended: false }));
// app.use(bodyParser.json());

//redirect http > https
app.use(function(req, res, next) {
  if((!req.secure) && (req.get('X-Forwarded-Proto') !== 'https')) {
    res.redirect('https://' + req.get('Host') + req.url);
  }
  else
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
// robots.txt
app.get('/robots.txt', function (req, res) {
  res.type('text/plain');
  res.send("User-agent: *\nDisallow: /");
});

app.use(express.static('/var/www/prod/webapp/dist/'));
app.use(favicon('/var/www/prod/webapp/https-server/favicon.ico'));

// =================================================================
// start the server ================================================
// =================================================================
var port = 443;
server.listen(port);
console.log('Server successfully started on PRODUCTION on port ' + port);