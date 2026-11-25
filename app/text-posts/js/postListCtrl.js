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
			$scope.load();
		}]);
}(window));
