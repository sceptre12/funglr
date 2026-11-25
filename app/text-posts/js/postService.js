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

			var MAX_BODY = 2000;

			function invalid(message) {
				return $q.reject({ code: 'invalid', message: message });
			}

			function blank(value) {
				return typeof value !== 'string' || value.trim() === '';
			}

			function validate(post) {
				if (!post || blank(post.title)) {
					return 'title is required';
				}
				if (post.type === 'text') {
					if (blank(post.body)) {
						return 'body is required';
					}
					if (post.body.length > MAX_BODY) {
						return 'body is at most ' + MAX_BODY + ' characters';
					}
				}
				return null;
			}

			var service = {
				createPost: function (post) {
					return currentUser().then(function (session) {
						var problem = validate(post);
						if (problem) {
							return invalid(problem);
						}
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
				getPost: function (postId) {
					return DataStore.get('posts', postId);
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

			service.create = service.createPost;
			service.get = service.getPost;
			service.list = service.listPosts;
			service.remove = service.removePost;
			return service;
		}]);
}(window));
