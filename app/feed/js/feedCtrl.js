(function (window) {
	var angular = window.angular;
	angular.module('funglr.feed')
		.controller('feedCtrl', ['$scope', 'AuthFactory', 'FeedService', function ($scope, AuthFactory, FeedService) {
			$scope.posts = [];
			$scope.error = '';
			$scope.loaded = false;

			$scope.load = function () {
				$scope.error = '';
				return AuthFactory.currentUser().then(function (session) {
					return FeedService.list(session.userId);
				}).then(function (posts) {
					$scope.posts = posts;
					$scope.loaded = true;
				}, function (rejection) {
					$scope.posts = [];
					$scope.loaded = true;
					$scope.error = rejection && rejection.code === 'unauthenticated' ?
						'Sign in to see your feed' : (rejection && rejection.message ? rejection.message : 'Something went wrong');
				});
			};

			$scope.load();
		}]);
}(window));
