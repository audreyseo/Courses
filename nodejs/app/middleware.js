module.exports = function() {
  var http = require('http');
  var sendOutRequest = function(request, response, next) {
  	console.log("Yep.");
  	var req = http.request({
  		host: "0.0.0.0",
  		port: 4004,
  		path: request.url,
  		method: "GET"
  	}, function(err) {
  		if (err) {

  		} else {
  			console.log("Successful response.");
  		}
  	});
  	req.end();
  	next();
  };
  var cleanUpURL = function(request, response, next) {
  	request.url = request.url.replace(/\/get_bad\.php/, "/get_course.php");
  	next();
  };

  return {
    cleanUpURL: cleanUpURL,
    sendOutRequest: sendOutRequest
  };
};
