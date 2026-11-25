(function (window) {
	var angular = window.angular;
	angular.module('funglr.profile')
		.factory('ProfileService', ['$q', 'DataStore', function ($q, DataStore) {
			function newestFirst(a, b) {
				return a.createdAt < b.createdAt ? 1 : (a.createdAt > b.createdAt ? -1 : 0);
			}

			function getProfile() {
				return DataStore.get('session', 'current').then(function (session) {
					return $q.all([
						DataStore.get('users', session.userId),
						DataStore.list('posts', { authorId: session.userId })
					]).then(function (res) {
						return { user: res[0], posts: res[1].slice().sort(newestFirst) };
					});
				}, function (err) {
					return $q.reject(err && err.code === 'not-found' ? { code: 'unauthenticated', message: 'Sign in to see your profile.' } : err);
				});
			}

			return { getProfile: getProfile };
		}]);
}(window));
