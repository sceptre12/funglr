describe('toolchain', function () {
	beforeEach(function () {
		angular.module('toolchainProbe', []).factory('probe', function () { return { ok: true }; });
		angular.mock.module('toolchainProbe');
	});

	it('loads angular 1.3.15 with angular-mocks', function () {
		expect(angular.version.full).toBe('1.3.15');
		expect(typeof angular.mock.inject).toBe('function');
	});

	it('injects a service through the mock injector', function () {
		angular.mock.inject(function (probe) { expect(probe.ok).toBe(true); });
	});

	it('compiles a template', function () {
		angular.mock.inject(function ($compile, $rootScope) {
			var el = $compile('<p>{{a}}</p>')($rootScope);
			$rootScope.a = 7;
			$rootScope.$digest();
			expect(el.text()).toBe('7');
		});
	});
});
