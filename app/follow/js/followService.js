(function (window) {
	var angular = window.angular;
	angular.module('funglr.follow')
		.factory('FollowService', ['DataStore', 'AuthFactory', '$q', function (DataStore, AuthFactory, $q) {
			var COLLECTION = 'follows';

			function isBlank(value) {
				return value === undefined || value === null || String(value).trim() === '';
			}

			// resolves the signed-in session; AuthFactory rejects `unauthenticated` when there is none
			function session() {
				return AuthFactory.currentUser();
			}

			// follow: id `<followerId>:<followeeId>`, follower is always the session user
			function follow(followeeId) {
				if (isBlank(followeeId)) {
					return $q.reject({ code: 'invalid', message: 'Pick a user to follow.' });
				}
				return session().then(function (current) {
					if (String(followeeId) === current.userId) {
						return $q.reject({ code: 'invalid', message: 'You cannot follow yourself.' });
					}
					return DataStore.create(COLLECTION, {
						id: current.userId + ':' + followeeId,
						followerId: current.userId,
						followeeId: followeeId
					});
				});
			}

			// unfollow: takes the follow id (`<followerId>:<followeeId>`) or a bare followee user id
			function unfollow(target) {
				if (isBlank(target)) {
					return $q.reject({ code: 'invalid', message: 'Pick a follow to remove.' });
				}
				return session().then(function (current) {
					var id = String(target).indexOf(':') === -1 ? current.userId + ':' + target : String(target);
					return DataStore.get(COLLECTION, id).then(function (record) {
						if (record.followerId !== current.userId) {
							return $q.reject({ code: 'forbidden', message: 'Only the follower can unfollow.' });
						}
						return DataStore.remove(COLLECTION, id);
					});
				});
			}

			return {
				follow: follow,
				unfollow: unfollow,
				listFollowing: function (userId) {
					return DataStore.list(COLLECTION, { followerId: userId });
				},
				listFollowers: function (userId) {
					return DataStore.list(COLLECTION, { followeeId: userId });
				}
			};
		}]);
}(window));
