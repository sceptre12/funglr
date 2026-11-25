// extra behaviour tests for the dashboard controllers (mutation fix, LOCAL-39)
describe('dashboard controllers (mutation kills)', function () {
	var $rootScope, $controller, $q, $sce, DataStore, PostService, CommentService, LikeService, ReblogService;

	function load(path) {
		return function () { return import(path); };
	}

	beforeAll(function () {
		var files = [
			'../../data/js/dataModule.js', '../../text-posts/js/text-postsModule.js', '../../image-posts/js/image-postsModule.js',
			'../../audio-posts/js/audio-postsModule.js', '../../comments/js/commentsModule.js', '../../likes/js/likesModule.js',
			'../../reblog/js/reblogModule.js', '../js/dashboardModule.js', '../../data/js/localAdapter.js', '../../data/js/dataStore.js',
			'../../text-posts/js/postService.js', '../../comments/js/commentService.js', '../../likes/js/likeService.js',
			'../../reblog/js/reblogService.js', '../js/dashController.js', '../js/mainContentCtrl.js', '../js/userItemCtrl.js',
			'../js/dashMainCtrl.js'
		];
		return files.reduce(function (chain, f) { return chain.then(load(f)); }, Promise.resolve());
	});

	beforeEach(function () {
		localStorage.clear();
		angular.mock.module('funglr.dashboard');
		angular.mock.inject(function (_$rootScope_, _$controller_, _$q_, _$sce_, _DataStore_, _PostService_, _CommentService_, _LikeService_, _ReblogService_) {
			$rootScope = _$rootScope_;
			$controller = _$controller_;
			$q = _$q_;
			$sce = _$sce_;
			DataStore = _DataStore_;
			PostService = _PostService_;
			CommentService = _CommentService_;
			LikeService = _LikeService_;
			ReblogService = _ReblogService_;
		});
	});

	function signIn(userId, name) {
		DataStore.create('session', { id: 'current', userId: userId, email: userId + '@x.io', name: name });
		$rootScope.$digest();
	}

	function addPost(authorId, title, createdAt, extra) {
		var rec = Object.assign({ authorId: authorId, type: 'text', title: title, body: '', mediaData: null, reblogOf: null }, extra || {});
		var stored;
		DataStore.create('posts', rec).then(function (p) { stored = p; });
		$rootScope.$digest();
		DataStore.update('posts', stored.id, { createdAt: createdAt });
		$rootScope.$digest();
		return stored;
	}

	function pending() { return $q.defer().promise; }

	describe('dashController', function () {
		it('starts signed out until the session load resolves', function () {
			signIn('u1', 'Ann');
			var ctrl = $controller('dashController');
			expect(ctrl.user).toBe(null);
			expect(ctrl.signedIn).toBe(false);
		});

		it('copies the session email into the user', function () {
			signIn('u1', 'Ann');
			var ctrl = $controller('dashController');
			$rootScope.$digest();
			expect(ctrl.user).toEqual({ id: 'u1', name: 'Ann', email: 'u1@x.io' });
		});

		it('stays signed out with no user when the session load fails', function () {
			var ctrl = $controller('dashController');
			$rootScope.$digest();
			expect(ctrl.signedIn).toBe(false);
			expect(ctrl.user).toBe(null);
		});
	});

	describe('mainContentCtrl', function () {
		it('has the default heading and template before the session resolves', function () {
			signIn('u1', 'Ann');
			var ctrl = $controller('mainContentCtrl');
			expect(ctrl.heading).toBe('Dashboard');
			expect(ctrl.template).toBe('app/dashboard/views/userdashmain.html');
		});

		it('falls back to "Your" when the session has no name', function () {
			signIn('u1', '');
			var ctrl = $controller('mainContentCtrl');
			$rootScope.$digest();
			expect(ctrl.heading).toBe('Your dashboard');
		});
	});

	describe('userItemCtrl', function () {
		it('keeps an already newest-first stored order (does not fall back to stored index order)', function () {
			signIn('u1', 'Ann');
			addPost('u1', 'newest', '2026-03-01T00:00:00.000Z');
			addPost('u1', 'middle', '2026-02-01T00:00:00.000Z');
			addPost('u1', 'oldest', '2026-01-01T00:00:00.000Z');
			var ctrl = $controller('userItemCtrl');
			$rootScope.$digest();
			expect(ctrl.items.map(function (p) { return p.title; })).toEqual(['newest', 'middle', 'oldest']);
		});

		it('orders equal timestamps latest-stored first among distinct ones', function () {
			signIn('u1', 'Ann');
			addPost('u1', 'a', '2026-01-01T00:00:00.000Z');
			addPost('u1', 'b', '2026-01-01T00:00:00.000Z');
			addPost('u1', 'c', '2026-01-01T00:00:00.000Z');
			addPost('u1', 'top', '2026-02-01T00:00:00.000Z');
			var ctrl = $controller('userItemCtrl');
			$rootScope.$digest();
			expect(ctrl.items.map(function (p) { return p.title; })).toEqual(['top', 'c', 'b', 'a']);
		});

		it('orders many posts with repeated timestamps newest first, ties latest-stored first', function () {
			signIn('u1', 'Ann');
			var stamps = ['2026-01-01T00:00:00.000Z', '2026-03-01T00:00:00.000Z', '2026-02-01T00:00:00.000Z'];
			var expected = [];
			for (var i = 0; i < 40; i++) {
				var stamp = stamps[(i * 7) % 3];
				expected.push({ title: 'p' + i, stamp: stamp, index: i });
				addPost('u1', 'p' + i, stamp);
			}
			expected.sort(function (a, b) {
				if (a.stamp === b.stamp) { return b.index - a.index; }
				return a.stamp < b.stamp ? 1 : -1;
			});
			var ctrl = $controller('userItemCtrl');
			$rootScope.$digest();
			expect(ctrl.items.map(function (p) { return p.title; })).toEqual(expected.map(function (e) { return e.title; }));
		});

		it('starts with no items and not loaded', function () {
			signIn('u1', 'Ann');
			var ctrl = $controller('userItemCtrl');
			expect(ctrl.items).toEqual([]);
			expect(ctrl.loaded).toBe(false);
		});

		it('load returns the promise of the load', function () {
			signIn('u1', 'Ann');
			var ctrl = $controller('userItemCtrl');
			var done = false;
			var p = ctrl.load();
			expect(typeof p.then).toBe('function');
			p.then(function () { done = true; });
			expect(done).toBe(false);
			$rootScope.$digest();
			expect(done).toBe(true);
		});

		it('resets items to an empty list when a later load fails', function () {
			signIn('u1', 'Ann');
			addPost('u1', 'x', '2026-01-01T00:00:00.000Z');
			var ctrl = $controller('userItemCtrl');
			$rootScope.$digest();
			expect(ctrl.items.length).toBe(1);
			DataStore.remove('session', 'current');
			$rootScope.$digest();
			ctrl.load();
			$rootScope.$digest();
			expect(ctrl.items).toEqual([]);
			expect(ctrl.loaded).toBe(true);
		});
	});

	describe('dashMainCtrl', function () {
		var scope;

		function make() {
			scope = $rootScope.$new();
			$controller('dashMainCtrl', { $scope: scope });
			$rootScope.$digest();
		}

		function itemFor(post) {
			return scope.postlist.filter(function (p) { return p.key === post.id; })[0];
		}

		it('trusts the audio data URL as a resource url', function () {
			signIn('u1', 'Ann');
			addPost('u1', 'song', '2026-01-01T00:00:00.000Z', { type: 'audio', mediaData: 'data:audio/mpeg;base64,AAAA' });
			make();
			expect($sce.getTrustedResourceUrl(scope.postlist[0].audioSrc)).toBe('data:audio/mpeg;base64,AAAA');
		});

		it('sets no audio source for a non-audio post that has media', function () {
			signIn('u1', 'Ann');
			addPost('u1', 'pic', '2026-01-01T00:00:00.000Z', { type: 'image', mediaData: 'data:image/png;base64,AAAA' });
			make();
			expect(scope.postlist[0].audioSrc).toBeUndefined();
		});

		it('sets no audio source for an audio post without media', function () {
			signIn('u1', 'Ann');
			addPost('u1', 'song', '2026-01-01T00:00:00.000Z', { type: 'audio', mediaData: null });
			make();
			expect(scope.postlist[0].audioSrc).toBeUndefined();
		});

		it('looks a comment author name up from the comment own authorId', function () {
			signIn('u1', 'Ann');
			DataStore.create('users', { id: 'u1', email: 'a@x.io', name: 'Ann', passwordHash: 'h' });
			DataStore.create('users', { id: 'u2', email: 'b@x.io', name: 'Bob', passwordHash: 'h' });
			var post = addPost('u1', 't', '2026-01-01T00:00:00.000Z');
			DataStore.create('comments', { postId: post.id, authorId: 'u2', body: 'hi' });
			$rootScope.$digest();
			make();
			expect(scope.postlist[0].owner).toBe('Ann');
			expect(scope.postlist[0].comments[0].authorName).toBe('Bob');
		});

		it('has no like and zero notes when signed out, even with likes stored', function () {
			var post = addPost('u2', 't', '2026-01-01T00:00:00.000Z');
			DataStore.create('likes', { id: post.id + ':u2', postId: post.id, userId: 'u2' });
			$rootScope.$digest();
			make();
			expect(scope.postlist[0].like).toBe(false);
			expect(scope.postlist[0].notes).toBe(1);
			expect(scope.postlist[0].reblog).toBe(false);
		});

		it('is not liked when the stored likes belong to other users', function () {
			signIn('u1', 'Ann');
			var post = addPost('u2', 't', '2026-01-01T00:00:00.000Z');
			DataStore.create('likes', { id: post.id + ':u2', postId: post.id, userId: 'u2' });
			$rootScope.$digest();
			make();
			expect(itemFor(post).like).toBe(false);
			expect(itemFor(post).notes).toBe(1);
		});

		it('is liked when one of several likes is the session user', function () {
			signIn('u1', 'Ann');
			var post = addPost('u2', 't', '2026-01-01T00:00:00.000Z');
			DataStore.create('likes', { id: post.id + ':u2', postId: post.id, userId: 'u2' });
			DataStore.create('likes', { id: post.id + ':u1', postId: post.id, userId: 'u1' });
			$rootScope.$digest();
			make();
			expect(itemFor(post).like).toBe(true);
			expect(itemFor(post).notes).toBe(2);
		});

		it('does not flag a reblog by another user, or any reblog when signed out', function () {
			signIn('u1', 'Ann');
			var post = addPost('u2', 't', '2026-01-01T00:00:00.000Z');
			addPost('u3', 'rb', '2026-01-02T00:00:00.000Z', { reblogOf: post.id });
			make();
			expect(itemFor(post).reblog).toBe(false);

			DataStore.remove('session', 'current');
			$rootScope.$digest();
			make();
			expect(itemFor(post).reblog).toBe(false);
		});

		it('keeps the list item defaults while the lookups are pending', function () {
			signIn('u1', 'Ann');
			var post = addPost('u1', 't', '2026-01-01T00:00:00.000Z');
			vi.spyOn(CommentService, 'getComments').mockReturnValue(pending());
			vi.spyOn(LikeService, 'getLikes').mockReturnValue(pending());
			vi.spyOn(ReblogService, 'getReblogs').mockReturnValue(pending());
			vi.spyOn(DataStore, 'get').mockImplementation(function (c) {
				return c === 'session' ? $q.when({ id: 'current', userId: 'u1' }) : pending();
			});
			make();
			var item = itemFor(post);
			expect(item.notes).toBe(0);
			expect(item.like).toBe(false);
			expect(item.reblog).toBe(false);
			expect(item.owner).toBe('u1');
			expect(item.comments).toEqual([]);
			expect(item.busy).toBe(false);
			expect(item.key).toBe(post.id);
		});

		it('subComments, deleteComment and deletePost wait for the reload and pass the right arguments', function () {
			signIn('u1', 'Ann');
			make();
			var add = vi.spyOn(CommentService, 'addComment').mockReturnValue($q.when({}));
			var remove = vi.spyOn(CommentService, 'removeComment').mockReturnValue($q.when());
			var removePost = vi.spyOn(PostService, 'removePost').mockReturnValue($q.when());
			var cases = [
				function () { return scope.subComments('post-1', 'hello'); },
				function () { return scope.deleteComment('post-1', 'c-9'); },
				function () { return scope.deletePost('post-1'); }
			];
			cases.forEach(function (run) {
				var gate = $q.defer();
				var list = vi.spyOn(PostService, 'listPosts').mockReturnValue(gate.promise);
				list.mockClear();
				var done = false;
				var p = run();
				expect(typeof p.then).toBe('function');
				p.then(function () { done = true; });
				$rootScope.$digest();
				expect(list).toHaveBeenCalledTimes(1);
				expect(done).toBe(false);
				gate.resolve([]);
				$rootScope.$digest();
				expect(done).toBe(true);
				expect(scope.postlist).toEqual([]);
			});
			expect(add).toHaveBeenCalledWith('post-1', 'hello');
			expect(remove).toHaveBeenCalledWith('c-9');
			expect(removePost).toHaveBeenCalledWith('post-1');
		});

		describe('like and reblog writes', function () {
			var list;
			beforeEach(function () {
				signIn('u1', 'Ann');
				make();
				list = vi.spyOn(PostService, 'listPosts').mockReturnValue($q.when([]));
			});

			it('liked writes once while busy, with the post key', function () {
				var gate = $q.defer();
				var like = vi.spyOn(LikeService, 'likePost').mockReturnValue(gate.promise);
				var unlike = vi.spyOn(LikeService, 'unlikePost').mockReturnValue(gate.promise);
				var post = { key: 'k1', like: false, busy: false };
				scope.liked(post);
				expect(post.busy).toBe(true);
				scope.liked(post);
				expect(like).toHaveBeenCalledTimes(1);
				expect(like).toHaveBeenCalledWith('k1');
				expect(unlike).not.toHaveBeenCalled();
				gate.resolve();
				$rootScope.$digest();
				expect(list).toHaveBeenCalledTimes(1);
			});

			it('liked unlikes a liked post by its key', function () {
				var like = vi.spyOn(LikeService, 'likePost').mockReturnValue($q.when());
				var unlike = vi.spyOn(LikeService, 'unlikePost').mockReturnValue($q.when());
				scope.liked({ key: 'k2', like: true, busy: false });
				expect(unlike).toHaveBeenCalledWith('k2');
				expect(like).not.toHaveBeenCalled();
			});

			it('reblogged writes once while busy, with the post key', function () {
				var gate = $q.defer();
				var reblog = vi.spyOn(ReblogService, 'reblogPost').mockReturnValue(gate.promise);
				var unreblog = vi.spyOn(ReblogService, 'unReblog').mockReturnValue(gate.promise);
				var post = { key: 'k3', reblog: false, busy: false };
				scope.reblogged(post);
				expect(post.busy).toBe(true);
				scope.reblogged(post);
				expect(reblog).toHaveBeenCalledTimes(1);
				expect(reblog).toHaveBeenCalledWith('k3');
				expect(unreblog).not.toHaveBeenCalled();
			});

			it('reblogged unreblogs a reblogged post by its key', function () {
				var reblog = vi.spyOn(ReblogService, 'reblogPost').mockReturnValue($q.when());
				var unreblog = vi.spyOn(ReblogService, 'unReblog').mockReturnValue($q.when());
				scope.reblogged({ key: 'k4', reblog: true, busy: false });
				expect(unreblog).toHaveBeenCalledWith('k4');
				expect(reblog).not.toHaveBeenCalled();
			});

			it('a failed like or reblog write frees the post and does not reload', function () {
				vi.spyOn(LikeService, 'likePost').mockReturnValue($q.reject({ code: 'invalid' }));
				vi.spyOn(ReblogService, 'reblogPost').mockReturnValue($q.reject({ code: 'invalid' }));
				var a = { key: 'k5', like: false, busy: false };
				var b = { key: 'k6', reblog: false, busy: false };
				scope.liked(a);
				scope.reblogged(b);
				$rootScope.$digest();
				expect(a.busy).toBe(false);
				expect(b.busy).toBe(false);
				expect(list).not.toHaveBeenCalled();
			});
		});
	});
});
