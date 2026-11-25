describe('commentsConfig and commentsCtrl', function () {
	var states, $rootScope, $controller, DataStore, CommentService, PostService, $q;

	beforeAll(function () {
		return import('../../text-posts/js/text-postsModule.js')
			.then(function () { return import('../js/commentsModule.js'); })
			.then(function () { return import('../../data/js/dataModule.js'); })
			.then(function () { return import('../../data/js/localAdapter.js'); })
			.then(function () { return import('../../data/js/dataStore.js'); })
			.then(function () { return import('../../text-posts/js/postService.js'); })
			.then(function () { return import('../js/commentService.js'); })
			.then(function () { return import('../js/commentsConfig.js'); })
			.then(function () { return import('../js/commentsCtrl.js'); });
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
		angular.mock.module('funglr.comments');
		angular.mock.inject(function (_$rootScope_, _$controller_, _DataStore_, _CommentService_, _PostService_, _$q_) {
			PostService = _PostService_;
			$q = _$q_;
			$rootScope = _$rootScope_;
			$controller = _$controller_;
			DataStore = _DataStore_;
			CommentService = _CommentService_;
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

	function start() {
		var scope = $rootScope.$new();
		$controller('commentsCtrl', { $scope: scope });
		$rootScope.$digest();
		return scope;
	}

	it('registers the funglr.comments state', function () {
		expect(states['funglr.comments'].url).toBe('/comments');
		expect(states['funglr.comments'].controller).toBe('commentsCtrl');
		expect(states['funglr.comments'].templateUrl).toBe('app/comments/views/comments.html');
	});

	it('loads posts with comments and author names', function () {
		var u = settle(DataStore.create('users', { email: 'a@b.c', name: 'Ann', passwordHash: 'x' })).ok;
		var p = settle(DataStore.create('posts', { authorId: u.id, type: 'text', title: 't', body: 'b' })).ok;
		signIn(u.id);
		settle(CommentService.addComment(p.id, 'hi'));
		var scope = start();
		expect(scope.posts[0].comments[0].authorName).toBe('Ann');
		expect(scope.currentUserId).toBe(u.id);
	});

	it('adds a comment, then clears the form', function () {
		var p = settle(DataStore.create('posts', { authorId: 'a', type: 'text', title: 't', body: 'b' })).ok;
		signIn('u1');
		var scope = start();
		scope.posts[0].newComment = 'yo';
		settle(scope.add(scope.posts[0]));
		expect(scope.posts[0].comments.length).toBe(1);
		expect(scope.posts[0].newComment).toBe('');
		expect(scope.error).toBe('');
		expect(p.id).toBeTruthy();
	});

	it('shows a message for an empty comment and when signed out', function () {
		settle(DataStore.create('posts', { authorId: 'a', type: 'text', title: 't', body: 'b' }));
		signIn('u1');
		var scope = start();
		scope.posts[0].newComment = ' ';
		settle(scope.add(scope.posts[0]));
		expect(scope.error).toBe('Write something before posting');
		settle(DataStore.remove('session', 'current'));
		scope.posts[0].newComment = 'x';
		settle(scope.add(scope.posts[0]));
		expect(scope.error).toBe('Sign in to comment');
	});

	it('removes own comment and reports forbidden for another user', function () {
		settle(DataStore.create('posts', { authorId: 'a', type: 'text', title: 't', body: 'b' }));
		signIn('u1');
		var scope = start();
		scope.posts[0].newComment = 'mine';
		settle(scope.add(scope.posts[0]));
		var comment = scope.posts[0].comments[0];
		signIn('u2');
		settle(scope.remove(scope.posts[0], comment));
		expect(scope.error).toBe('You can only delete your own comments');
		signIn('u1');
		settle(scope.remove(scope.posts[0], comment));
		expect(scope.posts[0].comments.length).toBe(0);
		expect(scope.error).toBe('');
	});

	it('starts with no posts, no error and no user before the load settles', function () {
		var scope = $rootScope.$new();
		$controller('commentsCtrl', { $scope: scope });
		expect(scope.posts).toEqual([]);
		expect(scope.error).toBe('');
		expect(scope.currentUserId).toBe(null);
	});

	it('sets currentUserId to null when signed out', function () {
		settle(DataStore.remove('session', 'current'));
		var scope = $rootScope.$new();
		scope.currentUserId = 'stale';
		$controller('commentsCtrl', { $scope: scope });
		$rootScope.$digest();
		scope.currentUserId = 'x';
		settle(scope.load());
		expect(scope.currentUserId).toBe(null);
	});

	it('resets posts and reports an error when loading fails', function () {
		var scope = start();
		vi.spyOn(PostService, 'list').mockReturnValue($q.reject({ code: 'boom' }));
		scope.posts = [{ id: 'stale' }];
		settle(scope.load());
		expect(scope.posts).toEqual([]);
		expect(scope.error).toBe('Could not load posts');
	});

	it('resets posts and reports an error when decorating comments fails', function () {
		settle(DataStore.create('posts', { authorId: 'a', type: 'text', title: 't', body: 'b' }));
		var scope = start();
		vi.spyOn(CommentService, 'getCommentsWithAuthors').mockReturnValue($q.reject({ code: 'boom' }));
		scope.posts = [{ id: 'stale' }];
		scope.error = '';
		settle(scope.load());
		expect(scope.posts).toEqual([]);
		expect(scope.error).toBe('Could not load posts');
	});

	it('shows the fallback message for an unknown or missing rejection', function () {
		settle(DataStore.create('posts', { authorId: 'a', type: 'text', title: 't', body: 'b' }));
		signIn('u1');
		var scope = start();
		var spy = vi.spyOn(CommentService, 'addComment');
		spy.mockReturnValue($q.reject({ code: 'weird' }));
		settle(scope.add(scope.posts[0]));
		expect(scope.error).toBe('Could not update the comment');
		scope.error = '';
		spy.mockReturnValue($q.reject());
		settle(scope.add(scope.posts[0]));
		expect(scope.error).toBe('Could not update the comment');
		scope.error = '';
		spy.mockReturnValue($q.reject(null));
		settle(scope.add(scope.posts[0]));
		expect(scope.error).toBe('Could not update the comment');
	});

	it('keeps a typed draft when a comment is removed, and clears it after a successful add', function () {
		settle(DataStore.create('posts', { authorId: 'a', type: 'text', title: 't', body: 'b' }));
		signIn('u1');
		var scope = start();
		scope.posts[0].newComment = 'first';
		settle(scope.add(scope.posts[0]));
		expect(scope.posts[0].newComment).toBe('');
		scope.posts[0].newComment = 'half typed';
		settle(scope.remove(scope.posts[0], scope.posts[0].comments[0]));
		expect(scope.posts[0].comments.length).toBe(0);
		expect(scope.posts[0].newComment).toBe('half typed');
		settle(scope.add(scope.posts[0]));
		expect(scope.posts[0].comments.length).toBe(1);
		expect(scope.posts[0].newComment).toBe('');
	});

	it('clears the previous error before add and before remove', function () {
		settle(DataStore.create('posts', { authorId: 'a', type: 'text', title: 't', body: 'b' }));
		signIn('u1');
		var scope = start();
		scope.error = 'old';
		scope.posts[0].newComment = 'fine';
		var pending = scope.add(scope.posts[0]);
		expect(scope.error).toBe('');
		settle(pending);
		scope.error = 'old';
		var removing = scope.remove(scope.posts[0], scope.posts[0].comments[0]);
		expect(scope.error).toBe('');
		settle(removing);
	});
});
