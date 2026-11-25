describe('dashboard', function () {
	var $rootScope, $controller, DataStore, $q;

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
		angular.mock.inject(function (_$rootScope_, _$controller_, _DataStore_, _$q_) {
			$rootScope = _$rootScope_;
			$controller = _$controller_;
			DataStore = _DataStore_;
			$q = _$q_;
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

	describe('userItemCtrl', function () {
		it('lists the signed-in user posts newest first and leaves other authors out', function () {
			signIn('u1', 'Ann');
			addPost('u1', 'old', '2026-01-01T00:00:00.000Z');
			addPost('u2', 'other', '2026-03-01T00:00:00.000Z');
			addPost('u1', 'new', '2026-02-01T00:00:00.000Z');
			var ctrl = $controller('userItemCtrl');
			$rootScope.$digest();
			expect(ctrl.items.map(function (p) { return p.title; })).toEqual(['new', 'old']);
			expect(ctrl.loaded).toBe(true);
		});

		it('puts the later stored post first when createdAt is equal', function () {
			signIn('u1', 'Ann');
			addPost('u1', 'first', '2026-01-01T00:00:00.000Z');
			addPost('u1', 'second', '2026-01-01T00:00:00.000Z');
			var ctrl = $controller('userItemCtrl');
			$rootScope.$digest();
			expect(ctrl.items.map(function (p) { return p.title; })).toEqual(['second', 'first']);
		});

		it('lists nothing without a session', function () {
			addPost('u1', 'x', '2026-01-01T00:00:00.000Z');
			var ctrl = $controller('userItemCtrl');
			$rootScope.$digest();
			expect(ctrl.items).toEqual([]);
			expect(ctrl.loaded).toBe(true);
		});
	});

	describe('dashController and mainContentCtrl', function () {
		it('dashController exposes the session user', function () {
			signIn('u1', 'Ann');
			var ctrl = $controller('dashController');
			$rootScope.$digest();
			expect(ctrl.signedIn).toBe(true);
			expect(ctrl.user.id).toBe('u1');
			expect(ctrl.user.name).toBe('Ann');
		});

		it('dashController is signed out without a session', function () {
			var ctrl = $controller('dashController');
			$rootScope.$digest();
			expect(ctrl.signedIn).toBe(false);
			expect(ctrl.user).toBe(null);
		});

		it('mainContentCtrl names the dashboard after the user', function () {
			signIn('u1', 'Ann');
			var ctrl = $controller('mainContentCtrl');
			$rootScope.$digest();
			expect(ctrl.heading).toBe('Ann dashboard');
		});
	});

	describe('dashMainCtrl', function () {
		var scope;

		function make() {
			scope = $rootScope.$new();
			$controller('dashMainCtrl', { $scope: scope });
			$rootScope.$digest();
		}

		it('trusts an audio data URL so the audio element can play it', function () {
			signIn('u1', 'Ann');
			addPost('u1', 'song', '2026-01-01T00:00:00.000Z', { type: 'audio', mediaData: 'data:audio/mpeg;base64,AAAA' });
			make();
			var item = scope.postlist[0];
			expect(item.audioSrc).toBeDefined();
			expect(item.content.mediaData).toBe('data:audio/mpeg;base64,AAAA');
		});

		it('shows comment author names and the post owner name', function () {
			signIn('u1', 'Ann');
			DataStore.create('users', { id: 'u1', email: 'a@x.io', name: 'Ann', passwordHash: 'h' });
			var post = addPost('u1', 't', '2026-01-01T00:00:00.000Z');
			DataStore.create('comments', { postId: post.id, authorId: 'u1', body: 'hi' });
			$rootScope.$digest();
			make();
			expect(scope.postlist[0].owner).toBe('Ann');
			expect(scope.postlist[0].comments[0].authorName).toBe('Ann');
		});

		it('reads like and reblog flags from the stored records', function () {
			signIn('u1', 'Ann');
			var post = addPost('u1', 't', '2026-01-01T00:00:00.000Z');
			DataStore.create('likes', { id: post.id + ':u1', postId: post.id, userId: 'u1' });
			addPost('u1', 't', '2026-01-02T00:00:00.000Z', { reblogOf: post.id });
			$rootScope.$digest();
			make();
			var item = scope.postlist.filter(function (p) { return p.key === post.id; })[0];
			expect(item.like).toBe(true);
			expect(item.reblog).toBe(true);
			expect(item.notes).toBe(1);
		});

		it('reblogs a post once even when clicked twice before the write finishes', function () {
			signIn('u1', 'Ann');
			var post = addPost('u1', 't', '2026-01-01T00:00:00.000Z');
			make();
			scope.reblogged(scope.postlist[0]);
			scope.reblogged(scope.postlist[0]);
			$rootScope.$digest();
			var reblogs = [];
			DataStore.list('posts', { reblogOf: post.id }).then(function (l) { reblogs = l; });
			$rootScope.$digest();
			expect(reblogs.length).toBe(1);
			expect(scope.postlist.filter(function (p) { return p.key === post.id; })[0].reblog).toBe(true);
		});

		it('only the author sees the delete button state', function () {
			signIn('u1', 'Ann');
			var mine = addPost('u1', 'm', '2026-01-01T00:00:00.000Z');
			var theirs = addPost('u2', 't', '2026-01-02T00:00:00.000Z');
			make();
			expect(scope.isCurrentUser(mine.id)).toBe(true);
			expect(scope.isCurrentUser(theirs.id)).toBe(false);
		});
	});
});
