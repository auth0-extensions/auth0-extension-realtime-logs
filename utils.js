
function resolveWebtaskAPIHost(host, context) {
  var wtUrl = context.secrets.WT_URL;

  if (wtUrl && wtUrl.indexOf('api/run') >= 0 ) {
    return context.secrets.WT_URL.split('/api')[0];
  }

  return 'https://' + host;
}

module.exports = {
  resolveWebtaskAPIHost
}
