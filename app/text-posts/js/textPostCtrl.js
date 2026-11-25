(function (window) {
	var angular = window.angular;
	angular.module('funglr.text-posts')
		.controller('textPostCtrl', ['$scope', 'PostService', '$modalInstance', 'clicked', function ($scope, PostService, $modalInstance, clicked) {
			$scope.typeOfPost = clicked;
			$scope.error = '';
			$scope.post = {
				'type': 'text',
				'title': '',
				'subject': '',
				'body': '',
				'image': {},
				'audio': ''
			};

			$scope.insertPost = function () {
				$scope.error = '';
				if (typeof $scope.post.body !== 'string' || $scope.post.body.trim() === '') {
					$scope.error = 'Body is required';
					return;
				}
				PostService.create($scope.post).then(function () {
					$modalInstance.close();
				}, function (err) {
					$scope.error = (err && err.message) || 'Could not save the post';
				});
			};
			$scope.insertImage = $scope.insertPost;
			$scope.cancel = function () {
				$modalInstance.dismiss('cancel');
			};
		}]);
}(window));
