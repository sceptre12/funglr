(function (window) {
	var angular = window.angular;
	angular.module('funglr.comments')
		.controller('commentsCtrl', ['$scope', 'DataStore', 'PostService', 'CommentService', function ($scope, DataStore, PostService, CommentService) {
			$scope.posts = [];
			$scope.error = '';
			$scope.currentUserId = null;

			function decorate(post) {
				return CommentService.getCommentsWithAuthors(post.id).then(function (comments) {
					post.comments = comments;
					post.newComment = '';
				});
			}

			$scope.load = function () {
				return DataStore.get('session', 'current').then(function (session) {
					$scope.currentUserId = session.userId;
				}, function () {
					$scope.currentUserId = null;
				}).then(function () {
					return PostService.list();
				}).then(function (posts) {
					return decorateAll(posts).then(function () {
						$scope.posts = posts;
					});
				}).then(null, function () {
					$scope.posts = [];
					$scope.error = 'Could not load posts';
				});
			};

			function decorateAll(posts) {
				return posts.reduce(function (chain, post) {
					return chain.then(function () { return decorate(post); });
				}, DataStore.get('session', 'current').then(null, function () { return null; }));
			}

			function message(rejection) {
				var code = rejection && rejection.code;
				if (code === 'unauthenticated') { return 'Sign in to comment'; }
				if (code === 'invalid') { return 'Write something before posting'; }
				if (code === 'forbidden') { return 'You can only delete your own comments'; }
				return 'Could not update the comment';
			}

			$scope.add = function (post) {
				$scope.error = '';
				return CommentService.addComment(post.id, post.newComment).then(function () {
					return decorate(post);
				}, function (rejection) {
					$scope.error = message(rejection);
				});
			};

			$scope.remove = function (post, comment) {
				$scope.error = '';
				return CommentService.removeComment(comment.id).then(function () {
					return decorate(post);
				}, function (rejection) {
					$scope.error = message(rejection);
				});
			};
			$scope.load();
		}]);
}(window));
