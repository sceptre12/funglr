describe('likesConfig and likesCtrl', function () {
	var states, $rootScope, $controller, DataStore, LikeService;

	beforeAll(function () {
		return import('../../text-posts/js/text-postsModule.js')
			.then(function () { return import('../js/likesModule.js'); })
			.then(function () { return import('../../data/js/dataModule.js'); })
			.then(function () { return import('../../data/js/localAdapter.js'); })
			.then(function () { return import('../../data/js/dataStore.js'); })
			.then(function () { return import('../../text-posts/js/postService.js'); })
			.then(function () { return import('../js/likeService.js'); })
			.then(function () { return import('../js/likesConfig.js'); })
			.then(function () { return import('../js/likesCtrl.js'); });
	});

	beforeEach(function () {
		localStorage.clear();
		states = {};
		angular.mock.module(function ($provide) {
			$provide.provider('$state', {
				state: function (name, def) { states[name] = def; return this; },
				$get: function () { return {}; }
			});
		});
		angular.mock.module('funglr.likes');
		angular.mock.inject(function (_$rootScope_, _$controller_, _DataStore_, _LikeService_) {
			$rootScope = _$rootScope_;
			$controller = _$controller_;
			DataStore = _DataStore_;
			LikeService = _LikeService_;
		});
	});

	function settle(promise) {
		var out = {};
		promise.then(function (v) { out.ok = v; }, function (e) { out.err = e; });
		$rootScope.$digest();
		return out;
	}

	it('registers the funglr.likes state', function () {
		expect(states['funglr.likes']).toEqual({
			url: '/likes',
			templateUrl: 'app/likes/views/likes.html',
			controller: 'likesCtrl'
		});
	});

	it('lists posts with counts and toggles the like', function () {
		var post = settle(DataStore.create('posts', { authorId: 'a', type: 'text', title: 't', body: 'b' })).ok;
		settle(DataStore.create('session', { id: 'current', userId: 'u1' }));
		var scope = $rootScope.$new();
		$controller('likesCtrl', { $scope: scope });
		$rootScope.$digest();
		expect(scope.posts.length).toBe(1);
		expect(scope.posts[0].likeCount).toBe(0);
		expect(scope.posts[0].liked).toBe(false);
		scope.toggle(scope.posts[0]);
		$rootScope.$digest();
		expect(scope.posts[0].likeCount).toBe(1);
		expect(scope.posts[0].liked).toBe(true);
		scope.toggle(scope.posts[0]);
		$rootScope.$digest();
		expect(scope.posts[0].likeCount).toBe(0);
		expect(scope.posts[0].liked).toBe(false);
		expect(settle(LikeService.count(post.id)).ok).toBe(0);
	});

	it('shows a sign-in message when signed out and liking', function () {
		settle(DataStore.create('posts', { authorId: 'a', type: 'text', title: 't', body: 'b' }));
		var scope = $rootScope.$new();
		$controller('likesCtrl', { $scope: scope });
		$rootScope.$digest();
		scope.toggle(scope.posts[0]);
		$rootScope.$digest();
		expect(scope.error).toBe('Sign in to like posts');
	});
});
