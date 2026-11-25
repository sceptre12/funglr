describe('feed', function () {
	var $controller, $rootScope, DataStore;

	beforeAll(function () {
		return import('../../auth/js/authModule.js')
			.then(function () { return import('../../follow/js/followModule.js'); })
			.then(function () { return import('../js/feedModule.js'); })
			.then(function () { return import('../../data/js/dataModule.js'); })
			.then(function () { return import('../../data/js/localAdapter.js'); })
			.then(function () { return import('../../data/js/dataStore.js'); })
			.then(function () { return import('../../auth/js/authService.js'); })
			.then(function () { return import('../../follow/js/followService.js'); })
			.then(function () { return import('../js/feedService.js'); })
			.then(function () { return import('../js/feedCtrl.js'); });
	});

	beforeEach(function () {
		localStorage.clear();
		angular.mock.module('funglr.feed');
		angular.mock.inject(function (_$controller_, _$rootScope_, _DataStore_) {
			$controller = _$controller_;
			$rootScope = _$rootScope_;
			DataStore = _DataStore_;
		});
	});

	function settle(promise) {
		var out = {};
		promise.then(function (v) { out.ok = v; }, function (e) { out.err = e; });
		$rootScope.$digest();
		return out;
	}

	function post(id, authorId, createdAt) {
		settle(DataStore.create('posts', { id: id, authorId: authorId, type: 'text', title: id }));
		// create stamps createdAt itself; set the wanted time through update
		settle(DataStore.update('posts', id, { createdAt: createdAt }));
	}

	function follow(followerId, followeeId) {
		settle(DataStore.create('follows', { id: followerId + ':' + followeeId, followerId: followerId, followeeId: followeeId }));
	}

	function make() {
		var scope = $rootScope.$new();
		$controller('feedCtrl', { $scope: scope });
		$rootScope.$digest();
		return scope;
	}

	function signIn(userId) {
		settle(DataStore.create('session', { id: 'current', userId: userId }));
	}

	it('shows only the posts of followed authors, newest first', function () {
		signIn('u1');
		follow('u1', 'u2');
		follow('u1', 'u3');
		post('p1', 'u2', '2026-01-01T00:00:00.000Z');
		post('p2', 'u3', '2026-01-03T00:00:00.000Z');
		post('p3', 'u4', '2026-01-04T00:00:00.000Z');
		post('p4', 'u1', '2026-01-05T00:00:00.000Z');
		post('p5', 'u2', '2026-01-02T00:00:00.000Z');
		var scope = make();
		expect(scope.posts.map(function (p) { return p.id; })).toEqual(['p2', 'p5', 'p1']);
		expect(scope.loaded).toBe(true);
	});

	it('no follows gives an empty feed', function () {
		signIn('u1');
		post('p1', 'u2', '2026-01-01T00:00:00.000Z');
		var scope = make();
		expect(scope.posts).toEqual([]);
		expect(scope.error).toBe('');
		expect(scope.loaded).toBe(true);
	});

	it('followed users with no posts gives an empty feed', function () {
		signIn('u1');
		follow('u1', 'u2');
		expect(make().posts).toEqual([]);
	});

	it('signed out shows the sign-in message', function () {
		var scope = make();
		expect(scope.posts).toEqual([]);
		expect(scope.error).toBe('Sign in to see your feed');
	});
});
