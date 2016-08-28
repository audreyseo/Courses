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
