var Notifier = require('./notifier');
var scripts = require('./scripts');
var ioo = require('./io');

module.exports = function(notify, child, exec) {
  var generic_class_request = function(aScript) {
    return function(request, response) {
      notify.on("next", function(message, status) {
        console.log("Message:\n%s", message);
        child = exec(`perl ${aScript} \"${message}\"`, function(error, stdout, stderr) {
          console.log("stdout: %s", stdout);
          if (error !== null) {
            console.log("exec error: " + error);
          }
        });
        response.append("Content-Type", "text/html");
        response.append("cache-control", "max-age=0, no-store");
        response.status(status);
        response.send(message);
        // console.log("sent");
        notify = Notifier();
        notify.setMaxListeners(100);
      });
    };
  };
  return {
    get: {
      debug: generic_class_request(scripts.debug),
      normal: generic_class_request(scripts.normal),
      csv: function(request, response) {
        var url = request.path;
        console.log("Returning %s", url);
        io.returnRequestedFile(response, url);
      },
      templates: function(request, response) {
        var url = request.path;
        io.returnRequestedFile(response, url);
      },
      index: function(request, response) {
        notify.emit("thar she blows");
      },
      data: function(request, response) {
        var url = request.path;
      	child = exec("pwd", function (error, stdout, stderr) {
      		console.log('stdout: %s', stdout);
      		if (error !== null) {
      			console.log('exec error: ' + error);
      		}
      	});
      	console.log("Page: ", url);
      	io.returnRequestedFile(response, url);
      },
      lib: function(request, response) {
        var url = request.path;
      	// console.log("\n\nOriginal Url: %s", url);
      	var paths = {
      		"jquery.min.js": "/node_modules/jquery/dist/",
      		"angular.min.js": "/node_modules/angular/",
      		'angular-cookies.min.js': "/node_modules/angular-cookies/"
      	};
      	var name = url;
      	name = name.replace(/\/scripts\//, "");
      	// console.log("Received request for %s", name);
      	for (var key in paths) {
      		if (name.match(key)) {
      			url = paths[key] + name;
      			// console.log("Url: %s", url);
      			break;
      		}
      	}
      	// url = paths[name] + name;
      	// console.log("Returning %s", url);
      	io.returnRequestedFile(response, url);
      }
    },
    post: {
      poster: function(request, response) {
        io.save(request);
      }
    }
  };
}
