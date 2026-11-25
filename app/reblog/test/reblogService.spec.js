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

	it('copies type, title, body and mediaData onto the reblog', function () {
		var src = settle(DataStore.create('posts', { authorId: 'a', type: 'image', title: 'Pic', body: 'Cap', mediaData: 'data:image/png;base64,AA' })).ok;
		signIn('u1');
		var r = settle(ReblogService.reblogPost(src.id)).ok;
		expect(r.type).toBe('image');
		expect(r.title).toBe('Pic');
		expect(r.body).toBe('Cap');
		expect(r.mediaData).toBe('data:image/png;base64,AA');
		expect(r.reblogOf).toBe(src.id);
		expect(r.authorId).toBe('u1');
	});

	it('lets the same user reblog a second, different post', function () {
		var p1 = makePost('a');
		var p2 = makePost('b');
		signIn('u1');
		expect(settle(ReblogService.reblogPost(p1)).ok.reblogOf).toBe(p1);
		var second = settle(ReblogService.reblogPost(p2));
		expect(second.err).toBeUndefined();
		expect(second.ok.reblogOf).toBe(p2);
		expect(settle(ReblogService.getReblogs(p1)).ok.length).toBe(1);
		expect(settle(ReblogService.getReblogs(p2)).ok.length).toBe(1);
	});

	it('lets a different user reblog the same post', function () {
		var p = makePost('a');
		signIn('u1');
		settle(ReblogService.reblogPost(p));
		signIn('u2');
		expect(settle(ReblogService.reblogPost(p)).err).toBeUndefined();
		expect(settle(ReblogService.getReblogs(p)).ok.length).toBe(2);
	});

	it('uses the documented rejection messages', function () {
		var own = makePost('u1');
		var other = makePost('a');
		signIn('u1');
		expect(settle(ReblogService.reblogPost(own)).err.message).toBe('cannot reblog your own post');
		settle(ReblogService.reblogPost(other));
		expect(settle(ReblogService.reblogPost(other)).err.message).toBe('already reblogged');
		expect(settle(ReblogService.unReblog(own)).err.message).toBe('no reblog of this post');
		settle(DataStore.remove('session', 'current'));
		expect(settle(ReblogService.reblogPost(other)).err.message).toBe('sign in required');
		expect(settle(ReblogService.unReblog(other)).err.code).toBe('unauthenticated');
	});

	it('reblog then unreblog leaves no reblog row', function () {
		var p = makePost('a');
		signIn('u1');
		settle(ReblogService.reblogPost(p));
		expect(settle(ReblogService.unReblog(p)).ok).toBe(true);
		expect(settle(ReblogService.getReblogs(p)).ok.length).toBe(0);
	});
});
