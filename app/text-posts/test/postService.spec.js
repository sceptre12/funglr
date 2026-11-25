describe('PostService', function () {
	var PostService, DataStore, $rootScope;

	beforeAll(function () {
		return import('../js/text-postsModule.js')
			.then(function () { return import('../../data/js/dataModule.js'); })
			.then(function () { return import('../../data/js/localAdapter.js'); })
			.then(function () { return import('../../data/js/dataStore.js'); })
			.then(function () { return import('../js/postService.js'); });
	});

	beforeEach(function () {
		localStorage.clear();
		angular.mock.module('funglr.text-posts');
		angular.mock.inject(function (_PostService_, _DataStore_, _$rootScope_) {
			PostService = _PostService_;
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

	function draft(over) {
		return angular.extend({ type: 'text', title: 'T', body: 'B' }, over);
	}

	it('create without a session rejects unauthenticated', function () {
		expect(settle(PostService.create(draft())).err.code).toBe('unauthenticated');
	});

	it('create rejects an empty title or body with invalid', function () {
		signIn('u1');
		expect(settle(PostService.create(draft({ title: '' }))).err.code).toBe('invalid');
		expect(settle(PostService.create(draft({ body: '  ' }))).err.code).toBe('invalid');
		expect(settle(PostService.create(draft({ body: new Array(2002).join('x') }))).err.code).toBe('invalid');
	});

	it('create stores a text post for the session user; get and list read it', function () {
		signIn('u1');
		var p = settle(PostService.create(draft())).ok;
		expect(p.authorId).toBe('u1');
		expect(p.type).toBe('text');
		expect(settle(PostService.get(p.id)).ok.title).toBe('T');
		expect(settle(PostService.list({ authorId: 'u1' })).ok.length).toBe(1);
	});

	it('accepts a body of exactly 2000 characters', function () {
		signIn('u1');
		expect(settle(PostService.create(draft({ body: new Array(2001).join('x') }))).ok.id).toBeTruthy();
	});

	it('delete by a non-author rejects forbidden; by the author resolves', function () {
		signIn('u1');
		var p = settle(PostService.create(draft())).ok;
		signIn('u2');
		expect(settle(PostService.remove(p.id)).err.code).toBe('forbidden');
		signIn('u1');
		expect(settle(PostService.remove(p.id)).ok).toBe(true);
		expect(settle(PostService.get(p.id)).err.code).toBe('not-found');
	});
});
