var url = require('url');
var bodyParser = require('body-parser');
var expressJwt = require('express-jwt');
var rsaValidation = require('auth0-api-jwt-rsa-validation');
var ejs = require('ejs');
var app = new (require('express'))();
var crypto = require('crypto');
var utils = require('./utils');
var webtaskJson = require('./webtask.json');

var logsTemplate = require('./templates/logs');
var logoutTemplate = require('./templates/logout');
var notAuthorizedTemplate = require('./templates/notAuthorized');

app.use(function(req, res, next) {
  var xfproto = req.get('x-forwarded-proto');
  var xfport = req.get('x-forwarded-port');

  req.baseUrl = [
    xfproto ? xfproto.split(',')[0].trim() : 'https',
    '://',
    req.get('host'),
    //xfport ? ':' + xfport.split(',')[0].trim() : '',
    url.parse(req.originalUrl).pathname
  ].join('');
  req.audience = 'https://' + req.webtaskContext.data.AUTH0_DOMAIN + '/api/v2/';

  next();
});

app.get('/', function(req, res) {
  res.redirect(
    [
      req.webtaskContext.data.AUTH0_RTA || 'https://auth0.auth0.com',
      '/authorize',
      '?client_id=',
      req.baseUrl,
      '&response_type=token&expiration=86400000&response_mode=form_post',
      '&scope=',
      encodeURIComponent('openid profile'),
      '&redirect_uri=',
      req.baseUrl,
      '&audience=',
      req.audience,
      '&nonce=' + encodeURIComponent(crypto.randomBytes(16).toString('hex'))
    ].join('')
  );
});

app.get('/.well-known/oauth2-client-configuration', function(req, res) {
  res.json({
    redirect_uris: [req.baseUrl.replace('/.well-known/oauth2-client-configuration', '')],
    client_name: 'Auth0 Extension',
    post_logout_redirect_uris: [req.baseUrl.replace('/.well-known/oauth2-client-configuration', '')]
  });
});

app.post(
  '/',
  bodyParser.urlencoded({ extended: false }),
  expressJwt({
    secret: rsaValidation({ strictSSL: true }),
    algorithms: ['RS256'],
    getToken: function(req) { return req.body.access_token; }
  }),
  function(req, res) {
    if (
      req.user.aud === req.audience ||
      (Array.isArray(req.user.aud) && req.user.aud.indexOf(req.audience) > -1)
    ) {
      res.send(ejs.render(logsTemplate, {
        a0Token: req.body.access_token,
        token: req.x_wt.token,
        container: req.x_wt.container,
        baseUrl: req.baseUrl,
        rta: req.webtaskContext.data.AUTH0_RTA || 'https://auth0.auth0.com',
        manageUrl: req.webtaskContext.data.AUTH0_MANAGE_URL,
        webtaskAPIUrl: utils.resolveWebtaskAPIHost(req.get('host'), req.webtaskContext)
      }));
    } else {
      res.status(403);
      res.send(ejs.render(notAuthorizedTemplate, {
        baseUrl: req.baseUrl
      }));
    }
  }
);

app.get('/meta', function(req, res) {
  res.json(webtaskJson);
});

app.get('/logout', function(req, res) {
  res.send(ejs.render(logoutTemplate, {
    container: req.x_wt.container,
    baseUrl: req.baseUrl
  }));
});

app.use(function(err, req, res, next) {
  if (err && err.status) {
    res.status(err.status);
    return res.json({
      error: err.code || err.name,
      message: err.message || err.name
    });
  }

  res.status(500);
  if (process.env.NODE_ENV === 'production') {
    return res.json({
      error: 'InternalServerError',
      message: err.message || err.name
    });
  }

  return res.json({
    error: 'InternalServerError',
    message: err.message || err.name,
    details: {
      stack: err.stack
    }
  });
});

module.exports = app;
