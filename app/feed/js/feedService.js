(function (window) {
	var angular = window.angular;
	angular.module('funglr.feed')
		.factory('FeedService', ['DataStore', 'FollowService', '$q', function (DataStore, FollowService, $q) {
			function newestFirst(a, b) {
				var x = a.createdAt || '';
				var y = b.createdAt || '';
				return x < y ? 1 : (x > y ? -1 : 0);
			}

			// posts authored by the users `userId` follows, newest first
			function list(userId) {
				return FollowService.listFollowing(userId).then(function (follows) {
					var authors = {};
					follows.forEach(function (f) { authors[f.followeeId] = true; });
					if (Object.keys(authors).length === 0) {
						return [];
					}
					return $q.all(Object.keys(authors).map(function (id) {
						return DataStore.list('posts', { authorId: id });
					})).then(function (groups) {
						return [].concat.apply([], groups).sort(newestFirst);
					});
				});
			}

			return { list: list };
		}]);
}(window));
