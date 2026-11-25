(function (window) {
	var angular = window.angular;
	angular.module('funglr.likes')
		.controller('likesCtrl', ['$scope', 'DataStore', 'PostService', 'LikeService', function ($scope, DataStore, PostService, LikeService) {
			$scope.posts = [];
			$scope.error = '';
			var userId = null;

			function decorate(post) {
				return LikeService.listForPost(post.id).then(function (likes) {
					post.likeCount = likes.length;
					post.liked = likes.some(function (l) { return l.userId === userId; });
					return post;
				});
			}

			$scope.load = function () {
				return DataStore.get('session', 'current').then(function (session) {
					userId = session.userId;
				}, function () {
					userId = null;
				}).then(function () {
					return PostService.list();
				}).then(function (posts) {
					return posts.reduce(function (chain, post) {
						return chain.then(function () { return decorate(post); });
					}, DataStore.get('session', 'current').then(null, function () { return null; })).then(function () {
						$scope.posts = posts;
					});
				}, function () {
					$scope.posts = [];
					$scope.error = 'Could not load posts';
				});
			};

			$scope.toggle = function (post) {
				$scope.error = '';
				var action = post.liked ? LikeService.unlike(post.id) : LikeService.like(post.id);
				return action.then(function () {
					return decorate(post);
				}, function (rejection) {
					$scope.error = rejection && rejection.code === 'unauthenticated' ?
						'Sign in to like posts' : 'Could not update the like';
				});
			};
			$scope.load();
		}]);
}(window));
