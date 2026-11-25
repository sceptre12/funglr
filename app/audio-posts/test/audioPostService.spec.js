describe('AudioPostService', function () {
	var Service, DataStore, $rootScope, readResult;

	function FakeReader() {}
	FakeReader.prototype.readAsDataURL = function () {
		this.result = readResult;
		this.onload();
	};

	beforeAll(function () {
		return import('../../data/js/dataModule.js')
			.then(function () { return import('../../data/js/localAdapter.js'); })
			.then(function () { return import('../../data/js/dataStore.js'); })
			.then(function () { return import('../js/audio-postsModule.js'); })
			.then(function () { return import('../js/audioPostService.js'); })
			.then(function () { return import('../js/audioPostCtrl.js'); });
	});

	beforeEach(function () {
		localStorage.clear();
		readResult = 'data:audio/mpeg;base64,AAAA';
		angular.mock.module('funglr.audio-posts', function ($provide) {
			$provide.value('$window', { FileReader: FakeReader });
		});
		angular.mock.inject(function (_AudioPostService_, _DataStore_, _$rootScope_) {
			Service = _AudioPostService_;
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

	function signIn() {
		settle(DataStore.create('session', { id: 'current', userId: 'u1', email: 'a@b.c', name: 'A' }));
	}

	it('rejects a non-audio file as invalid', function () {
		signIn();
		var r = settle(Service.createAudioPost({ type: 'image/png', size: 10 }, 't'));
		expect(r.err.code).toBe('invalid');
		expect(settle(DataStore.list('posts')).ok.length).toBe(0);
	});

	it('rejects a file over 1 MB as invalid', function () {
		signIn();
		var r = settle(Service.createAudioPost({ type: 'audio/mpeg', size: 1048577 }, 't'));
		expect(r.err.code).toBe('invalid');
		expect(settle(DataStore.list('posts')).ok.length).toBe(0);
	});

	it('rejects when the read result is not a data:audio/ URL', function () {
		signIn();
		readResult = 'data:image/png;base64,AAAA';
		var r = settle(Service.createAudioPost({ type: 'audio/mpeg', size: 10 }, 't'));
		expect(r.err.code).toBe('invalid');
		expect(settle(DataStore.list('posts')).ok.length).toBe(0);
	});

	it('rejects unauthenticated without a session', function () {
		var r = settle(Service.createAudioPost({ type: 'audio/mpeg', size: 10 }, 't'));
		expect(r.err.code).toBe('unauthenticated');
	});

	it('creates a post of type audio for a valid file', function () {
		signIn();
		var r = settle(Service.createAudioPost({ type: 'audio/mpeg', size: 1048576 }, 'song'));
		expect(r.ok.type).toBe('audio');
		expect(r.ok.authorId).toBe('u1');
		expect(r.ok.title).toBe('song');
		expect(r.ok.mediaData.indexOf('data:audio/')).toBe(0);
		expect(settle(DataStore.list('posts', { type: 'audio' })).ok.length).toBe(1);
	});

	it('controller surfaces the error message and closes on success', function () {
		var closed = false;
		var scope = $rootScope.$new();
		angular.mock.inject(function ($controller) {
			$controller('audioPostCtrl', { $scope: scope, $modalInstance: { close: function () { closed = true; }, dismiss: function () {} }, clicked: 'Audio' });
		});
		scope.setFile({ type: 'text/plain', size: 1 });
		scope.insertPost();
		$rootScope.$digest();
		expect(scope.error).toBeTruthy();
		expect(closed).toBe(false);
		signIn();
		scope.setFile({ type: 'audio/ogg', size: 1 });
		scope.insertPost();
		$rootScope.$digest();
		expect(closed).toBe(true);
	});
});
