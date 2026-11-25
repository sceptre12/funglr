describe('FollowService', function () {
	var FollowService, DataStore, $rootScope;

	beforeAll(function () {
		return import('../../auth/js/authModule.js')
			.then(function () { return import('../js/followModule.js'); })
			.then(function () { return import('../../data/js/dataModule.js'); })
			.then(function () { return import('../../data/js/localAdapter.js'); })
			.then(function () { return import('../../data/js/dataStore.js'); })
			.then(function () { return import('../../auth/js/authService.js'); })
			.then(function () { return import('../js/followService.js'); });
	});

	beforeEach(function () {
		localStorage.clear();
		angular.mock.module('funglr.follow');
		angular.mock.inject(function (_FollowService_, _DataStore_, _$rootScope_) {
			FollowService = _FollowService_;
			DataStore = _DataStore_;
			$rootScope = _$rootScope_;
		});
	});

	function settle(promise) {
		var out = {};
		promise.then(function (v) { out.ok = v; }, function (e) { out.err = e; });
		$rootScope.$digest();
		return out;
	}

	function signIn(userId) {
		settle(DataStore.remove('session', 'current'));
		settle(DataStore.create('session', { id: 'current', userId: userId }));
	}

	it('follow without a session rejects unauthenticated', function () {
		expect(settle(FollowService.follow('u2')).err.code).toBe('unauthenticated');
	});

	it('follow stores id follower:followee with followerId equal to the session userId', function () {
		signIn('u1');
		var rec = settle(FollowService.follow('u2')).ok;
		expect(rec.id).toBe('u1:u2');
		expect(rec.followerId).toBe('u1');
		expect(rec.followeeId).toBe('u2');
	});

	it('follow twice rejects exists', function () {
		signIn('u1');
		settle(FollowService.follow('u2'));
		expect(settle(FollowService.follow('u2')).err.code).toBe('exists');
	});

	it('follow with a blank followee rejects invalid', function () {
		signIn('u1');
		expect(settle(FollowService.follow(' ')).err.code).toBe('invalid');
	});

	it('unfollow by another user rejects forbidden and keeps the follow', function () {
		signIn('u1');
		settle(FollowService.follow('u2'));
		signIn('u3');
		expect(settle(FollowService.unfollow('u1:u2')).err.code).toBe('forbidden');
		expect(settle(FollowService.listFollowing('u1')).ok.length).toBe(1);
	});

	it('unfollow by the follower resolves, by follow id or followee id', function () {
		signIn('u1');
		settle(FollowService.follow('u2'));
		settle(FollowService.follow('u3'));
		expect(settle(FollowService.unfollow('u1:u2')).ok).toBe(true);
		expect(settle(FollowService.unfollow('u3')).ok).toBe(true);
		expect(settle(FollowService.listFollowing('u1')).ok.length).toBe(0);
	});

	it('unfollow of a missing follow rejects not-found; without a session unauthenticated; blank invalid', function () {
		signIn('u1');
		expect(settle(FollowService.unfollow('u9')).err.code).toBe('not-found');
		expect(settle(FollowService.unfollow('')).err.code).toBe('invalid');
		settle(DataStore.remove('session', 'current'));
		expect(settle(FollowService.unfollow('u2')).err.code).toBe('unauthenticated');
	});

	it('listFollowing(userId) resolves the follows of that user only; listFollowers the reverse', function () {
		signIn('u1');
		settle(FollowService.follow('u2'));
		settle(FollowService.follow('u3'));
		signIn('u2');
		settle(FollowService.follow('u3'));
		var list = settle(FollowService.listFollowing('u1')).ok;
		expect(list.map(function (f) { return f.followeeId; }).sort()).toEqual(['u2', 'u3']);
		expect(settle(FollowService.listFollowing('u4')).ok).toEqual([]);
		expect(settle(FollowService.listFollowers('u3')).ok.length).toBe(2);
	});
});
