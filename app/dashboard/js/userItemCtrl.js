(function (window) {
	var angular = window.angular;

	// newest first; equal createdAt keeps the later stored record first
	function newestFirst(posts) {
		return posts.map(function (post, index) { return { post: post, index: index }; })
			.sort(function (a, b) {
				if (a.post.createdAt === b.post.createdAt) { return b.index - a.index; }
				return a.post.createdAt < b.post.createdAt ? 1 : -1;
			})
			.map(function (entry) { return entry.post; });
	}

	angular.module('funglr.dashboard')
		.controller('userItemCtrl', ['DataStore', function (DataStore) {
			var vm = this;
			vm.items = [];
			vm.loaded = false;

			vm.load = function () {
				return DataStore.get('session', 'current').then(function (session) {
					return DataStore.list('posts', { authorId: session.userId }).then(function (posts) {
						vm.items = newestFirst(posts);
						vm.loaded = true;
					});
				}, function () {
					vm.items = [];
					vm.loaded = true;
				});
			};

			vm.load();
		}]);
}(window));
