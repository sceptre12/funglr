describe('auth controllers', function () {
	var $controller, $rootScope, AuthFactory, $state;

	beforeAll(function () {
		return import('../js/authModule.js')
			.then(function () { return import('../../data/js/dataModule.js'); })
			.then(function () { return import('../../data/js/localAdapter.js'); })
			.then(function () { return import('../../data/js/dataStore.js'); })
			.then(function () { return import('../js/authService.js'); })
			.then(function () { return import('../js/userSignUpCtrl.js'); })
			.then(function () { return import('../js/userLoginCtrl.js'); });
	});

	beforeEach(function () {
		localStorage.clear();
		$state = { go: vi.fn() };
		angular.mock.module('funglr.auth', function ($provide) {
			$provide.value('$state', $state);
		});
		angular.mock.inject(function (_$controller_, _$rootScope_, _AuthFactory_) {
			$controller = _$controller_;
			$rootScope = _$rootScope_;
			AuthFactory = _AuthFactory_;
		});
	});

	var ann = { firstname: 'Ann', lastname: 'Lee', email: 'ann@example.com', password: 'pw1' };

	it('valid signup redirects to funglr.home', function () {
		var ctrl = $controller('userSignUpCtrl');
		ctrl.user = angular.copy(ann);
		ctrl.register({ $invalid: false });
		$rootScope.$digest();
		expect($state.go).toHaveBeenCalledWith('funglr.home');
		expect(ctrl.error).toBe('');
	});

	it('invalid signup form shows an error and does not call signUp', function () {
		var spy = vi.spyOn(AuthFactory, 'register');
		var ctrl = $controller('userSignUpCtrl');
		ctrl.register({ $invalid: true });
		$rootScope.$digest();
		expect(spy).not.toHaveBeenCalled();
		expect(ctrl.error).not.toBe('');
		expect($state.go).not.toHaveBeenCalled();
	});

	it('duplicate signup shows the factory error', function () {
		var ctrl = $controller('userSignUpCtrl');
		ctrl.user = angular.copy(ann);
		ctrl.register({ $invalid: false });
		$rootScope.$digest();
		$state.go.mockClear();
		ctrl.register({ $invalid: false });
		$rootScope.$digest();
		expect(ctrl.error).toMatch(/already exists/);
		expect($state.go).not.toHaveBeenCalled();
	});

	it('login redirects on success and shows an error on a wrong password', function () {
		var signup = $controller('userSignUpCtrl');
		signup.user = angular.copy(ann);
		signup.register({ $invalid: false });
		$rootScope.$digest();
		$state.go.mockClear();

		var ctrl = $controller('userLoginCtrl');
		ctrl.user = { email: 'ann@example.com', password: 'bad' };
		ctrl.login({ $invalid: false });
		$rootScope.$digest();
		expect(ctrl.error).toBe('Wrong email or password.');
		expect($state.go).not.toHaveBeenCalled();

		ctrl.user.password = 'pw1';
		ctrl.login({ $invalid: false });
		$rootScope.$digest();
		expect(ctrl.error).toBe('');
		expect($state.go).toHaveBeenCalledWith('funglr.home');
	});

	it('invalid login form shows an error and does not call logIn', function () {
		var spy = vi.spyOn(AuthFactory, 'login');
		var ctrl = $controller('userLoginCtrl');
		ctrl.login({ $invalid: true });
		expect(spy).not.toHaveBeenCalled();
		expect(ctrl.error).not.toBe('');
	});
});
