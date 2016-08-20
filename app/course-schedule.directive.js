angular.module('myApp')
  .directive('courseSchedule', courseSchedule);


function courseSchedule() {
  return {
    restrict: 'E',
    scope: {courses: "="},
    templateUrl: 'templates/course-schedule.html',
    link: function($scope, element, attrs, ctrl) {
      $scope.selectedCourses = [];
      $scope.schedule = schedule;

      $scope.schedule();

      function schedule() {
        $scope.courses.forEach(function(element, index) {
          var select = alreadySelected(element);
          // console.log("Should be removed?: " + (!element.selected) + " " + (select.truth));
          if (element.selected && !select.truth) {
            // console.log("Added an element.");
            $scope.selectedCourses.push(element);
          } else if (!element.selected && select.truth) {
            // console.log("Removing.");
            $scope.selectedCourses.splice(select.index, 1);
          }
        });
        var dict = {
          'M': 'monday',
          'T': 'tuesday',
          'W': 'wednesday',
          'Th': 'thursday',
          'F': 'friday'
        };
        for (var key in dict) {
          $("#" + dict[key]).empty();
        }
        $scope.selectedCourses.forEach(function(element, indexA, sc) {
          if (element.day && element.time1) {
            element.day.forEach(function(d, indexB, e) {

              var days = d.split(/(?!h)/);
              console.log("Days: %s", angular.toJson(days));


              var num = (indexA + 1);
              var str1 = sc[indexA].time1[indexB];
              str1 = correctStr(str1);
              var str2 = sc[indexA].time2[indexB];
              str2 = correctStr(str2);
              var dur = duration(str1, str2);
              var heightPercent = (dur.duration) / 1440.0;
              var topPercent = (dur.start) / 1440.0;
              if (d.length <= 2 && days.length == 1) {
                var elem = document.createElement('div');
                var j = $(elem);

                j.addClass('courses-meet');

                j.addClass('courses-meet-num-' + num);

                var left = 0;
                var rand = Math.random();
                if (rand > .5) {
                  left = "40px";
                }
                var h = $("#" + dict[d]).height();
                j.html(str1 + "-" + str2 + "<br>" + sc[indexA].title);
                j.css({position: 'absolute', top: (topPercent * h) + "px", left: left});
                console.log("Duration: minutes %d, %f", dur.duration, heightPercent * h);
                j.height(h * heightPercent + "px");
                j.width("100px");
                $("#" + dict[d]).append(j);
              } else {
                angular.forEach(days, function(ds, index) {
                  var elem = document.createElement('div');
                  var j = $(elem);
                  j.addClass('courses-meet');
                  var num = (indexA + 1);
                  j.addClass('courses-meet-num-' + num);
                  var str1 = sc[indexA].time1[indexB];
                  str1 = correctStr(str1);
                  var str2 = sc[indexA].time2[indexB];
                  str2 = correctStr(str2);
                  var left = 0;
                  var rand = Math.random();
                  if (rand > .5) {
                    left = "40px";
                  }
                  var h = $("#" + dict[d]).height();
                  j.html(str1 + "-" + str2 + "<br>" + sc[indexA].title);
                  console.log("%d: %s, %s", index, ds, dict[ds]);
                  var rand = Math.random();
                  if (rand > .5) {
                    left = "40px";
                  } else {
                    left = "0px";
                  }
                  var h = $("#" + dict[ds]).height();
                  console.log("Duration: minutes %d, %f", dur.duration, heightPercent * h);
                  j.css({position: 'absolute', top: (topPercent * h) + "px", left: left});
                  j.height(h * heightPercent + "px");
                  j.width("100px");
                  $("#" + dict[ds]).append(j);
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
        var pm = (tArry[2].match(/pm/)) ? true : false;
        if (pm && hr < 12) {
          hr = hr + 12;
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
