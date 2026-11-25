describe('followListCtrl', function () {
	var $controller, $rootScope, DataStore, FollowService;

	beforeAll(function () {
		return import('../../auth/js/authModule.js')
			.then(function () { return import('../js/followModule.js'); })
			.then(function () { return import('../../data/js/dataModule.js'); })
			.then(function () { return import('../../data/js/localAdapter.js'); })
			.then(function () { return import('../../data/js/dataStore.js'); })
			.then(function () { return import('../../auth/js/authService.js'); })
			.then(function () { return import('../js/followService.js'); })
			.then(function () { return import('../js/followListCtrl.js'); });
	});

	beforeEach(function () {
		localStorage.clear();
		angular.mock.module('funglr.follow');
		angular.mock.inject(function (_$controller_, _$rootScope_, _DataStore_, _FollowService_) {
			$controller = _$controller_;
			$rootScope = _$rootScope_;
			DataStore = _DataStore_;
			FollowService = _FollowService_;
		});
	});

	function settle(promise) {
		var out = {};
		promise.then(function (v) { out.ok = v; }, function (e) { out.err = e; });
		$rootScope.$digest();
		return out;
	}

	function seed() {
		settle(DataStore.create('users', { id: 'u1', name: 'Ann', email: 'a@x.io' }));
		settle(DataStore.create('users', { id: 'u2', name: 'Bob', email: 'b@x.io' }));
		settle(DataStore.create('session', { id: 'current', userId: 'u1' }));
	}

	function make() {
		var scope = $rootScope.$new();
		$controller('followListCtrl', { $scope: scope });
		$rootScope.$digest();
		return scope;
	}

	it('signed out shows the sign-in message and no users', function () {
		var scope = make();
		expect(scope.users).toEqual([]);
		expect(scope.error).toBe('Sign in to follow people');
	});

	it('lists other users and toggles follow and unfollow', function () {
		seed();
		var scope = make();
		expect(scope.users.map(function (u) { return u.id; })).toEqual(['u2']);
		expect(scope.following.u2).toBeFalsy();
		settle(scope.toggle(scope.users[0]));
		expect(scope.following.u2).toBe(true);
		expect(settle(FollowService.listFollowing('u1')).ok.length).toBe(1);
		settle(scope.toggle(scope.users[0]));
		expect(scope.following.u2).toBe(false);
		expect(settle(FollowService.listFollowing('u1')).ok.length).toBe(0);
	});

	it('shows an existing follow as followed on load', function () {
		seed();
		settle(FollowService.follow('u2'));
		expect(make().following.u2).toBe(true);
	});

	it('a failing toggle sets the error message', function () {
		seed();
		var scope = make();
		settle(DataStore.remove('session', 'current'));
		settle(scope.toggle(scope.users[0]));
		expect(scope.error).toBe('Not signed in.');
	});

	it('a second follow of an already followed user keeps the following state and stores no duplicate', function () {
		seed();
		var scope = make();
		settle(scope.toggle(scope.users[0]));
		expect(scope.following.u2).toBe(true);
		// stale view: the store holds the follow but the button state was lost
		scope.following = {};
		settle(scope.toggle(scope.users[0]));
		expect(scope.following.u2).toBe(true);
		expect(scope.error).toBe('');
		expect(settle(FollowService.listFollowing('u1')).ok.length).toBe(1);
	});

	it('load clears a previous error and resets stale following marks on success', function () {
		seed();
		var scope = make();
		scope.error = 'old';
		scope.following = { stale: true };
		settle(scope.load());
		expect(scope.error).toBe('');
		expect(scope.following).toEqual({});
	});

	it('load failure clears users and following', function () {
		seed();
		settle(FollowService.follow('u2'));
		var scope = make();
		expect(scope.users.length).toBe(1);
		expect(scope.following.u2).toBe(true);
		settle(DataStore.remove('session', 'current'));
		settle(scope.load());
		expect(scope.users).toEqual([]);
		expect(scope.following).toEqual({});
		expect(scope.error).toBe('Sign in to follow people');
	});

	it('toggle clears a previous error before acting', function () {
		seed();
		var scope = make();
		scope.error = 'old';
		settle(scope.toggle(scope.users[0]));
		expect(scope.error).toBe('');
	});

	it('a rejection without a message falls back to the default text; an undefined rejection does not throw', function () {
		seed();
		var scope = make();
		var user = scope.users[0];
		var $q;
		angular.mock.inject(function (_$q_) { $q = _$q_; });
		var original = FollowService.follow;
		FollowService.follow = function () { return $q.reject({ code: 'x' }); };
		settle(scope.toggle(user));
		expect(scope.error).toBe('Something went wrong');
		FollowService.follow = function () { return $q.reject(undefined); };
		scope.error = '';
		settle(scope.toggle(user));
		expect(scope.error).toBe('Something went wrong');
		FollowService.follow = original;
	});

	it('a non-auth load failure shows its own message, not the sign-in text', function () {
		seed();
		var $q;
		angular.mock.inject(function (_$q_) { $q = _$q_; });
		var original = DataStore.list;
		DataStore.list = function () { return $q.reject({ code: 'invalid', message: 'Storage is corrupt.' }); };
		var scope = make();
		DataStore.list = original;
		expect(scope.error).toBe('Storage is corrupt.');
		expect(scope.error).not.toBe('Sign in to follow people');
		expect(scope.users).toEqual([]);
		expect(scope.following).toEqual({});
	});

	it('unfollowing a follow that is already gone treats it as unfollowed with no error', function () {
		seed();
		settle(FollowService.follow('u2'));
		var scope = make();
		expect(scope.following.u2).toBe(true);
		// stale view: the follow was removed elsewhere
		settle(DataStore.remove('follows', 'u1:u2'));
		settle(scope.toggle(scope.users[0]));
		expect(scope.following.u2).toBe(false);
		expect(scope.error).toBe('');
	});
});
