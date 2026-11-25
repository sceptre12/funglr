describe('likesCtrl', function () {
	var $controller, $rootScope, $q, DataStore, PostService, LikeService;

	beforeAll(function () {
		return import('../../text-posts/js/text-postsModule.js')
			.then(function () { return import('../js/likesModule.js'); })
			.then(function () { return import('../../data/js/dataModule.js'); })
			.then(function () { return import('../../data/js/localAdapter.js'); })
			.then(function () { return import('../../data/js/dataStore.js'); })
			.then(function () { return import('../../text-posts/js/postService.js'); })
			.then(function () { return import('../js/likeService.js'); })
			.then(function () { return import('../js/likesCtrl.js'); });
	});

	beforeEach(function () {
		localStorage.clear();
		angular.mock.module('funglr.likes');
		angular.mock.inject(function (_$controller_, _$rootScope_, _$q_, _DataStore_, _PostService_, _LikeService_) {
			$controller = _$controller_;
			$rootScope = _$rootScope_;
			$q = _$q_;
			DataStore = _DataStore_;
			PostService = _PostService_;
			LikeService = _LikeService_;
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

	function makeCtrl() {
		var scope = $rootScope.$new();
		$controller('likesCtrl', { $scope: scope });
		return scope;
	}

	function find(scope, id) {
		return scope.posts.filter(function (p) { return p.id === id; })[0];
	}

	describe('LikeService legacy aliases', function () {
		it('likePost, unlikePost and getLikes behave as like, unlike and listForPost', function () {
			var p = makePost();
			signIn('u1');
			expect(settle(LikeService.likePost(p)).ok.id).toBe(p + ':u1');
			expect(settle(LikeService.likePost(p)).err.code).toBe('exists');
			var likes = settle(LikeService.getLikes(p)).ok;
			expect(likes.length).toBe(1);
			expect(likes[0].userId).toBe('u1');
			signIn('u2');
			expect(settle(LikeService.unlikePost(p, 'u1')).err.code).toBe('forbidden');
			signIn('u1');
			expect(settle(LikeService.unlikePost(p)).ok).toBe(true);
			expect(settle(LikeService.getLikes(p)).ok.length).toBe(0);
			expect(settle(LikeService.unlikePost(p)).err.code).toBe('not-found');
		});
	});

	describe('initial state', function () {
		it('starts with no posts and no error before the load resolves', function () {
			makePost();
			signIn('u1');
			var scope = makeCtrl();
			expect(scope.posts).toEqual([]);
			expect(scope.error).toBe('');
			$rootScope.$digest();
			expect(scope.posts.length).toBe(1);
			expect(scope.error).toBe('');
		});
	});

	describe('load', function () {
		it('marks liked posts for the signed-in user', function () {
			var p = makePost();
			signIn('u1');
			settle(LikeService.like(p));
			var scope = makeCtrl();
			$rootScope.$digest();
			expect(find(scope, p).liked).toBe(true);
			expect(find(scope, p).likeCount).toBe(1);
		});

		it('signed out (session lookup fails) marks no post as liked', function () {
			var p = makePost();
			signIn('x');
			settle(LikeService.like(p));
			settle(DataStore.remove('session', 'current'));
			var scope = makeCtrl();
			$rootScope.$digest();
			expect(scope.posts.length).toBe(1);
			expect(find(scope, p).liked).toBe(false);
			expect(find(scope, p).likeCount).toBe(1);
			expect(scope.error).toBe('');
		});

		it('resets posts and sets an error when the post list fails to load', function () {
			makePost();
			signIn('u1');
			var scope = makeCtrl();
			$rootScope.$digest();
			expect(scope.posts.length).toBe(1);
			vi.spyOn(PostService, 'list').mockReturnValue($q.reject({ code: 'boom' }));
			var out = settle(scope.load());
			expect(out.err).toBeUndefined();
			expect(scope.posts).toEqual([]);
			expect(scope.error).toBe('Could not load posts');
		});
	});

	describe('toggle', function () {
		it('clears the previous error before acting', function () {
			var p = makePost();
			signIn('u1');
			var scope = makeCtrl();
			$rootScope.$digest();
			scope.error = 'old error';
			var promise = scope.toggle(find(scope, p));
			expect(scope.error).toBe('');
			settle(promise);
			expect(scope.error).toBe('');
			expect(find(scope, p).liked).toBe(true);
			expect(find(scope, p).likeCount).toBe(1);
		});

		it('shows the sign-in message when the like is rejected as unauthenticated', function () {
			var p = makePost();
			var scope = makeCtrl();
			$rootScope.$digest();
			settle(scope.toggle(find(scope, p)));
			expect(scope.error).toBe('Sign in to like posts');
			expect(find(scope, p).liked).toBe(false);
		});

		it('shows the generic message for any other rejection', function () {
			var p = makePost();
			signIn('u1');
			var scope = makeCtrl();
			$rootScope.$digest();
			var post = find(scope, p);
			post.liked = true; // stale view: no like exists, so unlike rejects not-found
			settle(scope.toggle(post));
			expect(scope.error).toBe('Could not update the like');
		});
	});
});
