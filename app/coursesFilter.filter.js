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
