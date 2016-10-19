angular.module('myApp')
  .filter('multipleDepartments', multipleDepartments);

multipleDepartments.$inject = ['coursesFilter'];

function multipleDepartments(coursesFilter) {
  return function(inArray, depts) {
    var outArray = [];
    depts.forEach(function(dept, index) {
      var output = coursesFilter(inArray, dept.code);
      outArray = outArray.concat(output);
    });
    return outArray;
  }
}
