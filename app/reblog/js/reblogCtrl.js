(function (window) {
	var angular = window.angular;
	angular.module('funglr.reblog')
		.controller('reblogCtrl', ['$scope', '$q', 'DataStore', 'ReblogService', function ($scope, $q, DataStore, ReblogService) {
			$scope.posts = [];
			$scope.error = '';
			var userId = null;

			// Keys are the rejection codes of ReblogService (forbidden, exists, unauthenticated, not-found).
			var MESSAGES = {
				forbidden: 'You cannot reblog your own post',
				exists: 'You already reblogged this post',
				unauthenticated: 'Sign in to reblog posts',
				'not-found': 'There is no reblog of this post to remove'
			};
			// not-found means the original post is gone on the reblog path, and the reblog is gone on the unreblog path.
			var NOT_FOUND_ON_REBLOG = 'This post no longer exists';

			// Sets view-only fields reblogCount and reblogged on the post; they are never persisted.
			function decorate(post) {
				return ReblogService.getReblogs(post.id).then(function (reblogs) {
					post.reblogCount = reblogs.length;
					post.reblogged = reblogs.some(function (r) { return r.authorId === userId; });
					return post;
				});
			}

			$scope.load = function () {
				return DataStore.get('session', 'current').then(function (session) {
					userId = session.userId;
				}, function () {
					userId = null;
				}).then(function () {
					return DataStore.list('posts');
				}).then(function (posts) {
					var originals = posts.filter(function (p) { return !p.reblogOf; });
					return originals.reduce(function (chain, post) {
						return chain.then(function () { return decorate(post); });
					}, $q.when()).then(function () {
						$scope.posts = originals;
					});
				}, function () {
					$scope.posts = [];
					$scope.error = 'Could not load posts';
				});
			};

			$scope.toggle = function (post) {
				$scope.error = '';
				var unreblog = !!post.reblogged;
				var action = unreblog ? ReblogService.unReblog(post.id) : ReblogService.reblogPost(post.id);
				return action.then(function () {
					return decorate(post);
				}, function (rejection) {
					var code = rejection && rejection.code;
					$scope.error = (code === 'not-found' && !unreblog ? NOT_FOUND_ON_REBLOG : MESSAGES[code]) || 'Could not update the reblog';
					if (code === 'exists' || code === 'not-found') {
						// the row state was stale: reload it so the button matches the data
						return decorate(post).then(null, function () {});
					}
				});
			};
			$scope.load();
		}]);
}(window));
