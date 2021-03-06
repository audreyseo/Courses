// I was originally going to write this in Python but due to the really
// asyncronous nature of Javascript itself, decided it would be a better idea
// to have Javascript deal with it, at least initially.
// Also apparently I can't do anything without using Angular so oh well

angular.module("myApp", ['ngCookies'])
  .config(function($cookiesProvider) {
    var date = new Date();
    date.setDate(date.getDate() + 60);
    $cookiesProvider.defaults.expires = date.toUTCString();
  });
