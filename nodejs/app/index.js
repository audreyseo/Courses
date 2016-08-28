var express = require('express');
var app = express();
var exec = require('child_process');
var child;
var notify = require('./notifier')();
notify.setMaxListeners(100);
module.exports = function() {
  require('./routes')(app, notify, child, exec);

}
