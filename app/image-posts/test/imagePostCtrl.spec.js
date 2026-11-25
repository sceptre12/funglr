describe('imagePostCtrl', function () {
	var $scope, $q, $rootScope, service, modal;

	beforeAll(function () {
		return import('../../data/js/dataModule.js')
			.then(function () { return import('../js/image-postsModule.js'); })
			.then(function () { return import('../js/imagePostService.js'); })
			.then(function () { return import('../js/imagePostCtrl.js'); });
	});

	beforeEach(function () {
		angular.mock.module('funglr.image-posts');
		angular.mock.inject(function ($controller, _$rootScope_, _$q_) {
			$rootScope = _$rootScope_;
			$q = _$q_;
			$scope = $rootScope.$new();
			service = { createImagePost: vi.fn() };
			modal = { close: vi.fn(), dismiss: vi.fn() };
			$controller('imagePostCtrl', { $scope: $scope, ImagePostService: service, $modalInstance: modal, clicked: 'image' });
		});
	});

	it('starts with the clicked type, an empty post, no file and no error', function () {
		expect($scope.typeOfPost).toBe('image');
		expect($scope.post).toEqual({ title: '', body: '' });
		expect($scope.file).toBeNull();
		expect($scope.error).toBe('');
	});

	it('setFile stores the file, normalises falsy to null and clears the error', function () {
		var f = { name: 'a.png' };
		$scope.error = 'old';
		$scope.setFile(f);
		expect($scope.file).toBe(f);
		expect($scope.error).toBe('');
		$scope.setFile(undefined);
		expect($scope.file).toBeNull();
	});

	it('insertImage passes post then file, closes the modal on success and returns the promise', function () {
		var f = { name: 'a.png' };
		$scope.setFile(f);
		$scope.post.title = 't';
		$scope.error = 'stale';
		service.createImagePost.mockReturnValue($q.when({ id: 1 }));
		var p = $scope.insertImage();
		expect($scope.error).toBe('');
		expect(service.createImagePost).toHaveBeenCalledWith($scope.post, f);
		expect(typeof p.then).toBe('function');
		$rootScope.$digest();
		expect(modal.close).toHaveBeenCalledTimes(1);
		expect($scope.error).toBe('');
	});

	it('insertImage shows the error message and keeps the modal open on failure', function () {
		service.createImagePost.mockReturnValue($q.reject({ code: 'invalid', message: 'bad file' }));
		$scope.insertImage();
		$rootScope.$digest();
		expect($scope.error).toBe('bad file');
		expect(modal.close).not.toHaveBeenCalled();
	});

	it('insertImage falls back to a default message when the error has none', function () {
		service.createImagePost.mockReturnValue($q.reject(undefined));
		$scope.insertImage();
		$rootScope.$digest();
		expect($scope.error).toBe('the image post could not be created');
		service.createImagePost.mockReturnValue($q.reject({ code: 'x' }));
		$scope.insertImage();
		$rootScope.$digest();
		expect($scope.error).toBe('the image post could not be created');
	});

	it('insertPost is an alias of insertImage', function () {
		expect($scope.insertPost).toBe($scope.insertImage);
	});

	it('cancel dismisses the modal with "cancel"', function () {
		$scope.cancel();
		expect(modal.dismiss).toHaveBeenCalledWith('cancel');
		expect(modal.close).not.toHaveBeenCalled();
	});
});
