"use strict"
var exec = require('child_process').exec;
var bodyParser = require('body-parser');
var httpProxy = require('http-proxy');
var EventEmitter = require('events');
var jsonfile = require('jsonfile');
var express = require('express');
var https = require('https');
var http = require('http');
var ursa = require('ursa');
var util = require('util');
// var sys = require('sys');
var fs = require('fs');
class Notifier extends EventEmitter {
}

var child;
var notify = new Notifier();
notify.setMaxListeners(100);
var app = express();
app.use(bodyParser.json({limit: '52428800mb'}));
var router = express.Router();
var key = ursa.createPrivateKey(fs.readFileSync('sslcert/key.pem'), "bunnyBear1997");
var crt = ursa.createPublicKey(fs.readFileSync('sslcert/my-server.pub'));
var credentials = {key: key, cert: crt};
var saved = {
	response: ""
}
var options = {
	target: {
		host: "https://webapps.wellesley.edu/new_course_browser",
		port: 80
	},
	ssl: credentials,
	secure: true,
	changeOrigin: true
};
var proxy = httpProxy.createProxyServer(options);
var stealthyServer = proxy.listen(4003);
var httpsServer = https.createServer(credentials, app);
var httpServer = http.createServer(function(req, res) {
	console.log("HTTP Request: ", Date.now());
});

router.use(function(req, res, next) {
	console.log("Time: ", Date.now());
	next();
});

httpServer.listen(4004);
httpsServer.listen(4002);

// httpServer listens for event "request" and paasses the request on to
// the proxy server.
httpServer.on('request', function(request, response) {
	proxyRequest(request, response);
});

// Listens for the event "thar she blows" and calls appropriate
// callback.
notify.on("thar she blows", function() {
	console.log("Whale spotted.");
});

// Demos encryption and decryption.
function demo() {
	var bigText = "This should say 'I am a fluffy bunny.'"

	var keySizeBits = 4096;
	var keyPair = ursa.generatePrivateKey(keySizeBits, 65537);

	var encrypted = encrypt(bigText, keySizeBits/8);
	console.log("This should look like nonsense:\n", encrypted, "\n\n");

	var decrypted = decrypt(encrypted, keySizeBits/8);
	console.log(bigText, " vs ",  decrypted, "\n");
}

// Encrypts a string.
function encrypt(clearText, keySizeBytes) {
    var buffer = new Buffer(clearText);
    var maxBufferSize = keySizeBytes - 42; //according to ursa documentation
    var bytesDecrypted = 0;
    var encryptedBuffersList = [];

    //loops through all data buffer encrypting piece by piece
    while(bytesDecrypted < buffer.length){
        //calculates next maximun length for temporary buffer and creates it
        var amountToCopy = Math.min(maxBufferSize, buffer.length - bytesDecrypted);
        var tempBuffer = new Buffer(amountToCopy);

        //copies next chunk of data to the temporary buffer
        buffer.copy(tempBuffer, 0, bytesDecrypted, bytesDecrypted + amountToCopy);

        //encrypts and stores current chunk
        var encryptedBuffer = keyPair.encrypt(tempBuffer);
        encryptedBuffersList.push(encryptedBuffer);

        bytesDecrypted += amountToCopy;
    }

    //concatenates all encrypted buffers and returns the corresponding String
    return Buffer.concat(encryptedBuffersList).toString('base64');
}

// Decrypts a string.
function decrypt(encryptedString, keySizeBytes) {

    var encryptedBuffer = new Buffer(encryptedString, 'base64');
    var decryptedBuffers = [];

    //if the clear text was encrypted with a key of size N, the encrypted
    //result is a string formed by the concatenation of strings of N bytes long,
    //so we can find out how many substrings there are by diving the final result
    //size per N
    var totalBuffers = encryptedBuffer.length / keySizeBytes;

    //decrypts each buffer and stores result buffer in an array
    for(var i = 0 ; i < totalBuffers; i++){
        //copies next buffer chunk to be decrypted in a temp buffer
        var tempBuffer = new Buffer(keySizeBytes);
        encryptedBuffer.copy(tempBuffer, 0, i*keySizeBytes, (i+1)*keySizeBytes);
        //decrypts and stores current chunk
        var decryptedBuffer = keyPair.decrypt(tempBuffer);
        decryptedBuffers.push(decryptedBuffer);
    }

    //concatenates all decrypted buffers and returns the corresponding String
    return Buffer.concat(decryptedBuffers).toString();
}

// Returns a requested file based on response and the name of a file.
function returnRequestedFile(response, fileName) {
	response.sendFile(fileName, {root: __dirname}, function(err) {
		if (err) {
			console.log(err);
			response.status(err.status).end();
		} else {
			console.log("Sent: ", fileName);
		}
	});
}

// Performs a request to the http server that houses the proxy server.
function sendOutRequest(request, response, next) {
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
}

// Performs a proxy request. Acts as middleware.
function proxyRequest(request, response) {
	var url = request.url;
	saved.response = response;
	// path = path.replace("/get_course.php?", "");
	url = url.replace("/get_course.php?", "");
	console.log("\nRequested url: ", url, "\n");
	request.url = "display_single_course_cb.php?" + url;
	// options.foward = "https://webapps.wellesley.edu/new_course_browser/display_single_course_cb.php?" + url;
	proxy.web(request, response, {
		target: "https://webapps.wellesley.edu/new_course_browser/",
		forward: "https://webapps.wellesley.edu/new_course_browser/display_single_course_cb.php?" + url,
		changeOrigin: true,
		secure: true,
		ssl: credentials
		// ws: true
	});
}

// Listens for proxy response event, and calls proper callback.
proxy.on('proxyRes', function(proxyRes, request, response) {
	// console.log('RAW Response from the target', JSON.stringify(proxyRes.headers, true, 2), "\n");
	// console.log(proxyRes);
	if (request) {
		if (request.body) {
			console.log("Body:\n", request.body, "\n");
		}
	}
	var messageString = "";
	proxyRes.on("data", function(msg) {
		messageString += msg.toString('utf8');
		console.log("Data received");

		if (messageString.match(/<\/div><\/div>\s*$/)) {
			messageString = messageString.replace(/'#my_favorite_'\+crn/g, "");
			messageString = messageString.replace(/'#my_(favorite_?|waitlist_?)'(\+crn?)/g, "");
			messageString = messageString.replace(/'#my_favorite'/g, "");
			messageString = messageString.replace(/'#my_favorite_'/g, "");
			messageString = messageString.replace(/'#my_waitlist_'\+crn/g, "");
			messageString = messageString.replace(/'#my_waitlist'/g, "");
			messageString = messageString.replace(/'#my_waitlist_'/g, "");
			messageString = messageString.replace(/'div\.(favorite|waitlist)('?)/g, "");
			messageString = messageString.replace(/'div\.favorite/g, "");
			messageString = messageString.replace(/'div\.waitlist'/g, "");
			messageString = messageString.replace(/\+/g, "");
			messageString = messageString.replace(/crn/g, "");
			messageString = messageString.replace(/(?!\\)(["'])/g, "\\$1");

			notify.emit("next", messageString, response.statusCode);
		}
	});
});

// Removes "get_bad.php" from debugging urls and replaces it with
// "get_course.php".
function cleanUpURL(request, response, next) {
	request.url = request.url.replace(/\/get_bad\.php/, "/get_course.php");
	next();
}


// App wants to get the debug version of a particular course, so that we
// can test extraction.pl.
app.get('/get_bad.php?*', cleanUpURL, sendOutRequest, function(request, response) {
	notify.on("next", function(message, status) {
		console.log("Message:\n%s", message);
		child = exec(`perl parser/scripts/test_extraction.pl \"${message}\"`, function(error, stdout, stderr) {
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
		notify = new Notifier();
		notify.setMaxListeners(100);
	});
});


// App wants a particular course, and this should return information
// pertaining to said course.
app.get('/get_course.php?*', sendOutRequest, function(request, response) {
	notify.on("next", function(message, status) {
		child = exec(`perl parser/scripts/extraction.pl \"${message}\"`, function(error, stdout, stderr) {
			console.log("stdout: %s", stdout);
			if (error !== null) {
				console.log("exec error: " + error);
			}
		});
		response.append("Content-Type", "text/html");
		response.append("cache-control", "max-age=0, no-store");
		response.status(status);
		response.send(message);
		notify = new Notifier();
		notify.setMaxListeners(100);
	});
});



proxy.on('error', function(error, request, response) {
	response.writeHead(500, {
		'Content-Type': 'text/plain'
	});
	response.end('Something went wrong with the proxy');
});

app.get('/css/*', function(request, response) {
  var url = request.path;
  url = "public" + url;
  returnRequestedFile(response, url);
});

// Browser is requesting a CSV file containing data pertaining to the
// courses. Needs to return an object relative to where server is, not
// "public" directory.
app.get('/parser/csv/*.csv', function(request, response) {
	var url = request.path;
	console.log("Returning %s", url);
	returnRequestedFile(response, url);
});

// Browser is requesting json objects that contain data pertaining to
// the courses. Needs to return object at a relative path that doesn't
// begin with "public".
app.get('/data/*.json', function(request, response) {
	var url = request.path;
	child = exec("pwd", function (error, stdout, stderr) {
		console.log('stdout: %s', stdout);
		if (error !== null) {
			console.log('exec error: ' + error);
		}
	});
	console.log("Page: ", url);
	returnRequestedFile(response, url);
}, function(request, response) {
	console.log("Failure!!");
});


// The web app is requesting library type sources, not our actual source
// code, and we expand this simplified URL into a larger one, usually
// beginning with node_modules.
app.get('*/scripts/*.js*', function(request, response) {
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
	returnRequestedFile(response, url);
});

app.get('/templates/*.html', function(request, response) {
	var url = request.path;
	returnRequestedFile(response, url);
});

app.post('/poster.json', function(request, response) {
	console.log("Post received");
	fs.writeFile("fall_2016.json", JSON.stringify(request.body));
});

var io = require('socket.io').listen(httpsServer),
		client = require('socket.io-client');
app.get("/", function(request, response) {
  returnRequestedFile(response, "./index.html");
});

app.get("index.html", function(request, response) {
	notify.emit("thar she blows");
});

app.get('*', function(request, response) {
  var url = request.path;
  returnRequestedFile(response, url);
});

app.use("/", express.static("./public/"));
var server = app.listen(process.env.PORT || 4001, 'localhost', function() {
  var addr = server.address();
  console.log("Listening @ http://%s:%d", addr.address, addr.port);
});

var herokuServer = app.listen(process.env.PORT, function() {
	var addr = herokuServer.address();
  console.log("Listening @ http://%s:%d", addr.address, addr.port);
});
// var secretServer = app.listen(4002, 'localhost', function() {
// 	var addr = secretServer.address();
// 	console.log("Listening @ https://%s:%d", addr.address, addr.port);
// });
