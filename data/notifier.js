var EventEmitter = require('events');

class Notifier extends EventEmitter {
}
module.exports = function() {
  return new Notifier();
};
