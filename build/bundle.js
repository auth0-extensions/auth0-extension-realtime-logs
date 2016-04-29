var url = require('url');
var bodyParser = require('body-parser');
var expressJwt = require('express-jwt');
var rsaValidation = require('auth0-api-jwt-rsa-validation');
var ejs = require('ejs');
var app = new (require('express'))();

app.use(function (req, res, next) {
    req.baseUrl = [
        req.get('x-forwarded-proto') || 'https',
        '://',
        req.get('host'),
        url.parse(req.originalUrl).pathname
    ].join('');
    req.audience = 'https://' + req.x_wt.container + '.auth0.com/api/v2/';
    next();
});

app.get('/', function (req, res) {
    res.redirect([
        'https://auth0.auth0.com/i/oauth2/authorize',
        '?client_id=', req.baseUrl,
        '&response_type=token&expiration=86400000&response_mode=form_post',
        '&scope=', encodeURIComponent('openid profile'),
        '&redirect_uri=', req.baseUrl,
        '&audience=', req.audience
    ].join(''));
});

app.get('/.well-known/oauth2-client-configuration', function (req, res) {
    res.json({
      redirect_uris: [ req.baseUrl.replace('/.well-known/oauth2-client-configuration','') ],
      client_name: 'Auth0 Extension'
    });
});

app.post('/', 
    bodyParser.urlencoded({ extended: false }),
    expressJwt({
        secret: rsaValidation(),
        algorithms: [ 'RS256' ],
        getToken: req => req.body.access_token
    }),
    function (req, res) {
        if (req.user.aud === req.audience || Array.isArray(req.user.aud) && req.user.aud.indexOf(req.audience) > -1) {
            res.send(ejs.render(logsTemplate, {
                token: req.x_wt.token,
                container: req.x_wt.container,
                baseUrl: req.baseUrl
            }));
        }
        else {
            res.status(403);
            res.send(ejs.render(notAuthorizedTemplate, {
                baseUrl: req.baseUrl
            }));
        }
    });

app.get('/meta', function (req, res) {
    // Keep this manually in sync with webtask.json (to avoid bundling step)
    res.json({
      "title": "Real-time Webtask Logs",
      "name": "auth0-extension-realtime-logs",
      "version": "1.0.0",
      "author": "Auth0, Inc",
      "description": "Access real-time webtask logs",
      "type": "application",
      "repository": "https://github.com/auth0/auth0-extension-realtime-logs",
      "keywords": [
        "auth0",
        "extension",
        "webtask",
        "logs",
        "real-time"
      ]
    });
});

function s(f) { return f.toString().match(/[^]*\/\*([^]*)\*\/\s*\}$/)[1]; }

var notAuthorizedTemplate = s(function () {/*
<!DOCTYPE html5>
<html>
  <head>
    <meta charset="utf-8"/>
    <meta http-equiv="X-UA-Compatible" content="IE=edge"/>
    <meta name="viewport" content="width=device-width, initial-scale=1"/>
    <link href="https://cdn.auth0.com/styleguide/latest/index.css" rel="stylesheet" />
    <title>Access denied</title>
  </head>
  <body>
    <div class="container">
      <div class="row text-center">
        <h1><a href="https://auth0.com" title="Go to Auth0!"><img src="https://cdn.auth0.com/styleguide/1.0.0/img/badge.svg" alt="Auth0 badge" /></a></h1>
        <h1>Not authorized</h1>
        <p><a href="https://auth0.auth0.com/logout?returnTo=<%- baseUrl %>">Log out from Auth0 and try again</a></p>
      </div>
    </div>
  </body>
</html>
*/});

var logsTemplate = s(function () {/*
<!DOCTYPE html5>
<html>
  <head>
    <meta charset="utf-8"/>
    <meta http-equiv="X-UA-Compatible" content="IE=edge"/>
    <meta name="viewport" content="width=device-width, initial-scale=1"/>
    <script src="https://cdn.auth0.com/webtaskWidget/auth0-webtask-widget-1.min.js"></script>
    <link href="https://cdn.auth0.com/styleguide/latest/index.css" rel="stylesheet" />
    <title>Logs of <%= container %></title>
    <style>
        html,
        body {
          min-height: 100%;
          margin: 0;
        }
        .banner {
          position: absolute;
          top: 0;
        }
        .logs {
          position: absolute;
          top: 100;
          bottom: 0;
          left: 0;
          right: 0;
        }
        h2 {
            margin-bottom: 0;
        }
        .a0-logs-lines {
            min-height: 100% !important;
        }
    </style>
  </head>
  <body>
    <div class="container text-center">
        <h2><img src="https://cdn.auth0.com/styleguide/1.0.0/img/badge.svg" alt="Auth0 badge" height=30 /> Logs of <%= container %></h2>
        <a href="https://auth0.auth0.com/logout?returnTo=<%- baseUrl %>" class="text-small">Logout from Auth0</a>
    </div>
    <div id="widget_container" class="logs"></div>
    <script>
    	var logs = webtaskWidget.showLogs({
			mount: document.getElementById('widget_container'),
			url: window.location.protocol + '//' + window.location.hostname,
			token: '<%- token %>',
			container: '<%- container %>'
    	});
    </script>
  </body>
</html>
*/});

module.exports = require('webtask-tools').fromExpress(app);
