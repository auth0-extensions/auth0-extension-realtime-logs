var express = require('express');
var auth0   = require('auth0-oauth2-express');
var Webtask = require('webtask-tools');
var app     = express();

app.use(auth0({
  scopes: 'read:connections'
}));

app.get('/', function (req, res) {
  var view = [
    '<html>',
    '  <head>',
    '    <title>Auth0 Extension</title>',
    '    <script type="text/javascript">',
    '       if (!sessionStorage.getItem("token")) {',
    '         window.location.href = "'+res.locals.baseUrl+'/login";',
    '       }',
    '    </script>',
    '  </head>',
    '  <body>',
    '    <p><strong>Token</strong></p>',
    '    <textarea rows="10" cols="100" id="token"></textarea>',
    '    <script type="text/javascript">',
    '       var token = sessionStorage.getItem("token");',
    '       if (token) {',
    '         document.getElementById("token").innerText = token;',
    '       }',
    '    </script>',
    '  </body>',
    '</html>'
  ].join('\n');

  res.header("Content-Type", 'text/html');
  res.status(200).send(view);
});

module.exports = app;
