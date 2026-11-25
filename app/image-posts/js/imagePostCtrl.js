(function (window) {
	var angular = window.angular;
	angular.module('funglr.image-posts')
		.controller('imagePostCtrl', ['$scope', 'ImagePostService', '$modalInstance', 'clicked', function ($scope, ImagePostService, $modalInstance, clicked) {
			$scope.typeOfPost = clicked;
			$scope.post = { title: '', body: '' };
			$scope.file = null;
			$scope.error = '';

			$scope.setFile = function (file) {
				$scope.file = file || null;
				$scope.error = '';
			};

			$scope.insertImage = function () {
				$scope.error = '';
				return ImagePostService.createImagePost($scope.post, $scope.file).then(function () {
					$modalInstance.close();
				}, function (err) {
					$scope.error = (err && err.message) || 'the image post could not be created';
				});
			};
			$scope.insertPost = $scope.insertImage;
			$scope.cancel = function () {
				$modalInstance.dismiss('cancel');
			};
		}]);
}(window));
