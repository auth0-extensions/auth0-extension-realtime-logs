var App = require('./');
var express = require('express');
var port = process.env.PORT || 3000;

App.listen(port, function() {
  console.log('Server started on port', port);
});
