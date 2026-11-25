describe('ImagePostService', function () {
	var ImagePostService, DataStore, $rootScope;

	beforeAll(function () {
		return import('../../data/js/dataModule.js')
			.then(function () { return import('../../data/js/localAdapter.js'); })
			.then(function () { return import('../../data/js/dataStore.js'); })
			.then(function () { return import('../js/image-postsModule.js'); })
			.then(function () { return import('../js/imagePostService.js'); });
	});

	beforeEach(function () {
		angular.mock.module('funglr.image-posts');
		angular.mock.inject(function (_ImagePostService_, _DataStore_, _$rootScope_) {
			ImagePostService = _ImagePostService_;
			DataStore = _DataStore_;
			$rootScope = _$rootScope_;
		});
		window.localStorage.clear();
	});

	function settle(promise) {
		var out = {};
		promise.then(function (v) { out.ok = v; }, function (e) { out.err = e; });
		return out;
	}

	function wait(out) {
		return new Promise(function (resolve, reject) {
			var n = 0;
			(function tick() {
				$rootScope.$digest();
				if (out.ok || out.err) { return resolve(out); }
				if (++n > 200) { return reject(new Error('timeout')); }
				setTimeout(tick, 5);
			}());
		});
	}

	function signIn() {
		DataStore.create('session', { id: 'current', userId: 'u1', email: 'a@b.c', name: 'A', signedInAt: 1 });
		$rootScope.$digest();
	}

	it('rejects a non-image file as invalid', function () {
		signIn();
		var file = new File(['hello'], 'a.txt', { type: 'text/plain' });
		return wait(settle(ImagePostService.createImagePost({ title: 't' }, file))).then(function (out) {
			expect(out.err.code).toBe('invalid');
		});
	});

	it('rejects a file over 512 KB as invalid', function () {
		signIn();
		var file = new File([new Uint8Array(512 * 1024 + 1)], 'big.png', { type: 'image/png' });
		return wait(settle(ImagePostService.createImagePost({ title: 't' }, file))).then(function (out) {
			expect(out.err.code).toBe('invalid');
		});
	});

	it('creates an image post with mediaData for a valid image', function () {
		signIn();
		var file = new File([new Uint8Array([137, 80, 78, 71])], 'a.png', { type: 'image/png' });
		return wait(settle(ImagePostService.createImagePost({ title: 'pic' }, file))).then(function (out) {
			expect(out.err).toBeUndefined();
			expect(out.ok.type).toBe('image');
			expect(out.ok.authorId).toBe('u1');
			expect(out.ok.mediaData.indexOf('data:image/png')).toBe(0);
		});
	});

	it('rejects unauthenticated when no session exists', function () {
		var file = new File([new Uint8Array([1])], 'a.png', { type: 'image/png' });
		return wait(settle(ImagePostService.createImagePost({ title: 't' }, file))).then(function (out) {
			expect(out.err.code).toBe('unauthenticated');
		});
	});
	function post(file, data) {
		return wait(settle(ImagePostService.createImagePost(data, file)));
	}

	it('accepts a file of exactly 512 KB and rejects one byte more with the size message', function () {
		signIn();
		var atLimit = new File([new Uint8Array(512 * 1024)], 'ok.png', { type: 'image/png' });
		var over = new File([new Uint8Array(512 * 1024 + 1)], 'big.png', { type: 'image/png' });
		return post(atLimit, { title: 't' }).then(function (out) {
			expect(out.err).toBeUndefined();
			expect(out.ok.type).toBe('image');
			return post(over, { title: 't' });
		}).then(function (out) {
			expect(out.err.code).toBe('invalid');
			expect(out.err.message).toBe('the image is larger than 512 KB');
		});
	});

	it('exposes the limit as 512 KB through the constant', function () {
		angular.mock.inject(function (IMAGE_POST_MAX_BYTES) {
			expect(IMAGE_POST_MAX_BYTES).toBe(512 * 1024);
		});
	});

	it('rejects a missing file with the choose-a-file message, before any session lookup', function () {
		return post(null, { title: 't' }).then(function (out) {
			expect(out.err).toEqual({ code: 'invalid', message: 'choose an image file' });
		});
	});

	it('rejects unauthenticated with a message', function () {
		var file = new File([new Uint8Array([1])], 'a.png', { type: 'image/png' });
		return post(file, { title: 't' }).then(function (out) {
			expect(out.err).toEqual({ code: 'unauthenticated', message: 'sign in required' });
		});
	});

	it('rejects a non-image with the not-an-image message', function () {
		signIn();
		var file = new File(['hello'], 'a.txt', { type: 'text/plain' });
		return post(file, { title: 't' }).then(function (out) {
			expect(out.err).toEqual({ code: 'invalid', message: 'the file is not an image' });
		});
	});

	it('rejects invalid with a message when the FileReader fails', function () {
		signIn();
		var Real = window.FileReader;
		function Failing() {}
		Failing.prototype.readAsDataURL = function () {
			var self = this;
			setTimeout(function () { self.onerror(); }, 0);
		};
		window.FileReader = Failing;
		var file = new File([new Uint8Array([1])], 'a.png', { type: 'image/png' });
		return post(file, { title: 't' }).then(function (out) {
			expect(out.err).toEqual({ code: 'invalid', message: 'the file could not be read' });
		}).finally(function () { window.FileReader = Real; });
	});

	it('persists the post in the store with title, body, author and reblogOf null', function () {
		signIn();
		var file = new File([new Uint8Array([137, 80, 78, 71])], 'a.png', { type: 'image/png' });
		return post(file, { title: 'pic', body: 'words' }).then(function (out) {
			var stored = JSON.parse(window.localStorage.getItem('funglr:posts'))[out.ok.id];
			expect(stored).toBeTruthy();
			expect(stored.title).toBe('pic');
			expect(stored.body).toBe('words');
			expect(stored.authorId).toBe('u1');
			expect(stored.type).toBe('image');
			expect(stored.reblogOf).toBeNull();
			expect(stored.mediaData.indexOf('data:image/png')).toBe(0);
			expect(out.ok.title).toBe('pic');
			expect(out.ok.body).toBe('words');
		});
	});

	it('defaults title and body to empty strings when the post is missing or partial', function () {
		signIn();
		var file = new File([new Uint8Array([1])], 'a.png', { type: 'image/png' });
		return post(file, undefined).then(function (out) {
			expect(out.err).toBeUndefined();
			expect(out.ok.title).toBe('');
			expect(out.ok.body).toBe('');
			return post(file, { title: 'only' });
		}).then(function (out) {
			expect(out.ok.title).toBe('only');
			expect(out.ok.body).toBe('');
		});
	});
});
