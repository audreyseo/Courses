angular.module('myApp')
  .filter('courses', coursesFilter);

function coursesFilter() {
  return function(arrayIn, stringDept) {
    console.log("Department: %s", stringDept);
    var arrayOut = [];
    angular.forEach(arrayIn, function(element, index) {
      if (element.dept) {
        if (element.dept === stringDept) {
          arrayOut.push(element);
        } else if (stringDept === "ART" && element.dept.match(/ART[HS]/)) {
          arrayOut.push(element);
        }
      }
    });
    return arrayOut;
  }
}

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
