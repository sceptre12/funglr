describe('activityCtrl details and activity.html', function () {
	var $rootScope, $controller, $compile, DataStore, LikeService, fs;

	beforeAll(function () {
		return import('node:fs').then(function (m) { fs = m; })
			.then(function () { return import('../../text-posts/js/text-postsModule.js'); })
			.then(function () { return import('../../likes/js/likesModule.js'); })
			.then(function () { return import('../js/activityModule.js'); })
			.then(function () { return import('../../data/js/dataModule.js'); })
			.then(function () { return import('../../data/js/localAdapter.js'); })
			.then(function () { return import('../../data/js/dataStore.js'); })
			.then(function () { return import('../../text-posts/js/postService.js'); })
			.then(function () { return import('../../likes/js/likeService.js'); })
			.then(function () { return import('../js/activityConfig.js'); })
			.then(function () { return import('../js/activityCtrl.js'); });
	});

	beforeEach(function () {
		localStorage.clear();
		angular.mock.module(function ($provide) {
			$provide.provider('$state', {
				state: function () { return this; },
				$get: function () { return {}; }
			});
		});
		angular.mock.module('funglr.activity');
		angular.mock.inject(function (_$rootScope_, _$controller_, _$compile_, _DataStore_, _LikeService_) {
			$rootScope = _$rootScope_;
			$controller = _$controller_;
			$compile = _$compile_;
			DataStore = _DataStore_;
			LikeService = _LikeService_;
		});
	});

	function settle(promise) {
		var out = {};
		promise.then(function (v) { out.ok = v; }, function (e) { out.err = e; });
		$rootScope.$digest();
		return out;
	}

	function makePost(authorId, title) {
		return settle(DataStore.create('posts', { authorId: authorId, type: 'text', title: title || 't' + authorId, body: 'b' })).ok.id;
	}

	function addLike(postId, userId, createdAt) {
		vi.useFakeTimers({ toFake: ['Date'] });
		vi.setSystemTime(new Date(createdAt));
		settle(DataStore.create('likes', { id: postId + ':' + userId, postId: postId, userId: userId }));
		vi.useRealTimers();
	}

	function signIn() {
		settle(DataStore.create('session', { id: 'current', userId: 'me' }));
	}

	function newScope() {
		var scope = $rootScope.$new();
		$controller('activityCtrl', { $scope: scope });
		return scope;
	}

	it('starts with an empty list and no error before the first load settles', function () {
		signIn();
		makePost('me');
		var scope = newScope();
		expect(scope.activity).toEqual([]);
		expect(scope.error).toBe('');
		expect(scope.emptyMessage).toBe('No likes yet.');
	});

	it('orders by createdAt descending, keeping ties in input order', function () {
		signIn();
		var p = makePost('me');
		addLike(p, 'a', '2026-01-01T00:00:00.000Z');
		addLike(p, 'b', '2026-01-02T00:00:00.000Z');
		addLike(p, 'c', '2026-01-03T00:00:00.000Z');
		var scope = newScope();
		$rootScope.$digest();
		expect(scope.activity.map(function (i) { return i.userId; })).toEqual(['c', 'b', 'a']);
	});

	it('keeps equal timestamps in their original order', function () {
		signIn();
		var p = makePost('me');
		addLike(p, 'a', '2026-01-01T00:00:00.000Z');
		addLike(p, 'b', '2026-01-01T00:00:00.000Z');
		addLike(p, 'c', '2026-01-01T00:00:00.000Z');
		addLike(p, 'd', '2026-01-01T00:00:00.000Z');
		var expected = LikeService.listForPost(p);
		var listed = settle(expected).ok.map(function (l) { return l.userId; });
		var scope = newScope();
		$rootScope.$digest();
		expect(scope.activity.map(function (i) { return i.userId; })).toEqual(listed);
	});

	it('orders newest first when the store already lists them newest first', function () {
		signIn();
		var p = makePost('me');
		addLike(p, 'c', '2026-01-03T00:00:00.000Z');
		addLike(p, 'b', '2026-01-02T00:00:00.000Z');
		addLike(p, 'a', '2026-01-01T00:00:00.000Z');
		var scope = newScope();
		$rootScope.$digest();
		expect(scope.activity.map(function (i) { return i.userId; })).toEqual(['c', 'b', 'a']);
	});

	it('keeps a long run of equal timestamps in their original order', function () {
		signIn();
		var p = makePost('me');
		var n;
		for (n = 0; n < 200; n += 1) {
			addLike(p, 'u' + n, '2026-01-01T00:00:00.000Z');
		}
		var listed = settle(LikeService.listForPost(p)).ok.map(function (l) { return l.userId; });
		var scope = newScope();
		$rootScope.$digest();
		expect(scope.activity.length).toBe(200);
		expect(scope.activity.map(function (i) { return i.userId; })).toEqual(listed);
	});

	it('clears a previous error as soon as load starts', function () {
		signIn();
		var scope = newScope();
		$rootScope.$digest();
		scope.error = 'old error';
		var p = scope.load();
		expect(scope.error).toBe('');
		settle(p);
		expect(scope.error).toBe('');
	});

	it('fetches likes for every authored post', function () {
		signIn();
		var p1 = makePost('me', 'first');
		var p2 = makePost('me', 'second');
		var p3 = makePost('me', 'third');
		addLike(p1, 'a', '2026-01-01T00:00:00.000Z');
		addLike(p2, 'b', '2026-01-02T00:00:00.000Z');
		addLike(p3, 'c', '2026-01-03T00:00:00.000Z');
		var scope = newScope();
		$rootScope.$digest();
		expect(scope.activity.map(function (i) { return i.postId; })).toEqual([p3, p2, p1]);
	});

	it('gives each item the like and the post', function () {
		signIn();
		var p = makePost('me', 'Hello');
		addLike(p, 'a', '2026-01-01T00:00:00.000Z');
		var scope = newScope();
		$rootScope.$digest();
		expect(scope.activity.length).toBe(1);
		var item = scope.activity[0];
		expect(item.like.id).toBe(p + ':a');
		expect(item.like.userId).toBe('a');
		expect(item.post.id).toBe(p);
		expect(item.post.title).toBe('Hello');
		expect(item.createdAt).toBe(item.like.createdAt);
	});

	it('resets the list when a reload fails', function () {
		signIn();
		var p = makePost('me');
		addLike(p, 'a', '2026-01-01T00:00:00.000Z');
		var scope = newScope();
		$rootScope.$digest();
		expect(scope.activity.length).toBe(1);
		settle(DataStore.remove('session', 'current'));
		settle(scope.load());
		expect(scope.activity).toEqual([]);
		expect(scope.error).toBe('Could not load activity');
	});

	it('returns a promise that resolves after the list is loaded', function () {
		signIn();
		var p = makePost('me');
		addLike(p, 'a', '2026-01-01T00:00:00.000Z');
		var scope = newScope();
		$rootScope.$digest();
		scope.activity = [];
		var result = scope.load();
		expect(typeof result.then).toBe('function');
		var done = false;
		result.then(function () { done = true; });
		$rootScope.$digest();
		expect(done).toBe(true);
		expect(scope.activity.length).toBe(1);
	});

	describe('views/activity.html', function () {
		function render(model) {
			var scope = $rootScope.$new();
			angular.extend(scope, model);
			var el = $compile('<div>' + fs.readFileSync('app/activity/views/activity.html', 'utf8') + '</div>')(scope);
			scope.$digest();
			return { el: el[0], scope: scope };
		}

		it('shows the error and hides the empty line when there is an error', function () {
			var r = render({ error: 'Boom', activity: [], emptyMessage: 'No likes yet.' });
			var err = r.el.querySelector('p.text-danger');
			expect(err).not.toBeNull();
			expect(err.textContent).toBe('Boom');
			expect(r.el.querySelector('.activity-empty')).toBeNull();
		});

		it('shows the empty line and no error when the list is empty', function () {
			var r = render({ error: '', activity: [], emptyMessage: 'No likes yet.' });
			expect(r.el.querySelector('p.text-danger')).toBeNull();
			var empty = r.el.querySelector('.activity-empty');
			expect(empty).not.toBeNull();
			expect(empty.textContent).toBe('No likes yet.');
		});

		it('shows no error and no empty line when there are items, one line per item', function () {
			var r = render({
				error: '',
				emptyMessage: 'No likes yet.',
				activity: [
					{ userId: 'u1', postId: 'p1', post: { id: 'p1', title: 'One' } },
					{ userId: 'u2', postId: 'p2', post: { id: 'p2', title: 'Two' } },
					{ userId: 'u3', postId: 'p1', post: { id: 'p1', title: 'One' } }
				]
			});
			expect(r.el.querySelector('p.text-danger')).toBeNull();
			expect(r.el.querySelector('.activity-empty')).toBeNull();
			var lines = r.el.querySelectorAll('article p');
			expect(lines.length).toBe(3);
			expect(lines[0].textContent).toBe('u1 liked "One"');
			expect(lines[1].textContent).toBe('u2 liked "Two"');
			expect(lines[2].textContent).toBe('u3 liked "One"');
			expect(lines[0].querySelector('strong').textContent).toBe('u1');
		});
	});
});
