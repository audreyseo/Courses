angular.module("myApp")
  .service("DownloadCourses", DownloadCourses)
  .factory("CourseParser", CourseParser);

DownloadCourses.$inject = ["$q", "$http", "$log"]

function DownloadCourses($q, $http, $log) {
  var service = {};
  var count = 0;
  var debugCount = 0;
  service.courseData = [];
  service.debug = debug;
  service.downloadCsv = downloadCsv;
  service.getCourse = getCourse;
  service.findMissing = findMissing;
  service.debugData = [];
  service.numCourses = 0;
  var parserDir = "parser";
  var csvDir = "csv";
  var csvName = "dummy.csv";
  init();

  function debug() {
    if (debugCount < service.numDebugs) {
      var promise = service.getCourse(service.debugData[debugCount], null, "/get_bad.php");
      promise.then(function(data) {
        debugCount++;
        service.debug();
      });
    }
  }

  function downloadCsv() {
    var promise = $http.get(`/${parserDir}/${csvDir}/${csvName}`);
    var deferred = $q.defer();
    promise.then(function(response) {
      $log.info("Successful response: ", response.status, response.statusText);

      var comma = ";";
      var csv = response.data.split("\n");
      var headers = csv[0].split(comma);
      service.data = [];
      var special = ["day", "time1", "time2", "distCode", "distDescription", "distributions"];
      for (var i = 1; i < csv.length; i++) {
        var line = csv[i].split(comma);
        var obj = {};
        for (var j = 0; j < line.length; j++) {
          if (!line[j].match(/\|/) && (special.indexOf(headers[j]) < 0)) {
            obj[headers[j]] = line[j];
          } else if (line[j].match(/\|/)){
            if (headers[j] === "day") {
              line[j] = line[j].replace(/\d/g, "");
            }
            obj[headers[j]] = line[j].split("|");
          } else if (special.indexOf(headers[j]) >= 0) {
            obj[headers[j]] = [line[j]];
          } else {
            obj[headers[j]] = line[j];
          }
        }
        service.data.push(obj);
      }
      $log.info("Course data: %s", angular.toJson(service.data));
      deferred.resolve(service.data);
    });
    var obj = {};
    obj.originalPromise = promise;
    obj.promise = deferred.promise;
    return obj;
  }

  function init() {
    // Need to fetch list of courses in order to actually do anything with them
    var promise = $http.get("/data/parsed_text.json");
    var promise2 = $http.get("/data/problem_classes.json");
    promise.then(function(response) {
      $log.info("Successful Response: ", response.status, response.statusText);
      // $log.info("Data: ", response.data);
      service.courseData = angular.fromJson(response.data.courses);
      service.numCourses = service.courseData.length;
    });
    promise2.then(function(response) {
      $log.info("Successful Response: ", response.status, response.statusText);
      service.debugData = angular.fromJson(response.data.courses);
      service.numDebugs = service.debugData.length;
    });
  }

  function findMissing(otherCourses) {
    service.numMissing = service.courseData.length - otherCourses.length;
    console.log("Masterlist - Otherlist: %d", service.numMissing);
    service.missing = [];
    for (var i = 0; i < service.courseData.length; i++) {
      for (var j = 0; j < otherCourses.length; j++) {
        if (otherCourses[j]) {
          if (otherCourses[j.regNum]) {
            if (otherCourses[j].regNum === service.courseData[i][0]) {
              break;
            }
          }
        }
      }
      if (j === otherCourses.length) {
        if (otherCourses[j]) {
          if (otherCourses[j].regNum) {
            if (otherCourses[j].regNum !== service.courseData[i][0]) {
              service.missing.push(service.courseData[i]);
            }
          } else if (service.courseData[i]) {
            service.missing.push(service.courseData[i]);
          }
        }
      }
    }
  }


  // Helper function, private
  function zip(arry1, arry2) {
    // We should have 8 buckets in the array, only 6 of which we need
    var length = 6;
    arry2.splice(6, 1);
    arry2.splice(4,1);
    // console.log(arry2.splice(6, 1));
    // console.log(arry2.splice(4, 1));
    // console.log(arry2)
    var zipString = "";
    for (var i = 0; i < length; i++) {
      // console.log(arry2[i])
      if (arry2[i]) {
        zipString += arry1[i] + arry2[i];
      } else {
        zipString += arry1[i];
      }
    }
    return zipString;
  };


  function getCourse(paramArray, index, paramUrl) {
    // I legitimately just copied and pasted this off of the Wellesley website.
    // With a lot of tweaks of course, to handle cross-domain stuff
    index = index || count;
    count++;
    paramArray = paramArray || service.courseData[index];
    paramUrl = paramUrl || "/get_course.php";
    var deferred = $q.defer()
    // var p_url= "https://webapps.wellesley.edu/new_course_browser/display_single_course_cb.php";
    // Changed this to a request to our own server
    var p_url = paramUrl;
    var params = [
      "crn=",
      "&semester=",
      "&pe_term=",
      "&frame_title=",
      "&show_locations=",
      "&show_schedules="
    ];

    var p_data = zip(params, paramArray);
    // console.log("p_data: %s", p_data);

    var rq = $http.get(p_url + "?" + p_data);

    rq.then(function(data, textStatus, jqXHR) {
      $log.debug("Request is done", data.textStatus);
      deferred.resolve(data.data);
    });


    return rq;
  }
  return service;
}


function CourseParser() {
  var factory = {};
  factory.parseCourse = parseCourse;
  var keys = {
    "CRN": "regNum",
    "Credit Hours": "credit",
    "Current Enrollment": "enrollment",
    "Seats Available": "available",
    "Max Enrollment": "max",
    "Meeting Time(s)": ["day", "time1", "time2"],
    "Loc": "location",
    "Distributions": ["code", "long"],
    "Prerequisites(s)": "prereqs"
  };

  function parseCourse(strArray) {
    // console.log(angular.toJson(strArray));
    var course = {};
    strArray.forEach(function(item, index) {
      for (var k in keys) {
        if (contains(item, k)) {
          if (k !== "Meeting Time(s)" && k !== "Loc" && k !== "Distributions" && k !== "Prerequisites(s)") {
            var ck = keys[k];
            course[ck] = extractNum(item, k);
          } else if (k === "Prerequisites(s)") {
            var ck = keys[k];
            var prereqs = extract(item, k);
            if (prereqs === "None") {
              prereqs = 0;
            }
            course[ck] = prereqs;
          } else {
            var valArray = keys[k];
            switch(k) {
              case "Meeting Time(s)":
                var str = extract(item, k);
                // console.log(str);
                var split1 = str.split(";");
                // console.log(angular.toJson(split1));
                if (split1.length === 1) {
                  var split = str.split(" - ");
                  course[valArray[0]] = [];
                  course[valArray[1]] = [];
                  course[valArray[2]] = [];
                  course[valArray[0]].push(split[0]);
                  course[valArray[1]].push(split[1]);
                  course[valArray[2]].push(split[2]);
                } else {
                  course[valArray[0]] = [];
                  course[valArray[1]] = [];
                  course[valArray[2]] = [];
                  for (var s in split1) {
                    var split = split1[s].split(" - ");
                    // console.log("split", angular.toJson(split));
                    // for (var n in split) {
                    course[valArray[0]].push(split[0]);
                    course[valArray[1]].push(split[1]);
                    course[valArray[2]].push(split[2]);
                    // }
                  }
                }
                break;
              case "Loc":
                // console.log(item);
                var str = extract(item, k);
                var ck = keys[k];
                course[ck] = {};
                // var extract = extract(item, k);
                course[ck]["classRm"] = extractClassRoom(str);
                course[ck]["building"] = extractBuilding(str);
                break;
              case "Distributions":
                var str = extract(item, k);
                // var split = str.split(" - ");
                course["distr"] = str;
                break;
            }
          }
        }
      }
    });
    return course;
  }

  function extractClassRoom(str) {
    var a = str.lastIndexOf(" ");
    return str.substring(a);
  }

  function extractBuilding(str) {
    var a = str.lastIndexOf(" ");
    return str.substring(0, a);
  }

  function extract(str, key) {
    if (contains(key, "P") || contains(key, "D")) {
      var a = end(str, key) + 2; // 2 accounts for the colon (:) and the space " "
      return str.substring(a);
    } else {

      var a = end(str, key) + 2;
      if (key !== "Loc") {

        var b = str.indexOf("Loc") - 1;
        b = (b < 0) ? str.length : b;
        // console.log("A:", str, a, b);
        return str.substring(a, b);
      } else {
        // console.log("B:", str, a);
        return str.substring(a);
      }
    }
  }

  function extractNum(str, key) {
    var a = key;
    var b = ";";
    var ia = first(str, a);
    ia = str.indexOf(":", ia);
    var ib = str.indexOf(b, ia);
    var sequence = str.substring(ia + 2, ib);
    return parseInt(sequence);
  }
  function end(str, key) {
    return str.indexOf(key) + key.length;
  }
  function first(str, key) {
    return str.indexOf(key);
  }

  function contains(str, key) {
    return (str.indexOf(key) > -1);
  }

  return factory;
}
