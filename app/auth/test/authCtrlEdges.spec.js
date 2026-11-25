describe('auth controllers edges', function () {
	var $controller, $rootScope, $q, AuthFactory, $state;

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
		angular.mock.inject(function (_$controller_, _$rootScope_, _$q_, _AuthFactory_) {
			$controller = _$controller_;
			$rootScope = _$rootScope_;
			$q = _$q_;
			AuthFactory = _AuthFactory_;
		});
	});

	it('userSignUpCtrl starts empty', function () {
		var c = $controller('userSignUpCtrl');
		expect(c.error).toBe('');
		expect(c.user).toEqual({ firstname: '', lastname: '', email: '', password: '' });
	});

	it('userLoginCtrl starts empty', function () {
		var c = $controller('userLoginCtrl');
		expect(c.error).toBe('');
		expect(c.user).toEqual({ email: '', password: '' });
	});

	it('invalid form messages are exact and a missing form is allowed', function () {
		var s = $controller('userSignUpCtrl');
		s.register({ $invalid: true });
		expect(s.error).toBe('Please fill in every field with valid values.');
		var l = $controller('userLoginCtrl');
		l.login({ $invalid: true });
		expect(l.error).toBe('Enter a valid email and password.');

		vi.spyOn(AuthFactory, 'register').mockReturnValue($q.when({}));
		vi.spyOn(AuthFactory, 'login').mockReturnValue($q.when({}));
		s.register();
		l.login();
		$rootScope.$digest();
		expect($state.go).toHaveBeenCalledTimes(2);
	});

	it('submit clears a previous error before calling the factory', function () {
		vi.spyOn(AuthFactory, 'register').mockReturnValue($q.defer().promise);
		vi.spyOn(AuthFactory, 'login').mockReturnValue($q.defer().promise);
		var s = $controller('userSignUpCtrl');
		s.error = 'old';
		s.register({ $invalid: false });
		expect(s.error).toBe('');
		var l = $controller('userLoginCtrl');
		l.error = 'old';
		l.login({ $invalid: false });
		expect(l.error).toBe('');
	});

	it('falls back to a generic message when the rejection has no message', function () {
		var s = $controller('userSignUpCtrl');
		var l = $controller('userLoginCtrl');
		[undefined, null, {}].forEach(function (rej) {
			vi.spyOn(AuthFactory, 'register').mockReturnValue($q.reject(rej));
			vi.spyOn(AuthFactory, 'login').mockReturnValue($q.reject(rej));
			s.register({ $invalid: false });
			l.login({ $invalid: false });
			$rootScope.$digest();
			expect(s.error).toBe('Sign up failed.');
			expect(l.error).toBe('Login failed.');
		});
	});
});
