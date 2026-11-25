(function (window) {
	var angular = window.angular;
	angular.module('funglr.comments')
		.factory('CommentService', ['DataStore', 'PostService', '$q', function (DataStore, PostService, $q) {
			var MAX_BODY = 1000;

			function currentUser() {
				return DataStore.get('session', 'current').then(null, function () {
					return $q.reject({ code: 'unauthenticated', message: 'sign in required' });
				});
			}

			function validate(body) {
				if (typeof body !== 'string' || body.trim() === '') {
					return 'comment text is required';
				}
				if (body.length > MAX_BODY) {
					return 'comment is at most ' + MAX_BODY + ' characters';
				}
				return null;
			}

			function addComment(postId, body) {
				var problem = validate(body);
				if (problem) {
					return $q.reject({ code: 'invalid', message: problem });
				}
				return currentUser().then(function (session) {
					return PostService.get(postId).then(function () {
						return DataStore.create('comments', {
							postId: postId,
							authorId: session.userId,
							body: body.trim()
						});
					});
				});
			}

			function getComments(postId) {
				return DataStore.list('comments', { postId: postId });
			}

			function removeComment(commentId) {
				return currentUser().then(function (session) {
					return DataStore.get('comments', commentId).then(function (comment) {
						if (comment.authorId !== session.userId) {
							return $q.reject({ code: 'forbidden', message: 'only the author can remove a comment' });
						}
						return DataStore.remove('comments', commentId);
					});
				});
			}

			// Resolves an authorId to the author's display name; falls back to the id itself.
			function authorName(authorId) {
				return DataStore.get('users', authorId).then(function (user) {
					return user && user.name ? user.name : authorId;
				}, function () {
					return authorId;
				});
			}

			// Lists a post's comments, each with authorName set (never rejects on a missing author).
			function getCommentsWithAuthors(postId) {
				return getComments(postId).then(function (comments) {
					return $q.all(comments.map(function (comment) {
						return authorName(comment.authorId).then(function (name) {
							var copy = angular.extend({}, comment);
							copy.authorName = name;
							return copy;
						});
					}));
				});
			}

			return {
				addComment: addComment,
				getComments: getComments,
				removeComment: removeComment,
				authorName: authorName,
				getCommentsWithAuthors: getCommentsWithAuthors,
				add: addComment,
				list: getComments,
				remove: removeComment
			};
		}]);
}(window));
