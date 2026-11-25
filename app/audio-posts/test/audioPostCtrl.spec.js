describe('audioPostCtrl', function () {
	var $rootScope, $controller, $q, AudioPostService, modal, scope;

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
		angular.mock.module('funglr.audio-posts');
		angular.mock.inject(function (_$rootScope_, _$controller_, _AudioPostService_, _$q_) {
			$q = _$q_;
			$rootScope = _$rootScope_;
			$controller = _$controller_;
			AudioPostService = _AudioPostService_;
		});
		modal = { close: vi.fn(), dismiss: vi.fn() };
		scope = $rootScope.$new();
		$controller('audioPostCtrl', { $scope: scope, $modalInstance: modal, clicked: 'Audio' });
	});

	function reject(err) {
		return $q.reject(err);
	}

	it('starts with the clicked type, an empty title, no file and no error', function () {
		expect(scope.typeOfPost).toBe('Audio');
		expect(scope.post).toEqual({ title: '' });
		expect(scope.file).toBe(null);
		expect(scope.error).toBe('');
	});

	it('setFile stores the file and normalises a falsy value to null', function () {
		var f = { type: 'audio/mpeg', size: 1 };
		scope.setFile(f);
		expect(scope.file).toBe(f);
		scope.setFile(undefined);
		expect(scope.file).toBe(null);
		scope.setFile(0);
		expect(scope.file).toBe(null);
	});

	it('insertPost passes the file and title, returns the promise and closes on success', function () {
		var f = { type: 'audio/mpeg', size: 1 };
		var spy = vi.spyOn(AudioPostService, 'createAudioPost').mockReturnValue($q.when({ id: 'p1' }));
		scope.setFile(f);
		scope.post.title = 'song';
		var ret = scope.insertPost();
		expect(typeof ret.then).toBe('function');
		expect(spy).toHaveBeenCalledWith(f, 'song');
		$rootScope.$digest();
		expect(modal.close).toHaveBeenCalledTimes(1);
		expect(scope.error).toBe('');
	});

	it('insertPost clears a previous error before a new attempt', function () {
		scope.error = 'old';
		vi.spyOn(AudioPostService, 'createAudioPost').mockReturnValue($q.defer().promise);
		scope.insertPost();
		expect(scope.error).toBe('');
	});

	it('insertPost shows the error message and does not close on failure', function () {
		vi.spyOn(AudioPostService, 'createAudioPost').mockReturnValue(reject({ code: 'invalid', message: 'Choose an audio file.' }));
		scope.insertPost();
		$rootScope.$digest();
		expect(scope.error).toBe('Choose an audio file.');
		expect(modal.close).not.toHaveBeenCalled();
	});

	it('insertPost falls back to a generic message when the error has none', function () {
		var fallback = 'The post could not be created.';
		vi.spyOn(AudioPostService, 'createAudioPost').mockReturnValue(reject({ code: 'x' }));
		scope.insertPost();
		$rootScope.$digest();
		expect(scope.error).toBe(fallback);
		vi.spyOn(AudioPostService, 'createAudioPost').mockReturnValue(reject(undefined));
		scope.insertPost();
		$rootScope.$digest();
		expect(scope.error).toBe(fallback);
	});

	it('cancel dismisses the modal with cancel', function () {
		scope.cancel();
		expect(modal.dismiss).toHaveBeenCalledWith('cancel');
		expect(modal.close).not.toHaveBeenCalled();
	});
});
