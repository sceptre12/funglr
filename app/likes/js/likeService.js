(function (window) {
	var angular = window.angular;
	angular.module('funglr.likes')
		.factory('LikeService', ['DataStore', 'PostService', '$q', function (DataStore, PostService, $q) {
			function currentUser() {
				return DataStore.get('session', 'current').then(null, function () {
					return $q.reject({ code: 'unauthenticated', message: 'sign in required' });
				});
			}

			function listForPost(postId) {
				return DataStore.list('likes', { postId: postId });
			}

			function like(postId) {
				return currentUser().then(function (session) {
					return PostService.get(postId).then(function () {
						return DataStore.create('likes', {
							id: postId + ':' + session.userId,
							postId: postId,
							userId: session.userId
						});
					});
				});
			}

			// userId (optional) names the liker whose like is removed; only that liker may remove it.
			function unlike(postId, userId) {
				return currentUser().then(function (session) {
					if (userId && userId !== session.userId) {
						return $q.reject({ code: 'forbidden', message: 'only the liker can remove a like' });
					}
					return DataStore.remove('likes', postId + ':' + session.userId);
				});
			}

			function count(postId) {
				return listForPost(postId).then(function (likes) {
					return likes.length;
				});
			}

			return {
				like: like,
				unlike: unlike,
				count: count,
				listForPost: listForPost,
				likePost: like,
				unlikePost: unlike,
				getLikes: listForPost
			};
		}]);
}(window));
