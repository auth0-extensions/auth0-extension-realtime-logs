module.exports = `<!DOCTYPE html5>
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
</html>`;
