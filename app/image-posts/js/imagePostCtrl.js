(function (window) {
	var angular = window.angular;
	angular.module('funglr.image-posts')
		.controller('imagePostCtrl', ['$scope', 'PostService', '$modalInstance', 'clicked', function ($scope, PostService, $modalInstance, clicked) {
			$scope.typeOfPost = clicked;
			$scope.post = {
				'type': 'image',
				'title': '',
				'subject': '',
				'body': '',
				'image': {},
				'audio': ''
			};

			$scope.insertPost = function () {
				PostService.createPost($scope.post).then(function () { $modalInstance.close(); });
			};
			$scope.insertImage = $scope.insertPost;
			$scope.cancel = function () {
				$modalInstance.dismiss('cancel');
			};
		}]);
}(window));
