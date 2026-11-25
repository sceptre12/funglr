(function (window) {
	var angular = window.angular;
	angular.module('funglr.profile')
		.controller('profileCtrl', ['$scope', 'ProfileService', function ($scope, ProfileService) {
			$scope.user = null;
			$scope.posts = [];
			$scope.loaded = false;
			$scope.message = '';

			ProfileService.getProfile().then(function (profile) {
				$scope.user = profile.user;
				$scope.posts = profile.posts;
				$scope.message = profile.posts.length ? '' : 'You have no posts yet.';
				$scope.loaded = true;
			}, function (err) {
				$scope.message = err && err.code === 'unauthenticated' ? 'Sign in to see your profile.' : 'The profile could not be loaded.';
				$scope.loaded = true;
			});
		}]);
}(window));
