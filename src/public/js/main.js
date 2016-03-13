var app = angular.module('TV', [ 'ui.bootstrap' ]);

app.controller('mainCtrl', function ($scope, $http) {
 $http.get('/shows').success(function (shows) {
  $scope.shows = shows;
 });

 $scope.openShow = function (show) {
  $http.post('/vlc', { file: show.video }, function () {

  });
 }
});
