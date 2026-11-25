(function (window) {
	var angular = window.angular;
	angular.module('funglr.text-posts')
		.controller('postListCtrl', ['$scope', 'DataStore', 'PostService', function ($scope, DataStore, PostService) {
			$scope.posts = [];
			$scope.error = '';

			$scope.load = function () {
				return DataStore.get('session', 'current').then(function (session) {
					return PostService.list({ authorId: session.userId, type: 'text' });
				}).then(function (posts) {
					$scope.posts = posts;
				}, function () {
					$scope.posts = [];
					$scope.error = 'Sign in to see your posts';
				});
			};

			$scope.remove = function (post) {
				$scope.error = '';
				return PostService.remove(post.id).then(function () {
					$scope.posts = $scope.posts.filter(function (p) { return p.id !== post.id; });
				}, function (rejection) {
					$scope.error = rejection && rejection.code === 'forbidden' ?
						'You can only delete your own posts' : 'Could not delete the post';
				});
			};
			$scope.load();
		}]);
}(window));
