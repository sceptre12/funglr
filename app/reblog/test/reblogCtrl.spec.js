describe('reblogConfig and reblogCtrl', function () {
	var states, $rootScope, $q, $controller, DataStore, ReblogService;

	beforeAll(function () {
		return import('../js/reblogModule.js')
			.then(function () { return import('../../data/js/dataModule.js'); })
			.then(function () { return import('../../data/js/localAdapter.js'); })
			.then(function () { return import('../../data/js/dataStore.js'); })
			.then(function () { return import('../js/reblogService.js'); })
			.then(function () { return import('../js/reblogConfig.js'); })
			.then(function () { return import('../js/reblogCtrl.js'); });
	});

	beforeEach(function () {
		localStorage.clear();
		states = {};
		angular.mock.module(function ($provide) {
			$provide.provider('$state', {
				state: function (name, def) { states[name] = def; return this; },
				$get: function () { return {}; }
			});
		});
		angular.mock.module('funglr.reblog');
		angular.mock.inject(function (_$rootScope_, _$q_, _$controller_, _DataStore_, _ReblogService_) {
			$rootScope = _$rootScope_;
			$q = _$q_;
			$controller = _$controller_;
			DataStore = _DataStore_;
			ReblogService = _ReblogService_;
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

	function makeCtrl() {
		var scope = $rootScope.$new();
		$controller('reblogCtrl', { $scope: scope });
		$rootScope.$digest();
		return scope;
	}

	it('registers the funglr.reblog state', function () {
		expect(states['funglr.reblog']).toEqual({
			url: '/reblog',
			templateUrl: 'app/reblog/views/reblog.html',
			controller: 'reblogCtrl'
		});
	});

	it('starts empty before the load resolves', function () {
		makePost('a');
		var scope = $rootScope.$new();
		$controller('reblogCtrl', { $scope: scope });
		expect(scope.posts).toEqual([]);
		expect(scope.error).toBe('');
		$rootScope.$digest();
		expect(scope.posts.length).toBe(1);
	});

	it('reblogs then unreblogs, updating state and count', function () {
		var p = makePost('a');
		signIn('u1');
		var scope = makeCtrl();
		expect(scope.posts[0].reblogged).toBe(false);
		expect(scope.posts[0].reblogCount).toBe(0);
		settle(scope.toggle(scope.posts[0]));
		expect(scope.posts[0].reblogged).toBe(true);
		expect(scope.posts[0].reblogCount).toBe(1);
		expect(scope.error).toBe('');
		expect(settle(ReblogService.getReblogs(p)).ok.length).toBe(1);
		settle(scope.toggle(scope.posts[0]));
		expect(scope.posts[0].reblogged).toBe(false);
		expect(scope.posts[0].reblogCount).toBe(0);
		expect(settle(ReblogService.getReblogs(p)).ok.length).toBe(0);
	});

	it('does not list reblog rows as posts', function () {
		var p = makePost('a');
		signIn('u1');
		settle(ReblogService.reblogPost(p));
		var scope = makeCtrl();
		expect(scope.posts.length).toBe(1);
		expect(scope.posts[0].id).toBe(p);
		expect(scope.posts[0].reblogged).toBe(true);
	});

	it('shows a sign-in message when unauthenticated', function () {
		makePost('a');
		var scope = makeCtrl();
		settle(scope.toggle(scope.posts[0]));
		expect(scope.error).toBe('Sign in to reblog posts');
		expect(scope.posts[0].reblogged).toBe(false);
	});

	it('shows the forbidden message for your own post', function () {
		makePost('u1');
		signIn('u1');
		var scope = makeCtrl();
		settle(scope.toggle(scope.posts[0]));
		expect(scope.error).toBe('You cannot reblog your own post');
	});

	it('shows the exists message on a stale duplicate reblog', function () {
		var p = makePost('a');
		signIn('u1');
		var scope = makeCtrl();
		settle(ReblogService.reblogPost(p));
		settle(scope.toggle(scope.posts[0]));
		expect(scope.error).toBe('You already reblogged this post');
	});

	it('shows the not-found message on a stale unreblog and clears errors on the next action', function () {
		makePost('a');
		signIn('u1');
		var scope = makeCtrl();
		scope.posts[0].reblogged = true;
		settle(scope.toggle(scope.posts[0]));
		expect(scope.error).toBe('There is no reblog of this post to remove');
		scope.posts[0].reblogged = false;
		var promise = scope.toggle(scope.posts[0]);
		expect(scope.error).toBe('');
		settle(promise);
		expect(scope.error).toBe('');
	});

	it('shows the post-gone message when reblogging a deleted post', function () {
		var p = makePost('a');
		signIn('u1');
		var scope = makeCtrl();
		settle(DataStore.remove('posts', p));
		settle(scope.toggle(scope.posts[0]));
		expect(scope.error).toBe('This post no longer exists');
		expect(scope.posts[0].reblogged).toBe(false);
	});

	it('refreshes the row after a stale exists rejection', function () {
		var p = makePost('a');
		signIn('u1');
		var scope = makeCtrl();
		settle(ReblogService.reblogPost(p));
		expect(scope.posts[0].reblogged).toBe(false);
		settle(scope.toggle(scope.posts[0]));
		expect(scope.posts[0].reblogged).toBe(true);
		expect(scope.posts[0].reblogCount).toBe(1);
	});

	it('refreshes the row after a stale not-found rejection', function () {
		makePost('a');
		signIn('u1');
		var scope = makeCtrl();
		scope.posts[0].reblogged = true;
		scope.posts[0].reblogCount = 3;
		settle(scope.toggle(scope.posts[0]));
		expect(scope.posts[0].reblogged).toBe(false);
		expect(scope.posts[0].reblogCount).toBe(0);
	});

	it('shows the generic message for an unknown rejection code', function () {
		makePost('a');
		signIn('u1');
		var scope = makeCtrl();
		vi.spyOn(ReblogService, 'reblogPost').mockReturnValue($q.reject({ code: 'boom' }));
		settle(scope.toggle(scope.posts[0]));
		expect(scope.error).toBe('Could not update the reblog');
	});
});
