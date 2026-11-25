(function (window) {
	var angular = window.angular;
	angular.module('funglr.dashboard')
		.controller('dashMainCtrl', ['$scope', '$sce', 'DataStore', 'PostService', 'CommentService', 'LikeService', 'ReblogService',
			function ($scope, $sce, DataStore, PostService, CommentService, LikeService, ReblogService) {
				var session = null;

				function authorName(authorId, target, field) {
					DataStore.get('users', authorId).then(function (user) { target[field] = user.name; });
				}

				function fillItem(item, post) {
					// posts store their media as one data URL in mediaData (contracts/data-layer.md)
					if (post.type === 'audio' && post.mediaData) {
						item.audioSrc = $sce.trustAsResourceUrl(post.mediaData);
					}
					CommentService.getComments(post.id).then(function (comments) {
						comments.forEach(function (comment) { authorName(comment.authorId, comment, 'authorName'); });
						item.comments = comments;
					});
					LikeService.getLikes(post.id).then(function (likes) {
						item.notes = likes.length;
						item.like = !!session && likes.some(function (like) { return like.userId === session.userId; });
					});
					if (session) {
						ReblogService.getReblogs(post.id).then(function (reblogs) {
							item.reblog = reblogs.some(function (reblog) { return reblog.authorId === session.userId; });
						});
					}
					authorName(post.authorId, item, 'owner');
				}

				function load() {
					return PostService.listPosts().then(function (posts) {
						$scope.postlist = posts.map(function (post) {
							var item = { content: post, key: post.id, comments: [], owner: post.authorId, notes: 0, like: false, reblog: false, busy: false };
							fillItem(item, post);
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
					return CommentService.addComment(key, response).then(load);
				};
				$scope.deleteComment = function (pkey, commentId) {
					return CommentService.removeComment(commentId).then(load);
				};
				$scope.deletePost = function (postkey) {
					return PostService.removePost(postkey).then(load);
				};
				// like and reblog flags come from the stored records, so one click makes one write
				$scope.liked = function (post) {
					if (post.busy) { return; }
					post.busy = true;
					(post.like ? LikeService.unlikePost(post.key) : LikeService.likePost(post.key))
						.then(load, function () { post.busy = false; });
				};
				$scope.reblogged = function (post) {
					if (post.busy) { return; }
					post.busy = true;
					(post.reblog ? ReblogService.unReblog(post.key) : ReblogService.reblogPost(post.key))
						.then(load, function () { post.busy = false; });
				};
			}]);
}(window));
