describe('text post controllers', function () {
	var $rootScope, $controller, PostService, DataStore, modal;

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
		angular.mock.inject(function (_$rootScope_, _$controller_, _PostService_, _DataStore_) {
			$rootScope = _$rootScope_;
			$controller = _$controller_;
			PostService = _PostService_;
			DataStore = _DataStore_;
		});
		modal = { close: function () { modal.closed = true; }, dismiss: function () {} };
	});

	function modalCtrl() {
		var scope = $rootScope.$new();
		$controller('textPostCtrl', { $scope: scope, $modalInstance: modal, clicked: 'text' });
		return scope;
	}

	function signIn(userId) {
		DataStore.create('session', { id: 'current', userId: userId });
		$rootScope.$digest();
	}

	it('submit calls PostService.create with a text post', function () {
		var scope = modalCtrl();
		var spy = vi.spyOn(PostService, 'create');
		signIn('u1');
		scope.post.title = 'T';
		scope.post.body = 'hello';
		scope.insertPost();
		$rootScope.$digest();
		expect(spy).toHaveBeenCalledTimes(1);
		expect(spy.mock.calls[0][0].type).toBe('text');
		expect(spy.mock.calls[0][0].body).toBe('hello');
		expect(modal.closed).toBe(true);
	});

	it('shows a validation message for an empty body and does not create', function () {
		var scope = modalCtrl();
		var spy = vi.spyOn(PostService, 'create');
		scope.post.title = 'T';
		scope.post.body = '   ';
		scope.insertPost();
		expect(scope.error).toBe('Body is required');
		expect(spy).not.toHaveBeenCalled();
	});

	it('list view shows only the signed-in user text posts', function () {
		signIn('u1');
		DataStore.create('posts', { authorId: 'u1', type: 'text', title: 'mine', body: 'b' });
		DataStore.create('posts', { authorId: 'u2', type: 'text', title: 'other', body: 'b' });
		DataStore.create('posts', { authorId: 'u1', type: 'image', title: 'img', body: '' });
		$rootScope.$digest();
		var scope = $rootScope.$new();
		$controller('postListCtrl', { $scope: scope });
		$rootScope.$digest();
		expect(scope.posts.map(function (p) { return p.title; })).toEqual(['mine']);
	});

	it('list view shows a sign-in message without a session', function () {
		var scope = $rootScope.$new();
		$controller('postListCtrl', { $scope: scope });
		$rootScope.$digest();
		expect(scope.posts).toEqual([]);
		expect(scope.error).toBe('Sign in to see your posts');
	});
});
