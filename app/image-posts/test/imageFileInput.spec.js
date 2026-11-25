describe('imageFileInput directive', function () {
	var $compile, $rootScope, scope, el;

	beforeAll(function () {
		return import('../../data/js/dataModule.js')
			.then(function () { return import('../js/image-postsModule.js'); })
			.then(function () { return import('../js/imageFileInput.js'); });
	});

	beforeEach(function () {
		angular.mock.module('funglr.image-posts');
		angular.mock.inject(function (_$compile_, _$rootScope_) {
			$compile = _$compile_;
			$rootScope = _$rootScope_;
		});
		scope = $rootScope.$new();
		scope.setFile = vi.fn();
		el = $compile('<input type="file" image-file-input>')(scope);
	});

	function fire(type, files) {
		Object.defineProperty(el[0], 'files', { value: files, configurable: true });
		el[0].dispatchEvent(new window.Event(type));
	}

	it('calls setFile with the first selected file on change', function () {
		var a = { name: 'a' }, b = { name: 'b' };
		fire('change', [a, b]);
		expect(scope.setFile).toHaveBeenCalledTimes(1);
		expect(scope.setFile).toHaveBeenCalledWith(a);
	});

	it('runs setFile inside a digest ($apply)', function () {
		var phase;
		scope.setFile = function () { phase = scope.$root.$$phase; };
		fire('change', [{ name: 'a' }]);
		expect(phase).toBe('$apply');
	});

	it('passes a falsy value, without throwing, when there are no files', function () {
		expect(function () { fire('change', null); }).not.toThrow();
		expect(scope.setFile).toHaveBeenCalledTimes(1);
		expect(scope.setFile.mock.calls[0][0]).toBeFalsy();
		fire('change', []);
		expect(scope.setFile.mock.calls[1][0]).toBeUndefined();
	});

	it('ignores events other than change', function () {
		fire('click', [{ name: 'a' }]);
		expect(scope.setFile).not.toHaveBeenCalled();
	});

	it('only matches as an attribute', function () {
		var elem = $compile('<image-file-input></image-file-input>')(scope);
		Object.defineProperty(elem[0], 'files', { value: [{}], configurable: true });
		elem[0].dispatchEvent(new window.Event('change'));
		expect(scope.setFile).not.toHaveBeenCalled();
	});
});
