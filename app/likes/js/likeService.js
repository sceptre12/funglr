(function (window) {
	var angular = window.angular;
	angular.module('funglr.likes')
		.factory('LikeService', ['DataStore', '$q', function (DataStore, $q) {
			function currentUser() {
				return DataStore.get('session', 'current').then(null, function () {
					return $q.reject({ code: 'unauthenticated', message: 'sign in required' });
				});
			}

			return {
				likePost: function (postId) {
					return currentUser().then(function (session) {
						return DataStore.create('likes', { id: postId + ':' + session.userId, postId: postId, userId: session.userId });
					});
				},
				unlikePost: function (postId) {
					return currentUser().then(function (session) {
						return DataStore.remove('likes', postId + ':' + session.userId);
					});
				},
				getLikes: function (postId) {
					return DataStore.list('likes', { postId: postId });
				}
			};
		}]);
}(window));
