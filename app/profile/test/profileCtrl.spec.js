describe('profileCtrl', function () {
	var $rootScope, $controller, DataStore, scope;

	beforeAll(function () {
		return import('../../data/js/dataModule.js')
			.then(function () { return import('../../data/js/localAdapter.js'); })
			.then(function () { return import('../../data/js/dataStore.js'); })
			.then(function () { return import('../js/profileModule.js'); })
			.then(function () { return import('../js/profileService.js'); })
			.then(function () { return import('../js/profileCtrl.js'); });
	});

	beforeEach(function () {
		localStorage.clear();
		angular.mock.module('funglr.profile');
		angular.mock.inject(function (_$rootScope_, _$controller_, _DataStore_) {
			$rootScope = _$rootScope_;
			$controller = _$controller_;
			DataStore = _DataStore_;
		});
		scope = $rootScope.$new();
	});

	function seedUser() {
		DataStore.create('users', { id: 'u1', email: 'a@b.c', name: 'Ann', passwordHash: 'x' });
		DataStore.create('users', { id: 'u2', email: 'd@e.f', name: 'Bob', passwordHash: 'x' });
		DataStore.create('session', { id: 'current', userId: 'u1', email: 'a@b.c', name: 'Ann' });
		$rootScope.$digest();
	}

	function run() {
		$controller('profileCtrl', { $scope: scope });
		$rootScope.$digest();
	}

	it('shows the name and own posts newest first', function () {
		seedUser();
		DataStore.create('posts', { id: 'p1', authorId: 'u1', type: 'text', title: 'old', body: 'a' });
		DataStore.create('posts', { id: 'p2', authorId: 'u1', type: 'text', title: 'new', body: 'b' });
		DataStore.create('posts', { id: 'p3', authorId: 'u2', type: 'text', title: 'other', body: 'c' });
		DataStore.update('posts', 'p1', { createdAt: '2026-01-01T00:00:00.000Z' });
		DataStore.update('posts', 'p2', { createdAt: '2026-02-01T00:00:00.000Z' });
		$rootScope.$digest();
		run();
		expect(scope.user.name).toBe('Ann');
		expect(scope.posts.map(function (p) { return p.id; })).toEqual(['p2', 'p1']);
		expect(scope.message).toBe('');
		expect(scope.loaded).toBe(true);
	});

	it('shows an empty message when there are no posts', function () {
		seedUser();
		run();
		expect(scope.user.name).toBe('Ann');
		expect(scope.posts).toEqual([]);
		expect(scope.message).toBe('You have no posts yet.');
	});

	it('asks to sign in when there is no session', function () {
		run();
		expect(scope.user).toBe(null);
		expect(scope.message).toBe('Sign in to see your profile.');
		expect(scope.loaded).toBe(true);
	});
});
