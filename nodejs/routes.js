var routes = require('./server-routes');
var callbacks = require('./callbacks');
var mw = require('./middleware');

module.exports = function(app) {
  app.get(routes.debug, mw.cleanUpURL, mw.sendOutRequest, callbacks.get.debug);
  app.get(routes.normal, mw.sendOutRequest, callbacks.get.normal);
  app.get(routes.csv, callbacks.get.csv);
  app.get(routes.data, callbacks.get.data);
  app.get(routes.lib, callbacks.get.lib);
  app.get(routes.templates, callbacks.get.templates);
  app.get(routes.index, callbacks.get.index);
  app.post(routes.poster, callbacks.post.poster);
}
