(function (window) {
	var angular = window.angular;
	angular.module('funglr.follow')
		.controller('followListCtrl', ['$scope', 'DataStore', 'AuthFactory', 'FollowService', function ($scope, DataStore, AuthFactory, FollowService) {
			$scope.users = [];
			$scope.following = {};
			$scope.error = '';

			function message(rejection) {
				return rejection && rejection.message ? rejection.message : 'Something went wrong';
			}

			$scope.load = function () {
				$scope.error = '';
				return AuthFactory.currentUser().then(function (session) {
					return DataStore.list('users').then(function (users) {
						$scope.users = users.filter(function (u) { return u.id !== session.userId; });
						return FollowService.listFollowing(session.userId);
					});
				}).then(function (follows) {
					$scope.following = {};
					follows.forEach(function (f) { $scope.following[f.followeeId] = true; });
				}, function () {
					$scope.users = [];
					$scope.following = {};
					$scope.error = 'Sign in to follow people';
				});
			};

			$scope.toggle = function (user) {
				$scope.error = '';
				var op = $scope.following[user.id] ? FollowService.unfollow(user.id) : FollowService.follow(user.id);
				return op.then(function () {
					$scope.following[user.id] = !$scope.following[user.id];
				}, function (rejection) {
					$scope.error = message(rejection);
				});
			};

			$scope.load();
		}]);
}(window));
