(function (window) {
	var angular = window.angular;
	angular.module('funglr.follow')
		.factory('FollowService', ['DataStore', '$q', function (DataStore, $q) {
			function currentUser() {
				return DataStore.get('session', 'current').then(null, function () {
					return $q.reject({ code: 'unauthenticated', message: 'sign in required' });
				});
			}

			return {
				follow: function (followeeId) {
					return currentUser().then(function (session) {
						return DataStore.create('follows', { id: session.userId + ':' + followeeId, followerId: session.userId, followeeId: followeeId });
					});
				},
				unfollow: function (followeeId) {
					return currentUser().then(function (session) {
						return DataStore.remove('follows', session.userId + ':' + followeeId);
					});
				},
				getFollowers: function (userId) {
					return DataStore.list('follows', { followeeId: userId });
				},
				getFollowing: function (userId) {
					return DataStore.list('follows', { followerId: userId });
				}
			};
		}]);
}(window));
