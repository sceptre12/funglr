describe('CommentService', function () {
	var CommentService, DataStore, $rootScope;

	beforeAll(function () {
		return import('../../text-posts/js/text-postsModule.js')
			.then(function () { return import('../js/commentsModule.js'); })
			.then(function () { return import('../../data/js/dataModule.js'); })
			.then(function () { return import('../../data/js/localAdapter.js'); })
			.then(function () { return import('../../data/js/dataStore.js'); })
			.then(function () { return import('../../text-posts/js/postService.js'); })
			.then(function () { return import('../js/commentService.js'); });
	});

	beforeEach(function () {
		localStorage.clear();
		angular.mock.module('funglr.comments');
		angular.mock.inject(function (_CommentService_, _DataStore_, _$rootScope_) {
			CommentService = _CommentService_;
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

	it('adds a comment with the signed-in author', function () {
		var p = makePost();
		signIn('u1');
		var c = settle(CommentService.addComment(p, ' hello ')).ok;
		expect(c.postId).toBe(p);
		expect(c.authorId).toBe('u1');
		expect(c.body).toBe('hello');
	});

	it('rejects an empty or blank comment as invalid', function () {
		var p = makePost();
		signIn('u1');
		expect(settle(CommentService.addComment(p, '')).err.code).toBe('invalid');
		expect(settle(CommentService.addComment(p, '   ')).err.code).toBe('invalid');
		expect(settle(CommentService.addComment(p)).err.code).toBe('invalid');
		expect(settle(CommentService.getComments(p)).ok.length).toBe(0);
	});

	it('rejects an over-long comment as invalid', function () {
		var p = makePost();
		signIn('u1');
		expect(settle(CommentService.addComment(p, new Array(1002).join('x'))).err.code).toBe('invalid');
	});

	it('rejects unauthenticated when not signed in', function () {
		var p = makePost();
		expect(settle(CommentService.addComment(p, 'hi')).err.code).toBe('unauthenticated');
		expect(settle(CommentService.removeComment('x')).err.code).toBe('unauthenticated');
	});

	it('rejects not-found for a missing post', function () {
		signIn('u1');
		expect(settle(CommentService.addComment('nope', 'hi')).err.code).toBe('not-found');
	});

	it('lists the comments of one post only', function () {
		var p1 = makePost();
		var p2 = makePost();
		signIn('u1');
		settle(CommentService.addComment(p1, 'one'));
		settle(CommentService.addComment(p2, 'two'));
		var list = settle(CommentService.getComments(p1)).ok;
		expect(list.length).toBe(1);
		expect(list[0].body).toBe('one');
	});

	it('lets the author delete and forbids anyone else', function () {
		var p = makePost();
		signIn('u1');
		var c = settle(CommentService.addComment(p, 'mine')).ok;
		signIn('u2');
		expect(settle(CommentService.removeComment(c.id)).err.code).toBe('forbidden');
		expect(settle(CommentService.getComments(p)).ok.length).toBe(1);
		signIn('u1');
		expect(settle(CommentService.removeComment(c.id)).ok).toBe(true);
		expect(settle(CommentService.getComments(p)).ok.length).toBe(0);
	});

	it('rejects not-found when deleting a missing comment', function () {
		signIn('u1');
		expect(settle(CommentService.removeComment('nope')).err.code).toBe('not-found');
	});

	it('resolves an author id to the display name', function () {
		var u = settle(DataStore.create('users', { email: 'a@b.c', name: 'Ann', passwordHash: 'x' })).ok;
		expect(settle(CommentService.authorName(u.id)).ok).toBe('Ann');
	});

	it('falls back to the id when the author is unknown or has no name', function () {
		expect(settle(CommentService.authorName('ghost')).ok).toBe('ghost');
		var u = settle(DataStore.create('users', { email: 'n@b.c', passwordHash: 'x' })).ok;
		expect(settle(CommentService.authorName(u.id)).ok).toBe(u.id);
	});

	it('lists comments with author names', function () {
		var p = makePost();
		var u = settle(DataStore.create('users', { email: 'a@b.c', name: 'Ann', passwordHash: 'x' })).ok;
		signIn(u.id);
		settle(CommentService.addComment(p, 'hi'));
		settle(DataStore.create('comments', { postId: p, authorId: 'ghost', body: 'boo' }));
		var list = settle(CommentService.getCommentsWithAuthors(p)).ok;
		var names = list.map(function (c) { return c.authorName; }).sort();
		expect(names).toEqual(['Ann', 'ghost']);
	});
});
