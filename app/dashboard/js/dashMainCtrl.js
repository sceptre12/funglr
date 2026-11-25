(function (window) {
	var angular = window.angular;
	angular.module('funglr.dashboard')
		.controller('dashMainCtrl', ['$scope', 'DataStore', 'PostService', 'CommentService', 'LikeService', 'ReblogService',
			function ($scope, DataStore, PostService, CommentService, LikeService, ReblogService) {
				var session = null;

				function load() {
					PostService.listPosts().then(function (posts) {
						$scope.postlist = posts.map(function (post) {
							var item = { content: post, key: post.id, comments: [], owner: post.authorId };
							CommentService.getComments(post.id).then(function (comments) { item.comments = comments; });
							DataStore.get('users', post.authorId).then(function (user) { item.owner = user.name; });
							return item;
						});
					});
				}

				DataStore.get('session', 'current').then(function (s) { session = s; load(); }, load);

				$scope.item = '';
				$scope.isCurrentUser = function (postkey) {
					var found = ($scope.postlist || []).filter(function (p) { return p.key === postkey; })[0];
					return !!(session && found && found.content.authorId === session.userId);
				};
				$scope.subComments = function (key, response) {
					CommentService.addComment(key, response).then(load);
				};
				$scope.deleteComment = function (pkey, commentId) {
					CommentService.removeComment(commentId).then(load);
				};
				$scope.deletePost = function (postkey) {
					PostService.removePost(postkey).then(load);
				};
				$scope.liked = function (key, clicked) {
					(clicked ? LikeService.unlikePost(key) : LikeService.likePost(key));
				};
				$scope.reblogged = function (key, clicked) {
					(clicked ? ReblogService.unReblog(key) : ReblogService.reblogPost(key)).then(load);
				};
			}]);
}(window));
