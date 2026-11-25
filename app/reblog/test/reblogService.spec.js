describe('ReblogService', function () {
	var ReblogService, DataStore, $rootScope;

	beforeAll(function () {
		return import('../js/reblogModule.js')
			.then(function () { return import('../../data/js/dataModule.js'); })
			.then(function () { return import('../../data/js/localAdapter.js'); })
			.then(function () { return import('../../data/js/dataStore.js'); })
			.then(function () { return import('../js/reblogService.js'); });
	});

	beforeEach(function () {
		localStorage.clear();
		angular.mock.module('funglr.reblog');
		angular.mock.inject(function (_ReblogService_, _DataStore_, _$rootScope_) {
			ReblogService = _ReblogService_;
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

	function makePost(authorId) {
		return settle(DataStore.create('posts', { authorId: authorId, type: 'text', title: 't', body: 'b' })).ok.id;
	}

	it('reblogs another user post with reblogOf set', function () {
		var p = makePost('a');
		signIn('u1');
		var r = settle(ReblogService.reblogPost(p)).ok;
		expect(r.reblogOf).toBe(p);
		expect(r.authorId).toBe('u1');
		expect(settle(ReblogService.getReblogs(p)).ok.length).toBe(1);
	});

	it('rejects forbidden when reblogging your own post', function () {
		var p = makePost('u1');
		signIn('u1');
		expect(settle(ReblogService.reblogPost(p)).err.code).toBe('forbidden');
		expect(settle(ReblogService.getReblogs(p)).ok.length).toBe(0);
	});

	it('rejects exists on a duplicate reblog and keeps one row', function () {
		var p = makePost('a');
		signIn('u1');
		settle(ReblogService.reblogPost(p));
		expect(settle(ReblogService.reblogPost(p)).err.code).toBe('exists');
		expect(settle(ReblogService.getReblogs(p)).ok.length).toBe(1);
	});

	it('rejects unauthenticated without a session', function () {
		var p = makePost('a');
		settle(DataStore.remove('session', 'current'));
		expect(settle(ReblogService.reblogPost(p)).err.code).toBe('unauthenticated');
	});

	it('unReblog removes only the caller reblog', function () {
		var p = makePost('a');
		signIn('u1');
		settle(ReblogService.reblogPost(p));
		signIn('u2');
		settle(ReblogService.reblogPost(p));
		expect(settle(ReblogService.unReblog(p)).ok).toBe(true);
		var left = settle(ReblogService.getReblogs(p)).ok;
		expect(left.length).toBe(1);
		expect(left[0].authorId).toBe('u1');
		expect(settle(ReblogService.unReblog(p)).err.code).toBe('not-found');
	});
});
