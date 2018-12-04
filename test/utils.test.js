var assert = require('assert');
var utils = require('../utils');

describe('utils', () => {
  test('should resolveWebtaskAPIHost', () => {
    var map = {
      'tenant.us.webtask.io': 'sandbox.it.auth0.com',
      'tenant.au.webtask.io': 'sandbox-au.it.auth0.com',
      'tenant.eu.webtask.io': 'sandbox-eu.it.auth0.com',
      'tenant.pus2.webtask.io': 'sandbox-pus2.it.auth0.com',
      'tenant.us8.webtask.io': 'sandbox8-us.it.auth0.com',
      'tenant.au8.webtask.io': 'sandbox8-au.it.auth0.com',
      'tenant.eu8.webtask.io': 'sandbox8-eu.it.auth0.com',
      'tenant.pus8.webtask.io': 'sandbox8-pus2.it.auth0.com',
      'tenant.sus8.webtask.io': 'sandbox8-sus2.it.auth0.com'
    };
    var context = { secrets: { WT_URL: '' } };

    Object.keys(map).forEach(k => {
      context.secrets.WT_URL = `https://${map[k]}/api/run/tenant/a9446dcf57413cd0ec81c8a5456518f9`
      expect(utils.resolveWebtaskAPIHost(k, context)).toBe(`https://${map[k]}`);
    });
  });
});
