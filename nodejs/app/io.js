var fs = require('fs');

module.exports = {
  returnRequestedFile: function(response, fileName) {
  	response.sendFile(fileName, {root: __dirname}, function(err) {
  		if (err) {
  			console.log(err);
  			response.status(err.status).end();
  		} else {
  			console.log("Sent: ", fileName);
  		}
  	});
  },
  save: function(request) {
    var strings = JSON.stringify(request.body);
    fs.writeFile("fall_2016.json", strings);
  }
}
