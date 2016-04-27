# Usage

1. `npm init`
2. `npm install express --save`
3. `npm install webtask-tools --save`
4. Create `index.js` with the minimal express extension:

  ```js
  var express = require('express');
  var Webtask = require('webtask-tools');

  var app = express();

  app.get('/', function (req, res) {
    res.status(200).send('Hello World');
  });

  module.exports = app;
  ```

## Authenticating the extension with Auth0

A useful extension would typically use the Auth0 API. We created a module that abstract away the OAuth2 consent flow with the Auth0 API.

1. `npm install auth0-oauth2-express --save`
2. Add the `auth0-oauth2-express` module and configure the scopes you want. This will ask the right consent to the user.

  ```js
  var auth0   = require('auth0-oauth2-express');

  app.use(auth0({
    scopes: 'read:connections'
  }));
  ```

## Running locally

To run the sample extension locally:

```bash
$ npm install
$ npm start
```

## Deploying to Webtask.io

If you want to host your extension, you can easily  do it by using [Webtask.io](https://webtask.io). 

* Install [wt-cli](https://github.com/auth0/wt-cli) - `npm install -g wt-cli`
* Install [webtask-bundle](https://github.com/auth0/webtask-bundle) - `npm install -g webtask-bundle`
* Run `npm run deploy`

Note: For more information about how to setup Webtask, click [here](https://webtask.io/docs/101).

## What is Auth0?

Auth0 helps you to:

* Add authentication with [multiple authentication sources](https://docs.auth0.com/identityproviders), either social like **Google, Facebook, Microsoft Account, LinkedIn, GitHub, Twitter, Box, Salesforce, amont others**, or enterprise identity systems like **Windows Azure AD, Google Apps, Active Directory, ADFS or any SAML Identity Provider**.
* Add authentication through more traditional **[username/password databases](https://docs.auth0.com/mysql-connection-tutorial)**.
* Add support for **[linking different user accounts](https://docs.auth0.com/link-accounts)** with the same user.
* Support for generating signed [Json Web Tokens](https://docs.auth0.com/jwt) to call your APIs and **flow the user identity** securely.
* Analytics of how, when and where users are logging in.
* Pull data from other sources and add it to the user profile, through [JavaScript rules](https://docs.auth0.com/rules).

## Create a free Auth0 Account

1. Go to [Auth0](https://auth0.com/signup) and click Sign Up.
2. Use Google, GitHub or Microsoft Account to login.

## Issue Reporting

If you have found a bug or if you have a feature request, please report them at this repository issues section. Please do not report security vulnerabilities on the public GitHub issue tracker. The [Responsible Disclosure Program](https://auth0.com/whitehat) details the procedure for disclosing security issues.

## Author

[Auth0](auth0.com)

## License

This project is licensed under the MIT license. See the [LICENSE](LICENSE) file for more info.
