// I was originally going to write this in Python but due to the really
// asyncronous nature of Javascript itself, decided it would be a better idea
// to have Javascript deal with it, at least initially.
// Also apparently I can't do anything without using Angular so oh well

angular.module("myApp")
  .controller("CourseController", CourseController)

CourseController.$inject = ["$scope", "DownloadCourses", "CourseParser", '$interval', '$http', 'CourseCounter'];

function CourseController($scope, DownloadCourses, CourseParser, $interval, $http, CourseCounter) {
  $scope.courses = [];
  $scope.index = 0;
  $scope.download = download;
  $scope.downloadMissing = downloadMissing;
  $scope.preprocess = preprocess;
  $scope.cancelInterval = cancelInterval;
  $scope.postData = postData;
  $scope.pickDataToShow = pickDataToShow;
  $scope.counter = 0;
  var classesPerDay = {};
  var seatsPerDay = {};
  var seatsPerLevel = {};
  // $scope.download();

  function pickDataToShow() {
    if ($scope.counter % 3 == 1) {
      $scope.data1 = seatsPerDay;
      $scope.data = classesPerDay;
    } else if ($scope.counter % 3 == 2){
      $scope.data1 = classesPerDay;
      $scope.data = seatsPerLevel;
    } else {
      $scope.data1 = seatsPerLevel;
      $scope.data = seatsPerDay;
    }
    $scope.data2 = CourseCounter.findEnrollmentByStart($scope.courses);
    $scope.counter++;
    var scatterChart = new Chart($("#myChart2"), {
        type: 'line',
        data: {
          datasets: [{
            data: $scope.data2
          }]
        },
        options: {
            scales: {
                xAxes: [{
                    type: 'linear',
                    position: 'bottom'
                }]
            }
        }
    });


  }

  function download() {
    var promise = $http.get("/data/fall_2016.json");
    promise.then(function(response) {
      $scope.courses = angular.fromJson(response.data);
      classesPerDay = CourseCounter.findNumClassesPerWeekday($scope.courses);
      seatsPerDay = CourseCounter.findNumSeatsPerWeekday($scope.courses);
      seatsPerLevel = CourseCounter.findNumSeats($scope.courses);
      // $scope.downloadMissing();
      console.log("Success", $scope.courses);
    });
  }

  function downloadMissing() {
    DownloadCourses.findMissing($scope.courses);
    var missing = DownloadCourses.missing;
    var numMissing = DownloadCourses.numMissing;
    $scope.index = 0;
    $scope.intervalPromise = $interval(function() {
      var promise = DownloadCourses.getCourse(DownloadCourses.missing[$scope.index]);
      $scope.index++;
      if ($scope.index % 20 === 0) {
        console.log("Done %d out of %d", $scope.index, numMissing);
      }
      promise.then(function(response) {
        console.log(response.statusText, response.status, response.data);
        $scope.preprocess(response.data);
      });
    }, 1500, DownloadCourses.numMissing);
  }

  $scope.reloadCourse = function() {
    var times = [1, 2, 3, 4];
    // angular.forEach(times, function(item, index) {
    $scope.intervalPromise = $interval(function() {
      var promise = DownloadCourses.getCourse(null, $scope.index);
      $scope.index++;
      promise.then(function(response) {
        console.log(response.statusText, response.status);
        $scope.preprocess(response.data);
      });
    }, 1000, DownloadCourses.courseData.length);
    // });
  };

  function postData() {
    console.log(angular.toJson($scope.courses));
    var promise = $http.post("/poster.json", angular.toJson($scope.courses));
    promise.then(function(response) {
      console.log("Success", response.status, response.statusText);
    });
  }

  function cancelInterval() {
    $interval.cancel($scope.intervalPromise);
  }

  function lacksCourse(crn) {
    for (var i = 0; i < $scope.courses.length; i++) {
      if (crn === $scope.courses[i].regNum) {
        return false;
      }
    }
    return true;
  }

  function preprocess(string) {
    // In: string
    // Out: object with description, crn, creditHours, currentEnrollment, seatsAvailable, maxEnrollment, meetingDays, meetingTimes, location, distributions, prerequisites
    // var element = document.createElement("div");
    // $(element).html(string);
    var courseInfo = {raw: []};
    // console.log(string);
    var parsed = $.parseHTML(string);
    var myElement;
    $.each(parsed, function(i, element) {
      // console.log(element);
      if ($(element).hasClass("coursedetail col-xs-12")) {
        myElement = element;
      }
      if ($(element).hasClass("divHeaders")) {
        courseInfo.code = $(element).html();
      }
      if ($(element).is("title")) {
        // console.log(element);
        courseInfo.title = $(element).text();
      }
      if ($(element).hasClass("professorname")) {
        courseInfo.professor = $(element).text();
      }
    });
    // console.log(myElement);
    $(myElement).children("div").each(function(i, element) {
      if (!$(element).hasClass("coursedetail01") && !$(element).hasClass("coursedetail02")) {
        courseInfo.description = $(element).html();
        return;
      }
    });
    // console.log(courseInfo.description);
    $(myElement).children("div.col-xs-12.coursedetail01").each(function(i, element) {
      courseInfo.raw.push($(element).text());
    });
    // console.log(angular.toJson(courseInfo.raw));
    details = CourseParser.parseCourse(courseInfo.raw);
    if (lacksCourse(details.regNum)) {
      for (var k in courseInfo) {
        details[k] = courseInfo[k];
      }
      // console.log(details);
      $scope.courses.push(details);
    }
  }
}
