(function (window) {
	var angular = window.angular;
	angular.module('funglr.text-posts')
		.factory('PostService', ['DataStore', '$q', function (DataStore, $q) {
			function toMediaData(post) {
				var media = post.type === 'image' ? post.image : post.audio;
				if (media && media.base64) {
					return 'data:' + media.filetype + ';base64,' + media.base64;
				}
				return typeof media === 'string' && media ? media : null;
			}

			function currentUser() {
				return DataStore.get('session', 'current').then(null, function () {
					return $q.reject({ code: 'unauthenticated', message: 'sign in required' });
				});
			}

			return {
				createPost: function (post) {
					return currentUser().then(function (session) {
						return DataStore.create('posts', {
							authorId: session.userId,
							type: post.type,
							title: post.title,
							body: post.body || '',
							mediaData: toMediaData(post),
							reblogOf: post.reblogOf || null
						});
					});
				},
				listPosts: function (filter) {
					return DataStore.list('posts', filter);
				},
				removePost: function (postId) {
					return currentUser().then(function (session) {
						return DataStore.get('posts', postId).then(function (post) {
							if (post.authorId !== session.userId) {
								return $q.reject({ code: 'forbidden', message: 'only the author can remove a post' });
							}
							return DataStore.remove('posts', postId);
						});
					});
				}
			};
		}]);
}(window));
