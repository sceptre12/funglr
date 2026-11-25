describe('activityConfig and activityCtrl', function () {
	var states, $rootScope, $controller, DataStore;

	beforeAll(function () {
		return import('../../text-posts/js/text-postsModule.js')
			.then(function () { return import('../../likes/js/likesModule.js'); })
			.then(function () { return import('../js/activityModule.js'); })
			.then(function () { return import('../../data/js/dataModule.js'); })
			.then(function () { return import('../../data/js/localAdapter.js'); })
			.then(function () { return import('../../data/js/dataStore.js'); })
			.then(function () { return import('../../text-posts/js/postService.js'); })
			.then(function () { return import('../../likes/js/likeService.js'); })
			.then(function () { return import('../js/activityConfig.js'); })
			.then(function () { return import('../js/activityCtrl.js'); });
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
		angular.mock.module('funglr.activity');
		angular.mock.inject(function (_$rootScope_, _$controller_, _DataStore_) {
			$rootScope = _$rootScope_;
			$controller = _$controller_;
			DataStore = _DataStore_;
		});
	});

	function settle(promise) {
		var out = {};
		promise.then(function (v) { out.ok = v; }, function (e) { out.err = e; });
		$rootScope.$digest();
		return out;
	}

	function makePost(authorId) {
		return settle(DataStore.create('posts', { authorId: authorId, type: 'text', title: 't' + authorId, body: 'b' })).ok.id;
	}

	function addLike(postId, userId, createdAt) {
		vi.useFakeTimers({ toFake: ['Date'] });
		vi.setSystemTime(new Date(createdAt));
		settle(DataStore.create('likes', { id: postId + ':' + userId, postId: postId, userId: userId }));
		vi.useRealTimers();
	}

	function makeCtrl() {
		var scope = $rootScope.$new();
		$controller('activityCtrl', { $scope: scope });
		$rootScope.$digest();
		return scope;
	}

	it('registers the funglr.activity state', function () {
		expect(states['funglr.activity']).toEqual({
			url: '/activity',
			templateUrl: 'app/activity/views/activity.html',
			controller: 'activityCtrl'
		});
	});

	it('lists likes on own posts newest first and not likes on others posts', function () {
		settle(DataStore.create('session', { id: 'current', userId: 'me' }));
		var mine = makePost('me');
		var theirs = makePost('other');
		addLike(mine, 'a', '2026-01-01T00:00:00.000Z');
		addLike(mine, 'b', '2026-01-03T00:00:00.000Z');
		addLike(theirs, 'c', '2026-01-02T00:00:00.000Z');
		var scope = makeCtrl();
		expect(scope.activity.map(function (i) { return i.userId; })).toEqual(['b', 'a']);
		expect(scope.activity.every(function (i) { return i.postId === mine; })).toBe(true);
		expect(scope.error).toBe('');
	});

	it('exposes an empty message when there are no likes', function () {
		settle(DataStore.create('session', { id: 'current', userId: 'me' }));
		makePost('me');
		var scope = makeCtrl();
		expect(scope.activity).toEqual([]);
		expect(scope.emptyMessage).toBe('No likes yet.');
		expect(scope.error).toBe('');
	});

	it('sets an error when signed out', function () {
		var scope = makeCtrl();
		expect(scope.activity).toEqual([]);
		expect(scope.error).toBe('Could not load activity');
	});
});
