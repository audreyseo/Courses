// I was originally going to write this in Python but due to the really
// asyncronous nature of Javascript itself, decided it would be a better idea
// to have Javascript deal with it, at least initially.
// Also apparently I can't do anything without using Angular so oh well

angular.module("myApp")
  .controller("CourseController", CourseController)

CourseController.$inject = ["$scope", "DownloadCourses", "CourseParser", '$interval', '$http', '$cookies', 'CourseCounter', 'coursesFilter', 'multipleDepartmentsFilter'];

function CourseController($scope, DownloadCourses, CourseParser, $interval, $http, $cookies, CourseCounter, coursesFilter, multipleDepartmentsFilter) {
  $scope.versionNumbers = [];
  $scope.courses = [];
  $scope.filteredCourses = [];
  $scope.index = 0;
  $scope.deselectAll = deselectAll;
  $scope.displayingThisOne = displayingThisOne;
  $scope.download = download;
  $scope.downloadMissing = downloadMissing;
  $scope.maxVersions = "4";
  // $scope.previouslySelectedCourses = $cookies.getObject("WellesleyCourseSelections") || [];
  // console.log("previouslySelectedCourses: %s", angular.toJson($scope.previouslySelectedCourses));
  $scope.multiplesChanged = multiplesChanged;
  $scope.semester = "201609";
  $scope.debug = debug;
  $scope.preprocess = preprocess;
  $scope.redownload = redownload;
  $scope.cancelInterval = cancelInterval;
  $scope.postData = postData;
  $scope.pickDataToShow = pickDataToShow;
  $scope.search = search;
  $scope.updateView = updateView;
  $scope.clearSearch = clearSearch;
  $scope.counter = 0;
  var classesPerDay = {};
  var seatsPerDay = {};
  var seatsPerLevel = {};
  $scope.download();
  retrieveCookies();

  function debug() {
    DownloadCourses.debug();
  }

  function updateView() {
    console.log("Updating view: %s, %s", $scope.displayVersion.letter, angular.toJson($scope.previouslySelectedCourses[$scope.displayVersion.letter]));
    var obj = {
      data: $scope.previouslySelectedCourses[$scope.displayVersion.letter],
      version: $scope.displayVersion.letter
    }
    $scope.$broadcast("New-Preselected-Courses", obj);
  }


  function retrieveCookies() {
    $scope.previouslySelectedCourses = {};
    angular.forEach($scope.versionNumbers, function(element, index) {
      console.log(`Element: ${angular.toJson(element)}`)
      var mine = $cookies.getObject(`WellesleyCourseSelections-${element.letter}`);
      if (mine) {
        $scope.previouslySelectedCourses[element.letter] = mine;
      } else {
        $scope.previouslySelectedCourses[element.letter] = [];
      }
    });
    console.log("previouslySelectedCourses: %s", angular.toJson($scope.previouslySelectedCourses));
  }

  $scope.$on("NeedToSaveSelections", function(event, data) {
    console.log("Received NeedToSaveSelections Event");
    var newData = data.map(function(val, index, array) {
      return val.regNum;
    });
    $scope.previouslySelectedCourses[$scope.displayVersion.letter] = newData;
    console.log("New data: %s", newData.join(","));
    $cookies.putObject(`WellesleyCourseSelections-${$scope.displayVersion.letter}`, newData);
  });

  function deselectAll() {
    angular.forEach($scope.courses, function(elem, index) {
      if (elem.selected) {
        elem.selected = false;
      }
    });
  }

  function displayingThisOne(letter) {
    return($scope.displayVersion.letter === letter);
  }

  function redownload() {
    $scope.downloadPromise = DownloadCourses.getCourse();
    $scope.downloadPromise.then(function(response) {
      console.log("Responded.");
      redownload();
    });
  }

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

    var letters = ["A", "B", "C", "D", "E", "F", "G", "H", "I", "J", "K"];
    for (var i = 0; i < 10; i++) {
      $scope.versionNumbers.push({
        number: (i + 1),
        letter: letters[i]
      });
    }
    $scope.displayVersion = $scope.versionNumbers[0];
    var promise = DownloadCourses.downloadCsv(); //$http.get("/data/fall_2016.json");
    $scope.departments = DownloadCourses.departments;
    promise.promise.then(function(data) {
      $scope.courses = data;
      classesPerDay = CourseCounter.findNumClassesPerWeekday($scope.courses);
      seatsPerDay = CourseCounter.findNumSeatsPerWeekday($scope.courses);
      seatsPerLevel = CourseCounter.findNumSeats($scope.courses);
      // $scope.downloadMissing();
      $scope.filteredCourses = $scope.courses;
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

  function multiplesChanged(obj) {
    if ((typeof obj) !== 'undefined') {
      $scope.filteredCourses = multipleDepartmentsFilter($scope.courses, obj);
    } else {
      $scope.filteredCourses = $scope.courses;
    }
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

  $scope.$watch('semester', function(newValue, oldValue) {
    DownloadCourses.init(newValue);
  });

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

  function clearSearch() {
    $scope.filteredCourses = $scope.courses;
  }

  function search(string) {
    if ((typeof string) !== 'undefined') {
      console.log('String: ', string);
      if (string.length >= 1) {
        $scope.filteredCourses = coursesFilter($scope.courses, string);
        console.log("Searched %s for %s", angular.toJson($scope.filteredCourses), string);
      } else {
        $scope.clearSearch();
      }
    } else {
      $scope.clearSearch();
    }
  }
}
