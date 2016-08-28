var EventEmitter = require('events');
class Notifier extends EventEmitter {
}
module.exports = function() {
  var notify = new Notifier();
  notify.on("thar she blows", function() {
    console.log("Whale spotted.");
  });
  return notify;
};
