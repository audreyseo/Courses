angular.module('myApp')
  .directive('courseSchedule', courseSchedule);


function courseSchedule() {
  return {
    restrict: 'E',
    scope: {courses: "=", preSelections: "="},
    templateUrl: 'templates/course-schedule.html',
    link: function($scope, element, attrs, ctrl) {
      $scope.selectedCourses = [];
      var selected = [];
      $scope.addOldCourses = addOldCourses;
      $scope.wasSelectedPreviously = wasSelectedPreviously;
      $scope.schedule = schedule;
      $scope.courseAttributes = ["regNum", "dept", "dNum", "titleString", "day", "time1", "time2", "building", "room", "credit", "available", "max", "distributions"];
      var dict = {
        'M': 'monday',
        'T': 'tuesday',
        'W': 'wednesday',
        'Th': 'thursday',
        'F': 'friday'
      };
      setTimeout(function () {
        $scope.addOldCourses();
        $scope.schedule();
      }, 100);

      function wasSelectedPreviously(id) {
        if (parseInt(id) in selected) {
          var element = {regNum: id};
          var obj = alreadySelected(element);
          if (!obj.truth) {
            return true;
          }
        }
        return false;
      }

      function addOldCourses() {
        $scope.preSelections.forEach(function(element, index) {
          $scope.courses.forEach(function(c, indexA) {
            if (parseInt(c.regNum) === parseInt(element)) {
              console.log("Added course.");
              $scope.selectedCourses.push(c);
              c.selected = true;
              selected.push(element);
            } else {
              c.selected = false;
            }
          });
        });
        if ($scope.selectedCourses.length > 0) {
          $scope.$emit("NeedToSaveSelections", $scope.selectedCourses);
        }
      }
      function addSelectedCourses() {
        $scope.courses.forEach(function(element, index) {
          var select = alreadySelected(element);
          // console.log("Should be removed?: " + (!element.selected) + " " + (select.truth));
          if (element.selected && !select.truth) {
            selected.push(element.regNum);
            // console.log("Added an element.");
            $scope.selectedCourses.push(element);
          } else if (!element.selected && select.truth) {
            // console.log("Removing.");
            $scope.selectedCourses.splice(select.index, 1);
          }
        });
        if ($scope.selectedCourses.length > 0) {
          $scope.$emit("NeedToSaveSelections", $scope.selectedCourses);
        }
      }

      function emptySchedule() {
        for (var key in dict) {
          $("#" + dict[key]).empty();
        }
      }

      function extractDays(day) {
        // Split day at every in-between except if followed by 'h'
        return day.split(/(?!h)/);
      }

      function createScheduleItem(dur, course, heightPercent, topPercent, num, str1, str2, d) {
        var j = $(document.createElement('div'));
        var left = "";
        var rand = Math.random();
        if (rand > .5) {
          left = "49px";
        } else {
          left = "0px";
        }

        j.addClass('courses-meet');
        j.addClass('courses-meet-num-' + num);
        if (dur.duration <= 120) {
          j.addClass('courses-meet-short');
        } else if (dur.duration >= 180) {
          j.addClass('courses-meet-long');
        }


        var h = $("#" + dict[d]).height();
        j.html(str1 + "-" + str2 + "<br>Dept: " + course.dept + "<br>#: " + course.dNum + "<br>" + course.titleString);
        j.css({position: 'absolute', top: (topPercent * h) + "px", left: left});
        console.log("Duration: minutes %d, %f", dur.duration, heightPercent * h);
        j.height(h * heightPercent + "px");
        j.width("100px");
        return j;
      }

      function schedule() {
        addSelectedCourses();
        emptySchedule();
        $scope.credits = 0;
        $scope.selectedCourses.forEach(function(element, indexA, sc) {
          if (element.credit) {
            $scope.credits += parseInt(element.credit);
          }
          if (element.day && element.time1) {
            element.day.forEach(function(d, indexB, e) {
              var days = extractDays(d);
              console.log("Days: %s", angular.toJson(days));


              var num = (indexA + 1);
              var str1 = sc[indexA].time1[indexB];
              str1 = correctStr(str1);
              var str2 = sc[indexA].time2[indexB];
              str2 = correctStr(str2);
              var dur = duration(str1, str2);

              // Make the days start from 8 am.
              var heightPercent = (dur.duration) / (1440.0 - (8.0 * 60.0));
              var topPercent = (dur.start - (8.0 * 60.0)) / (1440.0 - (8.0 * 60.0));

              if (d.length <= 2 && days.length == 1) {
                var j = createScheduleItem(dur, sc[indexA], heightPercent, topPercent, num, str1, str2, d);

                $("#" + dict[d]).append(j);
              } else {
                angular.forEach(days, function(ds, index) {
                  var j = $(document.createElement('div'));
                  var left = "";
                  var rand = Math.random();
                  var h = $("#" + dict[ds]).height();
                  var rand = Math.random();

                  if (rand > .5) {
                    left = "49px";
                  } else {
                    left = "0px";
                  }

                  j.addClass('courses-meet');
                  j.addClass('courses-meet-num-' + num);
                  if (dur.duration <= 120) {
                    j.addClass('courses-meet-short');
                  } else if (dur.duration >= 180) {
                    j.addClass('courses-meet-long');
                  }
                  console.log("Course: %s", angular.toJson(sc[indexA]));
                  j.html(str1 + "-" + str2 + "<br>Dept: " + sc[indexA].dept + "<br>Course Num: " + sc[indexA].dNum + "<br>" + sc[indexA].titleString);

                  j.css({position: 'absolute', top: (topPercent * h) + "px", left: left});
                  j.height(h * heightPercent + "px");
                  j.width("100px");
                  j = createScheduleItem(dur, sc[indexA], heightPercent, topPercent, num, str1, str2, ds);

                  $("#" + dict[ds]).append(j);

                  console.log("%d: %s, %s", index, ds, dict[ds]);
                  console.log("Duration: minutes %d, %f", dur.duration, heightPercent * h);
                  console.log("Appended to #%s", dict[ds]);
                });
              }
            });
          }
        });
      };

      function correctStr(string) {
        string = string.replace(/^0/, "");
        return string;
      }

      function duration(str1, str2) {
        var t1 = parseTime(str1),
            t2 = parseTime(str2);
        console.log("Times: %d, %d", t1, t2);
        return {
          start: t1,
          duration: (t2 - t1)
        };
      }

      function parseTime(str) {
        var tArry = str.split(/\s*\:+\s*|\s/)
        console.log('Array: ' + angular.toJson(tArry));
        var hr = tArry[0];
        hr = parseInt(hr);
        var min = tArry[1];
        min = parseInt(min);
        if (tArry[2]) {
          var pm = (tArry[2].match(/pm/)) ? true : false;
          if (pm && hr < 12) {
            hr = hr + 12;
          }
        }
        return (hr * 60) + min;
      }

      function alreadySelected(element) {
        var ret = "";
        angular.forEach($scope.selectedCourses, function(e, index) {
          if (e.regNum === element.regNum) {
            console.log("RegNum: " + e.regNum + " " + element.regNum);
            ret = {
              index: index,
              truth: true
            };
            return;
          }
        });
        return ret || { truth: false };
      }
    }
  };
}

angular.module('myApp')
  .directive('coursesViewer', coursesViewer)
  .directive('wellesleyCourse', wellesleyCourse);

function coursesViewer() {
  return {
    restrict: 'E',
    transclude: true,
    scope: {},
    controller: function($scope) {
      var courses = $scope.courses = [];
      $scope.select = function(course) {
        // angular.forEach(courses, function(c) {
        //   c.selected = false;
        // });
        course.selected = !course.selected;
      };

      this.addCourse = function(course) {
        // if (courses.length === 0) {
        //   $scope.select(course);
        // }
        var days = course.day;
        // console.log("Type of 'days': " + (typeof days));
        var time1 = course.time1;
        var time2 = course.time2;
        var times = [];
        for (var i = 0; i < time1.length; i++) {
          times.push(time1[i] + "-" + time2[i]);
        }
        var distributions = course.distributiions;
        course.dayString = days.join(", ");
        course.timeString = times.join(", ");
        course.distributionString = distributions; //distributions.join(",");

        courses.push(course);
      };
    },
    templateUrl: "templates/courses-viewer.html"
  };
}

function wellesleyCourse() {
  return {
    require: '^^coursesViewer',
    restrict: 'E',
    transclude: true,
    templateUrl: "templates/wellesley-course.html",
    scope: {course: '=', title: '=', distributions: '=', days: '=', time1: '=', time2: "="},
    link: function(scope, element, attrs, viewerCtrl) {
      if (scope.course.day) {
        if (scope.course.time1) {
          viewerCtrl.addCourse(scope.course);
        }
      }
    }
  };
}
