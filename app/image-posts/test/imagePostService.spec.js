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
});
