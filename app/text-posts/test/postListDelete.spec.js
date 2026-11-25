describe('post list delete control', function () {
	var $rootScope, $controller, $q, PostService, DataStore;

	beforeAll(function () {
		return import('../js/text-postsModule.js')
			.then(function () { return import('../../data/js/dataModule.js'); })
			.then(function () { return import('../../data/js/localAdapter.js'); })
			.then(function () { return import('../../data/js/dataStore.js'); })
			.then(function () { return import('../js/postService.js'); })
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
	});

	function listScope() {
		DataStore.create('session', { id: 'current', userId: 'u1' });
		$rootScope.$digest();
		var scope = $rootScope.$new();
		$controller('postListCtrl', { $scope: scope });
		$rootScope.$digest();
		return scope;
	}

	it('removes a deleted post from the list', function () {
		DataStore.create('posts', { authorId: 'u1', type: 'text', title: 'mine', body: 'b' });
		var scope = listScope();
		expect(scope.posts.length).toBe(1);
		scope.remove(scope.posts[0]);
		$rootScope.$digest();
		expect(scope.posts).toEqual([]);
		expect(scope.error).toBe('');
	});

	it('shows the forbidden message for a forbidden rejection', function () {
		DataStore.create('posts', { authorId: 'u1', type: 'text', title: 'mine', body: 'b' });
		var scope = listScope();
		vi.spyOn(PostService, 'remove').mockReturnValue($q.reject({ code: 'forbidden', message: 'x' }));
		scope.remove(scope.posts[0]);
		$rootScope.$digest();
		expect(scope.error).toBe('You can only delete your own posts');
		expect(scope.posts.length).toBe(1);
	});

	it('shows the generic message for another rejection', function () {
		DataStore.create('posts', { authorId: 'u1', type: 'text', title: 'mine', body: 'b' });
		var scope = listScope();
		vi.spyOn(PostService, 'remove').mockReturnValue($q.reject({ code: 'not-found', message: 'x' }));
		scope.remove(scope.posts[0]);
		$rootScope.$digest();
		expect(scope.error).toBe('Could not delete the post');
	});

	it('template has a delete control bound to remove(post)', function () {
		return import('node:fs').then(function (fs) {
			var html = fs.readFileSync('app/text-posts/views/postList.html', 'utf8');
			expect(html).toMatch(/ng-click="remove\(post\)"/);
		});
	});
});
