module.exports = `<!DOCTYPE html5>
<html>
  <head>
    <script>
      sessionStorage.removeItem('token');
      window.location.href = 'https://auth0.auth0.com/logout?returnTo=<%- baseUrl.replace("logout", "/")%>&client_id=<%- baseUrl.replace("logout", "/")%>';
    </script>
  </head>
  <body></body>
</html>`;
