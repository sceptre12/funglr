describe('text-posts mutant killers', function () {
	var $rootScope, $controller, $q, PostService, DataStore, modal;

	beforeAll(function () {
		return import('../js/text-postsModule.js')
			.then(function () { return import('../../data/js/dataModule.js'); })
			.then(function () { return import('../../data/js/localAdapter.js'); })
			.then(function () { return import('../../data/js/dataStore.js'); })
			.then(function () { return import('../js/postService.js'); })
			.then(function () { return import('../js/textPostCtrl.js'); })
			.then(function () { return import('../js/postListCtrl.js'); });
	});

	beforeEach(function () {
		localStorage.clear();
		angular.mock.module('funglr.text-posts');
		angular.mock.inject(function (_$rootScope_, _$controller_, _$q_, _PostService_, _DataStore_) {
			$rootScope = _$rootScope_;
			$controller = _$controller_;
			$q = _$q_;
			PostService = _PostService_;
			DataStore = _DataStore_;
		});
		modal = { close: function () { modal.closed = true; }, dismiss: function () {} };
	});

	function settle(promise) {
		var out = {};
		promise.then(function (v) { out.ok = v; }, function (e) { out.err = e; });
		$rootScope.$digest();
		return out;
	}

	function signIn(userId) {
		DataStore.create('session', { id: 'current', userId: userId });
		$rootScope.$digest();
	}

	function modalCtrl() {
		var scope = $rootScope.$new();
		$controller('textPostCtrl', { $scope: scope, $modalInstance: modal, clicked: 'text' });
		return scope;
	}

	describe('PostService validation messages', function () {
		beforeEach(function () { signIn('u1'); });

		it('rejects with the specific message for each invalid input', function () {
			expect(settle(PostService.create({ type: 'text', title: '', body: 'B' })).err)
				.toEqual({ code: 'invalid', message: 'title is required' });
			expect(settle(PostService.create({ type: 'text', title: 'T', body: ' ' })).err)
				.toEqual({ code: 'invalid', message: 'body is required' });
			expect(settle(PostService.create({ type: 'text', title: 'T', body: new Array(2002).join('x') })).err)
				.toEqual({ code: 'invalid', message: 'body is at most 2000 characters' });
		});

		it('rejects a non-string body as invalid without throwing', function () {
			var out;
			expect(function () {
				out = settle(PostService.create({ type: 'text', title: 'T', body: 12345 }));
			}).not.toThrow();
			expect(out.err).toEqual({ code: 'invalid', message: 'body is required' });
		});

		it('rejects a non-string title as invalid', function () {
			expect(settle(PostService.create({ type: 'text', title: 7, body: 'B' })).err.message).toBe('title is required');
		});
	});

	describe('textPostCtrl', function () {
		it('starts with an empty-string error', function () {
			expect(modalCtrl().error).toBe('');
		});

		it('clears a previous error on submit', function () {
			var scope = modalCtrl();
			vi.spyOn(PostService, 'create').mockReturnValue($q.defer().promise);
			scope.post.title = 'T';
			scope.post.body = 'hello';
			scope.error = 'old';
			scope.insertPost();
			expect(scope.error).toBe('');
		});

		it('rejects a non-string body in the guard before calling the service', function () {
			var scope = modalCtrl();
			var spy = vi.spyOn(PostService, 'create');
			scope.post.body = 42;
			expect(function () { scope.insertPost(); }).not.toThrow();
			expect(scope.error).toBe('Body is required');
			expect(spy).not.toHaveBeenCalled();
		});

		it('sets the service error message on save failure', function () {
			var scope = modalCtrl();
			vi.spyOn(PostService, 'create').mockReturnValue($q.reject({ code: 'invalid', message: 'boom' }));
			scope.post.body = 'hello';
			scope.insertPost();
			$rootScope.$digest();
			expect(scope.error).toBe('boom');
			expect(modal.closed).toBeUndefined();
		});

		it('falls back to a generic message when the failure has no message', function () {
			var scope = modalCtrl();
			var spy = vi.spyOn(PostService, 'create');
			scope.post.body = 'hello';
			spy.mockReturnValue($q.reject({ code: 'x' }));
			scope.insertPost();
			$rootScope.$digest();
			expect(scope.error).toBe('Could not save the post');
			spy.mockReturnValue($q.reject());
			scope.insertPost();
			$rootScope.$digest();
			expect(scope.error).toBe('Could not save the post');
		});
	});

	describe('postListCtrl', function () {
		function listCtrl() {
			var scope = $rootScope.$new();
			$controller('postListCtrl', { $scope: scope });
			return scope;
		}

		it('starts with an empty list and empty error before load resolves', function () {
			var scope = listCtrl();
			expect(scope.posts).toEqual([]);
			expect(scope.error).toBe('');
		});

		it('returns the load promise', function () {
			var scope = listCtrl();
			$rootScope.$digest();
			expect(typeof scope.load().then).toBe('function');
		});

		it('resets posts to an empty list when a reload fails after a successful load', function () {
			signIn('u1');
			settle(PostService.create({ type: 'text', title: 'T', body: 'B' }));
			var scope = listCtrl();
			$rootScope.$digest();
			expect(scope.posts.length).toBe(1);
			settle(DataStore.remove('session', 'current'));
			scope.load();
			$rootScope.$digest();
			expect(scope.posts).toEqual([]);
			expect(scope.error).toBe('Sign in to see your posts');
		});
	});
});
