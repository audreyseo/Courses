angular.module("myApp")
  .factory("CourseCounter", CourseCounter);

function CourseCounter() {
  var factory = {};
  factory.labels = [];
  factory.points = [];

  factory.digestClasses = digestClasses;
  factory.findNumClassesPerWeekday = findNumClassesPerWeekday;
  factory.findNumSeats = findNumSeats;
  factory.findNumSeatsPerWeekday = findNumSeatsPerWeekday;
  factory.findEnrollmentByStart = findEnrollmentByStart;

  var keys = {
    "regNum": "CRN",
    "credit": "Credit Hours",
    "enrollment": "Current Enrollment",
    "available": "Seats Available",
    "max": "Max Enrollment",
    "day": "Meeting Time(s)",
    "time1": "Meeting Time(s)",
    "time2": "Meeting Time(s)",
    "location": "Loc",
    "code": "Distributions",
    "long": "Distributions",
    "prereqs": "Prerequisites(s)"
  };

  function digestClasses(arry) {
    var indexDictionary = {};
    var classArray = [];
    var classLabels = [];
    var courseLabels = [];
    var numCoursesPerClass = [];
    var enrollmentPerCourse = [];
    var totalEnrollmentPerClass = [];
    var count = 0;
    var num;
    var title;
    for (var i = 0; i < arry.length; i++) {
      title = arry[i].title;
      if (!(title in indexDictionary)) {
        indexDictionary[title] = count;
        classLabels.append(title);
        numCoursesPerClass.append(1);
        enrollmentPerCourse.append(0);
        totalEnrollmentPerClass.append(0);
        if (arry[i].enrollment) {
          num = arry[i].enrollment;
          enrollmentPerCourse[count] = num;

        }
        count++;
      }
    }
  }
  function round(number, precision) {
    var factor = Math.pow(10, precision);
    var tempNumber = number * factor;
    var roundedTempNumber = Math.round(tempNumber);
    return roundedTempNumber / factor;
  }

  function findEnrollmentByStart(raw_data) {
    var d = [];
    var indexDictionary = {};
    for (var i = 0; i < raw_data.length; i++) {
      if (raw_data[i].enrollment) {
        var y = raw_data[i].enrollment;
        if (raw_data[i].time1) {
          var t1 = translateTimes(raw_data[i].time1);
          for (var j = 0; j < t1.length; j++) {
            t1[j] = round(t1[j], 4);
            var obj = {
              x: t1[j],
              y: y
            };
            d.push(obj);
          }
        }
      }
    }

    var data = {
      data: d,
      options: {
        title: {
          display: true,
          text: 'Enrollment By Class Start Time'
        },
        scales: {
          xAxes: [{
            type: 'linear',
            position: 'bottom'
          }],
          yAxes: [{
            ticks: {
              beginAtZero: true
            }
          }]
        }
      }
    };
    return d;
  }

  function translateTimes(arry) {
    var copy = [];
    for (var i = 0; i < arry.length; i++) {
      var result = translateTimeToNumber(arry[i]);
      if (result) {
        copy.push(result);
      }
    }
    return copy;
  }

  function translateTimeToNumber(time) {
    var splitA = time.split(" ");
    console.log(angular.toJson(splitA));
    if (splitA.length > 1) {
      var t = splitA[0].split(":");
      var s = splitA[1];
      var h = parseInt(t[0]);
      var m = parseFloat(t[1]);
      if (s.match(/p/)) {
        h += 12;
      }
      m = m / 60.0;
      t0 = h + m;
      return t0;
    }
    return false;
  }

  function findNumSeats(raw_data) {
    var series = ["Available", "Taken"];
    var courseLevel = ["100", "200", "300", "Unknown"];
    var levelRegex = [/\s1\d\d\s/, /\s2\d\d\s/, /\s3\d\d\s/];
    var available = [0, 0, 0, 0];
    var taken = [0, 0, 0, 0]
    var title = "";
    for (var i = 0; i < raw_data.length; i++) {
      if (raw_data[i].title){
        title = raw_data[i].title;
        angular.forEach(levelRegex, function(regex, index) {
          if (title.match(regex)) {
            if (raw_data[i].available) {
              available[index] += raw_data[i].available;
            } else {
              available[3]++;
            }
            if (raw_data[i].enrollment) {
              taken[index]+= raw_data[i].enrollment;
            } else {
              taken[3]++;
            }
          }
        });
      }
    }
    var data = {
      series: series,
      data: [available, taken],
      labels: courseLevel,
      options: {
        title: {
          display: true,
          text: 'Number of Seats Available By Class Level'
        },
        scales: {
          xAxes: [{
            stacked: true,
          }],
          yAxes: [{
            stacked: true,
            ticks: {
              beginAtZero: true
            }
          }]
        }
      }
    }
    return data;
  }

  function findNumSeatsPerWeekday(raw_data) {
    var labels = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Data Unavailable"];
    var newData = [0, 0, 0, 0, 0, 0];
    for (var i = 0; i < raw_data.length; i++) {
      if (raw_data[i].day) {
        days = digestDays(raw_data[i].day);
        for (var j = 0; j < days.length; j++) {
          if (days[j] > 0) {
            if (raw_data[i].available) {
              newData[i] += raw_data[i].available;
            } else {
              newData[i]++;
            }
          }
        }
      } else {
        newData[5]++;
      }
    }
    var data = {
      data: newData,
      labels: labels,
      options: {
        title: {
          display: true,
          text: 'Number of Seats Available By Weekday'
        },
        scales: {
          yAxes: [{
            ticks: {
              beginAtZero:true
            }
          }]
        }
      }
    };

    return data;
  }

  function findNumClassesPerWeekday(raw_data) {
    var labels = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Data Unavailable"];
    var newData = [0, 0, 0, 0, 0, 0];
    for (var i = 0; i < raw_data.length; i++) {
      if (raw_data[i].day) {
        days = digestDays(raw_data[i].day);
        for (var j = 0; j < days.length; j++) {
          newData[j] += days[j];
        }
      } else {
        newData[5]++;
      }
    }
    var data = {
      data: newData,
      labels: labels,
      options: {
        title: {
          display: true,
          text: 'Number of Classes By Weekday'
        },
        scales: {
          yAxes: [{
            ticks: {
              beginAtZero:true
            }
          }]
        }
      }
    };

    return data;
  }

  function digestDays(arry) {
    var legend = {
      Monday: /M/,
      Tuesday: /T(?!h)/,
      Wednesday: /W/,
      Thursday: /Th/,
      Friday: /F/
    }
    var labels = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"];
    var data = [0, 0, 0, 0, 0];
    var str;
    var regex;
    var count;
    count = 0;
    for (var key in legend) {
      regex = legend[key];
      for (var i = 0; i < arry.length; i++) {
        str = arry[i];
        if (str.match(regex)) {
          count = labels.indexOf(key);
          if (count > -1) {
            data[count]++;
          }
        }
      }
    }
    factory.days = data;
    return data;
  }

  return factory;
}
