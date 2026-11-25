(function (window) {
	var angular = window.angular;
	angular.module('funglr.comments')
		.factory('CommentService', ['DataStore', '$q', function (DataStore, $q) {
			function currentUser() {
				return DataStore.get('session', 'current').then(null, function () {
					return $q.reject({ code: 'unauthenticated', message: 'sign in required' });
				});
			}

			return {
				addComment: function (postId, body) {
					return currentUser().then(function (session) {
						return DataStore.create('comments', { postId: postId, authorId: session.userId, body: body });
					});
				},
				getComments: function (postId) {
					return DataStore.list('comments', { postId: postId });
				},
				removeComment: function (commentId) {
					return currentUser().then(function (session) {
						return DataStore.get('comments', commentId).then(function (comment) {
							if (comment.authorId !== session.userId) {
								return $q.reject({ code: 'forbidden', message: 'only the author can remove a comment' });
							}
							return DataStore.remove('comments', commentId);
						});
					});
				}
			};
		}]);
}(window));
