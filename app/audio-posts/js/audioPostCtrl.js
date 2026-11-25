(function (window) {
	var angular = window.angular;
	angular.module('funglr.audio-posts')
		.controller('audioPostCtrl', ['$scope', 'AudioPostService', '$modalInstance', 'clicked', function ($scope, AudioPostService, $modalInstance, clicked) {
			$scope.typeOfPost = clicked;
			$scope.post = { title: '' };
			$scope.file = null;
			$scope.error = '';

			$scope.setFile = function (file) {
				$scope.file = file || null;
			};

			$scope.insertPost = function () {
				$scope.error = '';
				return AudioPostService.createAudioPost($scope.file, $scope.post.title).then(function () {
					$modalInstance.close();
				}, function (err) {
					$scope.error = err && err.message ? err.message : 'The post could not be created.';
				});
			};
			$scope.cancel = function () {
				$modalInstance.dismiss('cancel');
			};
		}]);
}(window));
