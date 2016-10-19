angular.module('myApp')
  .directive('courseSchedule', courseSchedule);


function courseSchedule() {
  return {
    restrict: 'E',
    scope: {courses: "=", preSelections: "=", version: "="},
    templateUrl: 'templates/course-schedule.html',
    link: function($scope, element, attrs, ctrl) {
      $scope.selectedCourses = {};
      $scope.selectedCourses[$scope.version] = [];
      var selected = [];
      $scope.addOldCourses = addOldCourses;
      $scope.genericSchedule = genericSchedule;
      $scope.wasSelectedPreviously = wasSelectedPreviously;
      $scope.schedule = schedule;
      $scope.displayInformation = displayInformation;
      $scope.hideDisplayInformation = hideDisplayInformation;
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
        $scope.genericSchedule();
      }, 100);

      $scope.$on('New-Preselected-Courses', function(event, data) {
        $scope.version = data.version;
        $scope.selectedCourses[$scope.version] = [];
        $scope.preSelections = data.data;
        $scope.addOldCourses();
        $scope.genericSchedule();
      });

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
              console.log("Added course %d.", parseInt(c.regNum));
              $scope.courses[indexA][$scope.version] = true;
              $scope.selectedCourses[$scope.version].push(c);
              selected.push(element);
              return;
            } else if (!c[$scope.version]) {
              $scope.courses[indexA][$scope.version] = false;
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
          if (element[$scope.version] && !select.truth) {
            selected.push(element.regNum);
            console.log("Added an element #%s", element.regNum);
            $scope.selectedCourses[$scope.version].push(element);
          } else if (!element[$scope.version] && select.truth) {
            // console.log("Removing.");
            $scope.selectedCourses[$scope.version].splice(select.index, 1);
          }
        });
        if ($scope.selectedCourses[$scope.version].length > 0) {
          $scope.$emit("NeedToSaveSelections", $scope.selectedCourses[$scope.version]);
        }
      }

      function displayInformation(event) {
        console.log("Something was clicked.");
        var target = $(event.target);
        var course = "";
        for (var i = 0; i < $scope.selectedCourses[$scope.version].length; i++) {
          if (target.hasClass('courses-meet-num-' + (i + 1))) {
            course = $scope.selectedCourses[$scope.version][i];
            break;
          }
        }
        var display = $("#course-information");
        display.addClass('selected');
        display.html(`<div class="course-information-content"><p class="centered big-font"><em>${course.classCode}</em></p>
        <p class="centered small-font"><em>${course.titleString}</em></p>
        <p class="centered small-font"><em>${course.professor}</em></p>
        <em>CRN</em>: ${course.regNum}<br>
        <em>Credit</em>: ${course.credit}<br>
        <em>Meeting times</em>: ${course.timeString}<br>
        <em>Days</em>: ${course.dayString}<br>
        <em>Enrolled</em>: ${course.enrollment}<br>
        <em>Available</em>: ${course.available}<br>
        <em>Max</em>: ${course.max}<br>
        <p><em>Prerequisites</em>: ${course.prerequisites}<br>
        <p><em>Description</em>: ${course.description}</p></div>`);
        var deleteButton = $(document.createElement('button'));
        deleteButton.attr('type', 'button');
        deleteButton.addClass('course-information-delete-button');
        deleteButton.html('X');
        deleteButton.on('click', hideDisplayInformation);
        deleteButton.css('z-index', 1100);
        display.prepend(deleteButton);
      }

      function hideDisplayInformation(event) {
        var display = $("#course-information");
        display.removeClass('selected');
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

      function createScheduleItem(dur, course, heightPercent, topPercent, num, str1, str2, d, index) {
        index = index || 0;
        var j = $(document.createElement('div'));
        var left = "";
        var rand = Math.random();
        if (rand > .5) {
          left = "49px";
        } else {
          left = "0px";
        }

        // console.log("Course: %s", angular.toJson(course));

        j.addClass('courses-meet');
        j.addClass('courses-meet-num-' + num);
        if (dur.duration <= 120) {
          j.addClass('courses-meet-short');
        } else if (dur.duration >= 180) {
          j.addClass('courses-meet-long');
        }
        j.attr('ng-click', 'displayInformation($event)')
        j.on('click', displayInformation);

        var h = $("#" + dict[d]).height();

        j.html(str1 + "-" + str2 + "<br>Dept: " + course.dept + "<br>#: " + course.dNum + "<br>" + course.titleString);
        j.css({position: 'absolute', top: (topPercent * h) + "px", left: left});
        // console.log("%d: %s, %s", index, d, dict[d]);
        // console.log("Duration: minutes %d, %f", dur.duration, heightPercent * h);
        j.height(h * heightPercent + "px");
        j.width("100px");
        return j;
      }

      function schedule() {
        addSelectedCourses();
        genericSchedule();
      }

      function genericSchedule() {
        emptySchedule();
        $scope.credits = 0;
        $scope.selectedCourses[$scope.version].forEach(function(element, indexA, sc) {
          if (element.credit) {
            $scope.credits += parseFloat(element.credit);
          }
          if (element.day && element.time1) {
            element.day.forEach(function(d, indexB, e) {
              var days = extractDays(d);
              // console.log("Days: %s", angular.toJson(days));


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
                console.log("Appended to #%s", dict[d]);
              } else {
                angular.forEach(days, function(ds, index) {
                  // var j = $(document.createElement('div'));
                  // var left = "";
                  // var rand = Math.random();
                  // var h = $("#" + dict[ds]).height();
                  // var rand = Math.random();
                  //
                  // if (rand > .5) {
                  //   left = "49px";
                  // } else {
                  //   left = "0px";
                  // }
                  //
                  // j.addClass('courses-meet');
                  // j.addClass('courses-meet-num-' + num);
                  // if (dur.duration <= 120) {
                  //   j.addClass('courses-meet-short');
                  // } else if (dur.duration >= 180) {
                  //   j.addClass('courses-meet-long');
                  // }
                  // console.log("Course: %s", angular.toJson(sc[indexA]));
                  // j.html(str1 + "-" + str2 + "<br>Dept: " + sc[indexA].dept + "<br>Course Num: " + sc[indexA].dNum + "<br>" + sc[indexA].titleString);
                  //
                  // j.css({position: 'absolute', top: (topPercent * h) + "px", left: left});
                  // j.height(h * heightPercent + "px");
                  // j.width("100px");
                  // j = createScheduleItem(dur, sc[indexA], heightPercent, topPercent, num, str1, str2, ds);
                  var j = createScheduleItem(dur, sc[indexA], heightPercent, topPercent, num, str1, str2, ds, index);
                  $("#" + dict[ds]).append(j);

                  // console.log("%d: %s, %s", index, ds, dict[ds]);
                  // console.log("Duration: minutes %d, %f", dur.duration, heightPercent * h);
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
        angular.forEach($scope.selectedCourses[$scope.version], function(e, index) {
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
