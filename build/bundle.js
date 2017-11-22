var url = require('url');
var bodyParser = require('body-parser');
var expressJwt = require('express-jwt');
var rsaValidation = require('auth0-api-jwt-rsa-validation');
var ejs = require('ejs');
var app = new (require('express'))();

function resolveWebtaskAPIHost(host, context) {
  if (host.indexOf('us.webtask.io') > 0) {
    return 'https://sandbox.it.auth0.com';
  }

  if (host.indexOf('au.webtask.io') > 0) {
    return 'https://sandbox-au.it.auth0.com';
  }

  if (host.indexOf('eu.webtask.io') > 0) {
    return 'https://sandbox-eu.it.auth0.com';
  }

  var wtUrl = context.secrets.WT_URL;

  if (wtUrl && wtUrl.indexOf('api/run') >= 0 ) {
    return context.secrets.WT_URL.split('/api')[0];
  }

  return 'https://' + host;
}

app.use(function (req, res, next) {
    var xfproto = req.get('x-forwarded-proto');
    var xfport = req.get('x-forwarded-port');

    req.baseUrl = [
        xfproto ? xfproto.split(',')[0].trim() : 'https',
        '://',
        req.get('host'),
        //xfport ? ':' + xfport.split(',')[0].trim() : '',
        url.parse(req.originalUrl).pathname
    ].join('');
    req.audience = 'https://'+req.webtaskContext.data.AUTH0_DOMAIN+'/api/v2/';

    next();
});

app.get('/', function (req, res) {
    res.redirect([
        req.webtaskContext.data.AUTH0_RTA || 'https://auth0.auth0.com', '/i/oauth2/authorize',
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
      client_name: 'Auth0 Extension',
      post_logout_redirect_uris: [ req.baseUrl.replace('/.well-known/oauth2-client-configuration','') ]
    });
});

app.post('/',
    bodyParser.urlencoded({ extended: false }),
    expressJwt({
        secret: rsaValidation({ strictSSL: true }),
        algorithms: [ 'RS256' ],
        getToken: req => req.body.access_token
    }),
    function (req, res) {
        if (req.user.aud === req.audience || Array.isArray(req.user.aud) && req.user.aud.indexOf(req.audience) > -1) {
            res.send(ejs.render(logsTemplate, {
                a0Token: req.body.access_token,
                token: req.x_wt.token,
                container: req.x_wt.container,
                baseUrl: req.baseUrl,
                rta: req.webtaskContext.data.AUTH0_RTA || 'https://auth0.auth0.com',
                manageUrl: req.webtaskContext.data.AUTH0_MANAGE_URL,
                webtaskAPIUrl: resolveWebtaskAPIHost(req.get('host'), req.webtaskContext)
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
      "version": "1.0.3",
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

app.get('/logout', function (req, res) {
  res.send(ejs.render(logoutTemplate, {
    container: req.x_wt.container,
    baseUrl:   req.baseUrl
  }));
});

function s(f) { return f.toString().match(/[^]*\/\*([^]*)\*\/\s*\}$/)[1]; }

var logoutTemplate = s(function () {/*
<html>
  <head>
    <script>
      sessionStorage.removeItem('token');
      window.location.href = 'https://auth0.auth0.com/logout?returnTo=<%- baseUrl.replace('logout', '/')%>&client_id=<%- baseUrl.replace('logout', '/')%>';
    </script>
  </head>
  <body></body>
</html>
*/});

var notAuthorizedTemplate = s(function () {/*
<!DOCTYPE html5>
<html>
  <head>
    <meta charset="utf-8"/>
    <meta http-equiv="X-UA-Compatible" content="IE=edge"/>
    <meta name="viewport" content="width=device-width, initial-scale=1"/>
    <link rel="shortcut icon" href="https://cdn.auth0.com/styleguide/2.0.1/lib/logos/img/favicon.png">
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
    <link rel="shortcut icon" href="https://cdn.auth0.com/styleguide/2.0.1/lib/logos/img/favicon.png" />
    <link rel="stylesheet" type="text/css" href="https://cdn.auth0.com/manage/v0.3.973/css/index.min.css" />
    <link rel="stylesheet" type="text/css" href="https://cdn.auth0.com/styleguide/3.1.6/index.css">
    <script src="https://cdn.auth0.com/webtaskWidget/auth0-webtask-widget-2.0.min.js"></script>
    <script type="text/javascript" src="https://code.jquery.com/jquery-2.1.4.min.js"></script>
    <script type="text/javascript" src="https://fb.me/react-0.14.0.min.js"></script>
    <script type="text/javascript" src="https://fb.me/react-dom-0.14.0.js"></script>
    <script type="text/javascript" src="https://cdnjs.cloudflare.com/ajax/libs/babel-core/5.8.23/browser.min.js"></script>
    <script type="text/javascript" src="https://cdn.auth0.com/js/jwt-decode-1.4.0.min.js"></script>
    <script type="text/javascript" src="https://cdn.auth0.com/js/navbar-1.0.4.min.js"></script>
    <title>Logs of <%= container %></title>
    <style>
        body, html {
          height: 100vh;
          width: 100vw;
          display: flex;
          flex-direction: column;
          padding-bottom: 0;
        }
        ​
        .header {
          flex: 0 0 100px;
        }
        .body {
          flex: 1;
        }
        .container {
          min-width: 100%;
        }

        .logs {
          flex: 1;
        }

        .message {
          position: absolute;
          z-index: 1000;
          width: 100%;
          top: 100px;
          display: none;
        }

        .message div {
          height: 75px;
          width: 250px;
          background: #707070;
          vertical-align: middle;
          margin-left: auto;
          margin-right: auto;
          line-height: 71px;
          border-radius: 3px;
          text-align: center;
        }
    </style>
    <script type="text/javascript">
      sessionStorage.setItem('token', '<%- a0Token %>');
    </script>
  </head>
  <body class="a0-extension">
    <header class="dashboard-header">
      <nav role="navigation" class="navbar navbar-default">
        <div class="container">
          <div class="navbar-header">
            <h1 class="navbar-brand">
              <a href="<%- manageUrl %>"><span>Auth0</span></a>
            </h1>
          </div>
          <div id="navbar-collapse" class="collapse navbar-collapse">
            <script type="text/babel">
              ReactDOM.render(
                <Navbar baseUrl="<%- baseUrl%>" domain='<%- rta %>'/>,
                document.getElementById('navbar-collapse')
              );
            </script>
          </div>
        </div>
      </nav>
    </header>

    <div class="container extension-header">
      <div class="row">
        <section class="content-page current">
          <div class="col-xs-12">
            <div class="row">
              <div class="col-xs-12 content-header">
                <ol class="breadcrumb">
                  <li><a href="<%- manageUrl %>" target="_blank">Auth0 Dashboard</a>
                  </li>
                  <li><a href="<%- manageUrl %>/#/extensions" target="_blank">Extensions</a>
                  </li>
                </ol>
              </div>
            </div>
          </div>
        </section>
        <div id="content-area">
          <div class="col-xs-12 wrapper">
            <section class="content-page current">
              <div class="content-header">
                <h1>Real-time Webtask Logs</h1>
                <button class="btn btn-default pull-right js-full-screen">Full Screen Mode</button>
              </div>
            </section>
          </div>
        </div>
      </div>
    </div>
    <div class="message"><div>Press ESC to exit full screen mode</div></div>
    <div id="widget_container" class="logs"></div>
    <script>
    	var logs = webtaskWidget.showLogs({
			mount: document.getElementById('widget_container'),
			url: '<%- webtaskAPIUrl %>',
			token: '<%- token %>',
			container: '<%- container %>'
    	});

      $('.js-full-screen').on('click', function () {
        $('.dashboard-header').hide();
        $('.extension-header').hide();
        $('body').attr('style', 'padding-top: 0;');
        $('.message').show();

        setTimeout(function() {
          $('.message').fadeOut('slow');
        }, 1500);
      });

      $(document).keyup(function(e) {
        if (e.keyCode === 27) {
         $('.dashboard-header').show();
         $('.extension-header').show();
         $('body').removeAttr('style');
        }
      });
    </script>
  </body>
</html>
*/});

module.exports = require('webtask-tools').fromExpress(app);
