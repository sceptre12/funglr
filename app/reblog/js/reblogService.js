(function (window) {
	var angular = window.angular;
	angular.module('funglr.reblog')
		.factory('ReblogService', ['DataStore', '$q', function (DataStore, $q) {
			function currentUser() {
				return DataStore.get('session', 'current').then(null, function () {
					return $q.reject({ code: 'unauthenticated', message: 'sign in required' });
				});
			}

			return {
				// Rejects with code: unauthenticated (no session), not-found (original post deleted), forbidden (own post), exists (already reblogged).
				reblogPost: function (postId) {
					return currentUser().then(function (session) {
						return DataStore.get('posts', postId).then(function (post) {
							if (post.authorId === session.userId) {
								return $q.reject({ code: 'forbidden', message: 'cannot reblog your own post' });
							}
							return DataStore.list('posts', { authorId: session.userId, reblogOf: postId }).then(function (existing) {
								if (existing.length) {
									return $q.reject({ code: 'exists', message: 'already reblogged' });
								}
								return DataStore.create('posts', {
									authorId: session.userId,
									type: post.type,
									title: post.title,
									body: post.body,
									mediaData: post.mediaData,
									reblogOf: postId
								});
							});
						});
					});
				},
				unReblog: function (postId) {
					return currentUser().then(function (session) {
						return DataStore.list('posts', { authorId: session.userId, reblogOf: postId }).then(function (list) {
							if (!list.length) {
								return $q.reject({ code: 'not-found', message: 'no reblog of this post' });
							}
							return DataStore.remove('posts', list[0].id);
						});
					});
				},
				getReblogs: function (postId) {
					return DataStore.list('posts', { reblogOf: postId });
				}
			};
		}]);
}(window));
