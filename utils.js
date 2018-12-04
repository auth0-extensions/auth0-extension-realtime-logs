
function resolveWebtaskAPIHost(host, context) {
  if (host.indexOf('.us.webtask.io') > 0) {
    return 'https://sandbox.it.auth0.com';
  }

  if (host.indexOf('.au.webtask.io') > 0) {
    return 'https://sandbox-au.it.auth0.com';
  }

  if (host.indexOf('.eu.webtask.io') > 0) {
    return 'https://sandbox-eu.it.auth0.com';
  }

  if (host.indexOf('.us8.webtask.io') > 0) {
    return 'https://sandbox8-us.it.auth0.com';
  }

  if (host.indexOf('.au8.webtask.io') > 0) {
    return 'https://sandbox8-au.it.auth0.com';
  }

  if (host.indexOf('.eu8.webtask.io') > 0) {
    return 'https://sandbox8-eu.it.auth0.com';
  }

  var wtUrl = context.secrets.WT_URL;

  if (wtUrl && wtUrl.indexOf('api/run') >= 0 ) {
    return context.secrets.WT_URL.split('/api')[0];
  }

  return 'https://' + host;
}

module.exports = {
  resolveWebtaskAPIHost: resolveWebtaskAPIHost
}
