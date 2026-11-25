describe('LikeService', function () {
	var LikeService, DataStore, $rootScope;

	beforeAll(function () {
		return import('../../text-posts/js/text-postsModule.js')
			.then(function () { return import('../js/likesModule.js'); })
			.then(function () { return import('../../data/js/dataModule.js'); })
			.then(function () { return import('../../data/js/localAdapter.js'); })
			.then(function () { return import('../../data/js/dataStore.js'); })
			.then(function () { return import('../../text-posts/js/postService.js'); })
			.then(function () { return import('../js/likeService.js'); });
	});

	beforeEach(function () {
		localStorage.clear();
		angular.mock.module('funglr.likes');
		angular.mock.inject(function (_LikeService_, _DataStore_, _$rootScope_) {
			LikeService = _LikeService_;
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

	function makePost() {
		return settle(DataStore.create('posts', { authorId: 'a', type: 'text', title: 't', body: 'b' })).ok.id;
	}

	it('likes a post with id postId:userId and counts it', function () {
		var p = makePost();
		signIn('u1');
		expect(settle(LikeService.like(p)).ok.id).toBe(p + ':u1');
		expect(settle(LikeService.count(p)).ok).toBe(1);
	});

	it('rejects exists when liking twice', function () {
		var p = makePost();
		signIn('u1');
		settle(LikeService.like(p));
		expect(settle(LikeService.like(p)).err.code).toBe('exists');
		expect(settle(LikeService.count(p)).ok).toBe(1);
	});

	it('unlike removes the like and lowers the count', function () {
		var p = makePost();
		signIn('u1');
		settle(LikeService.like(p));
		expect(settle(LikeService.unlike(p)).ok).toBe(true);
		expect(settle(LikeService.count(p)).ok).toBe(0);
	});

	it('rejects forbidden when another user unlikes', function () {
		var p = makePost();
		signIn('u1');
		settle(LikeService.like(p));
		signIn('u2');
		expect(settle(LikeService.unlike(p, 'u1')).err.code).toBe('forbidden');
		expect(settle(LikeService.count(p)).ok).toBe(1);
	});

	it('unlike without a like rejects not-found', function () {
		var p = makePost();
		signIn('u1');
		expect(settle(LikeService.unlike(p)).err.code).toBe('not-found');
	});

	it('count equals the likes of that post only', function () {
		var p = makePost();
		var q = makePost();
		signIn('u1');
		settle(LikeService.like(p));
		settle(LikeService.like(q));
		signIn('u2');
		settle(LikeService.like(p));
		expect(settle(LikeService.count(p)).ok).toBe(2);
		expect(settle(LikeService.count(q)).ok).toBe(1);
	});

	it('listForPost resolves the likes of that post', function () {
		var p = makePost();
		var q = makePost();
		signIn('u1');
		settle(LikeService.like(p));
		settle(LikeService.like(q));
		var likes = settle(LikeService.listForPost(p)).ok;
		expect(likes.length).toBe(1);
		expect(likes[0].postId).toBe(p);
		expect(likes[0].userId).toBe('u1');
	});

	it('rejects unauthenticated without a session and not-found for a missing post', function () {
		var p = makePost();
		expect(settle(LikeService.like(p)).err.code).toBe('unauthenticated');
		signIn('u1');
		expect(settle(LikeService.like('nope')).err.code).toBe('not-found');
	});
});
