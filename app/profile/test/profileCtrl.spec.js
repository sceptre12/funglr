describe('profileCtrl', function () {
	var $rootScope, $controller, DataStore, scope;

	beforeAll(function () {
		return import('../../data/js/dataModule.js')
			.then(function () { return import('../../data/js/localAdapter.js'); })
			.then(function () { return import('../../data/js/dataStore.js'); })
			.then(function () { return import('../js/profileModule.js'); })
			.then(function () { return import('../js/profileService.js'); })
			.then(function () { return import('../js/profileCtrl.js'); });
	});

	beforeEach(function () {
		localStorage.clear();
		angular.mock.module('funglr.profile');
		angular.mock.inject(function (_$rootScope_, _$controller_, _DataStore_) {
			$rootScope = _$rootScope_;
			$controller = _$controller_;
			DataStore = _DataStore_;
		});
		scope = $rootScope.$new();
	});

	function seedUser() {
		DataStore.create('users', { id: 'u1', email: 'a@b.c', name: 'Ann', passwordHash: 'x' });
		DataStore.create('users', { id: 'u2', email: 'd@e.f', name: 'Bob', passwordHash: 'x' });
		DataStore.create('session', { id: 'current', userId: 'u1', email: 'a@b.c', name: 'Ann' });
		$rootScope.$digest();
	}

	function run() {
		$controller('profileCtrl', { $scope: scope });
		$rootScope.$digest();
	}

	it('shows the name and own posts newest first', function () {
		seedUser();
		DataStore.create('posts', { id: 'p1', authorId: 'u1', type: 'text', title: 'old', body: 'a' });
		DataStore.create('posts', { id: 'p2', authorId: 'u1', type: 'text', title: 'new', body: 'b' });
		DataStore.create('posts', { id: 'p3', authorId: 'u2', type: 'text', title: 'other', body: 'c' });
		DataStore.update('posts', 'p1', { createdAt: '2026-01-01T00:00:00.000Z' });
		DataStore.update('posts', 'p2', { createdAt: '2026-02-01T00:00:00.000Z' });
		$rootScope.$digest();
		run();
		expect(scope.user.name).toBe('Ann');
		expect(scope.posts.map(function (p) { return p.id; })).toEqual(['p2', 'p1']);
		expect(scope.message).toBe('');
		expect(scope.loaded).toBe(true);
	});

	it('shows an empty message when there are no posts', function () {
		seedUser();
		run();
		expect(scope.user.name).toBe('Ann');
		expect(scope.posts).toEqual([]);
		expect(scope.message).toBe('You have no posts yet.');
	});

	it('asks to sign in when there is no session', function () {
		run();
		expect(scope.user).toBe(null);
		expect(scope.message).toBe('Sign in to see your profile.');
		expect(scope.loaded).toBe(true);
	});
	it('keeps equal-createdAt posts in stored order and orders a mix newest first', function () {
		seedUser();
		['a', 'b', 'c', 'd'].forEach(function (id) {
			DataStore.create('posts', { id: id, authorId: 'u1', type: 'text', title: id, body: id });
		});
		DataStore.update('posts', 'a', { createdAt: '2026-03-01T00:00:00.000Z' });
		DataStore.update('posts', 'b', { createdAt: '2026-01-01T00:00:00.000Z' });
		DataStore.update('posts', 'c', { createdAt: '2026-03-01T00:00:00.000Z' });
		DataStore.update('posts', 'd', { createdAt: '2026-02-01T00:00:00.000Z' });
		$rootScope.$digest();
		run();
		expect(scope.posts.map(function (p) { return p.id; })).toEqual(['a', 'c', 'd', 'b']);
	});

	it('keeps all-equal posts in stored order', function () {
		seedUser();
		['a', 'b', 'c'].forEach(function (id) {
			DataStore.create('posts', { id: id, authorId: 'u1', type: 'text', title: id, body: id });
			DataStore.update('posts', id, { createdAt: '2026-03-01T00:00:00.000Z' });
		});
		$rootScope.$digest();
		run();
		expect(scope.posts.map(function (p) { return p.id; })).toEqual(['a', 'b', 'c']);
	});

	it('rejects with the sign-in message and unauthenticated code from the service', function () {
		var ProfileService, err;
		angular.mock.inject(function (_ProfileService_) { ProfileService = _ProfileService_; });
		ProfileService.getProfile().then(null, function (e) { err = e; });
		$rootScope.$digest();
		expect(err).toEqual({ code: 'unauthenticated', message: 'Sign in to see your profile.' });
	});

	it('shows the generic message when loading fails for another reason', function () {
		var $q;
		angular.mock.inject(function (_$q_) { $q = _$q_; });
		$controller('profileCtrl', {
			$scope: scope,
			ProfileService: { getProfile: function () { return $q.reject({ code: 'boom' }); } }
		});
		$rootScope.$digest();
		expect(scope.message).toBe('The profile could not be loaded.');
		expect(scope.loaded).toBe(true);
		expect(scope.user).toBe(null);
		expect(scope.posts).toEqual([]);
	});

	it('shows the generic message when the rejection has no value', function () {
		var $q;
		angular.mock.inject(function (_$q_) { $q = _$q_; });
		$controller('profileCtrl', {
			$scope: scope,
			ProfileService: { getProfile: function () { return $q.reject(); } }
		});
		$rootScope.$digest();
		expect(scope.message).toBe('The profile could not be loaded.');
	});

	it('asks to sign in when the session exists but the user record is gone', function () {
		DataStore.create('session', { id: 'current', userId: 'ghost', email: 'g@h.i', name: 'Ghost' });
		$rootScope.$digest();
		var ProfileService, err;
		angular.mock.inject(function (_ProfileService_) { ProfileService = _ProfileService_; });
		ProfileService.getProfile().then(null, function (e) { err = e; });
		$rootScope.$digest();
		expect(err).toEqual({ code: 'unauthenticated', message: 'Sign in to see your profile.' });
		run();
		expect(scope.user).toBe(null);
		expect(scope.message).toBe('Sign in to see your profile.');
		expect(scope.loaded).toBe(true);
	});

	it('lists image and audio posts with their titles without crashing', function () {
		seedUser();
		DataStore.create('posts', { id: 'pi', authorId: 'u1', type: 'image', title: 'a picture', mediaData: 'data:image/png;base64,AAAA', reblogOf: null });
		DataStore.create('posts', { id: 'pa', authorId: 'u1', type: 'audio', title: 'a sound', mediaData: 'data:audio/mp3;base64,AAAA', reblogOf: null });
		$rootScope.$digest();
		run();
		expect(scope.message).toBe('');
		expect(scope.posts.map(function (p) { return p.title; }).sort()).toEqual(['a picture', 'a sound']);
		expect(scope.posts.map(function (p) { return p.type; }).sort()).toEqual(['audio', 'image']);
	});
});
