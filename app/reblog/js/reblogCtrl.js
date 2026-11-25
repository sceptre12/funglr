(function (window) {
	var angular = window.angular;
	angular.module('funglr.reblog')
		.controller('reblogCtrl', ['$scope', 'DataStore', 'ReblogService', function ($scope, DataStore, ReblogService) {
			$scope.posts = [];
			$scope.error = '';
			var userId = null;

			var MESSAGES = {
				forbidden: 'You cannot reblog your own post',
				exists: 'You already reblogged this post',
				unauthenticated: 'Sign in to reblog posts',
				'not-found': 'There is no reblog of this post to remove'
			};

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
					}, DataStore.get('session', 'current').then(null, function () { return null; })).then(function () {
						$scope.posts = originals;
					});
				}, function () {
					$scope.posts = [];
					$scope.error = 'Could not load posts';
				});
			};

			$scope.toggle = function (post) {
				$scope.error = '';
				var action = post.reblogged ? ReblogService.unReblog(post.id) : ReblogService.reblogPost(post.id);
				return action.then(function () {
					return decorate(post);
				}, function (rejection) {
					$scope.error = (rejection && MESSAGES[rejection.code]) || 'Could not update the reblog';
				});
			};
			$scope.load();
		}]);
}(window));
