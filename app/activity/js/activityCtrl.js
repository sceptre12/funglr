(function (window) {
	var angular = window.angular;
	angular.module('funglr.activity')
		.controller('activityCtrl', ['$scope', '$q', 'DataStore', 'LikeService', function ($scope, $q, DataStore, LikeService) {
			$scope.activity = [];
			$scope.error = '';
			$scope.emptyMessage = 'No likes yet.';

			function newestFirst(a, b) {
				return a.createdAt < b.createdAt ? 1 : (a.createdAt > b.createdAt ? -1 : 0);
			}

			$scope.load = function () {
				$scope.error = '';
				return DataStore.get('session', 'current').then(function (session) {
					return DataStore.list('posts', { authorId: session.userId }).then(function (posts) {
						return $q.all(posts.map(function (post) {
							return LikeService.listForPost(post.id).then(function (likes) {
								return likes.map(function (like) {
									return { like: like, post: post, userId: like.userId, postId: post.id, createdAt: like.createdAt };
								});
							});
						}));
					});
				}).then(function (groups) {
					$scope.activity = [].concat.apply([], groups).sort(newestFirst);
				}, function () {
					$scope.activity = [];
					$scope.error = 'Could not load activity';
				});
			};
			$scope.load();
		}]);
}(window));
