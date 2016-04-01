var app = angular.module('TV', [ 'ui.bootstrap' ]);

app.controller('mainCtrl', function ($scope, $http) {
 $scope.path = '';
 $scope.parentStack = [];

 $scope.open = _open;
 $scope.back = _back;

 $http.get('/tree').success(function (tree) {
  console.log(tree);
  $scope.tree = tree;
 });

 function _open (tile) {
  (tile.type === 'directory' ? __openDirectory : __openVideo) (tile)
 }

 function _back() {
  var p = $scope.path.split('/');
  if ($scope.parentStack.length) {
   p.pop();
   $scope.path = p.join('/');
   $scope.tree = $scope.parentStack.pop();
  }
 }

 function __openDirectory (dir) {
  $scope.parentStack.push($scope.tree);
  $scope.path += '/' + dir.name;
  $scope.tree = dir;
 }

 function __openVideo (video) {
  $http.post('/vlc', { file: video.path });
 }

});
