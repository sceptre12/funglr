describe('AuthFactory guards and edge cases', function () {
	var AuthFactory, DataStore, $rootScope, $q;

	beforeAll(function () {
		return import('../js/authModule.js')
			.then(function () { return import('../../data/js/dataModule.js'); })
			.then(function () { return import('../../data/js/localAdapter.js'); })
			.then(function () { return import('../../data/js/dataStore.js'); })
			.then(function () { return import('../js/authService.js'); });
	});

	beforeEach(function () {
		localStorage.clear();
		angular.mock.module('funglr.auth');
		angular.mock.inject(function (_AuthFactory_, _DataStore_, _$rootScope_, _$q_) {
			AuthFactory = _AuthFactory_;
			DataStore = _DataStore_;
			$rootScope = _$rootScope_;
			$q = _$q_;
		});
	});

	function settle(promise) {
		var out = {};
		promise.then(function (v) { out.ok = v; }, function (e) { out.err = e; });
		$rootScope.$digest();
		return out;
	}

	function users() { return settle(DataStore.list('users')).ok; }

	var SIGNUP_MSG = 'Name, email and password are required.';
	var LOGIN_MSG = 'Email and password are required.';
	var blanks = [undefined, null, '', '   '];

	it('signUp rejects every blank field with the exact message and stores nothing', function () {
		blanks.forEach(function (b) {
			[{ name: b, email: 'a@b.c', password: 'x' },
				{ name: 'A', email: b, password: 'x' },
				{ name: 'A', email: 'a@b.c', password: b }].forEach(function (u) {
				var r = settle(AuthFactory.signUp(u));
				expect(r.err).toEqual({ code: 'invalid', message: SIGNUP_MSG });
			});
		});
		expect(users().length).toBe(0);
	});

	it('signUp with no argument rejects invalid', function () {
		expect(settle(AuthFactory.signUp()).err).toEqual({ code: 'invalid', message: SIGNUP_MSG });
		expect(settle(AuthFactory.signUp(null)).err.code).toBe('invalid');
	});

	it('signUp trims and lower-cases the email and trims the name', function () {
		var r = settle(AuthFactory.signUp({ name: '  Ann  ', email: '  Ann@Example.COM ', password: 'pw1' }));
		expect(r.ok.email).toBe('ann@example.com');
		expect(r.ok.name).toBe('Ann');
		var stored = users()[0];
		expect(stored.email).toBe('ann@example.com');
		expect(stored.name).toBe('Ann');
		var dup = settle(AuthFactory.signUp({ name: 'X', email: 'ann@example.com ', password: 'p' }));
		expect(dup.err.code).toBe('exists');
		expect(dup.err.message).toBe('An account already exists for this email.');
	});

	it('signUp of a different email is not blocked by an existing user', function () {
		expect(settle(AuthFactory.signUp({ name: 'A', email: 'a@b.c', password: 'p' })).ok).toBeTruthy();
		expect(settle(AuthFactory.signUp({ name: 'B', email: 'b@b.c', password: 'p' })).ok.email).toBe('b@b.c');
		expect(users().length).toBe(2);
	});

	it('signUp stores a name that is a string', function () {
		settle(AuthFactory.signUp({ name: 42, email: 'n@b.c', password: 'p' }));
		expect(users()[0].name).toBe('42');
	});

	it('logIn rejects every blank field with the exact message', function () {
		settle(AuthFactory.signUp({ name: 'A', email: 'a@b.c', password: 'pw' }));
		settle(AuthFactory.logOut());
		blanks.forEach(function (b) {
			expect(settle(AuthFactory.logIn({ email: b, password: 'pw' })).err).toEqual({ code: 'invalid', message: LOGIN_MSG });
			expect(settle(AuthFactory.logIn({ email: 'a@b.c', password: b })).err).toEqual({ code: 'invalid', message: LOGIN_MSG });
			expect(settle(AuthFactory.logIn({ email: b, password: b })).err).toEqual({ code: 'invalid', message: LOGIN_MSG });
		});
		expect(settle(AuthFactory.logIn()).err).toEqual({ code: 'invalid', message: LOGIN_MSG });
		expect(settle(DataStore.get('session', 'current')).err.code).toBe('not-found');
	});

	it('logIn wrong credentials use the exact message', function () {
		settle(AuthFactory.signUp({ name: 'A', email: 'a@b.c', password: 'pw' }));
		expect(settle(AuthFactory.logIn({ email: 'a@b.c', password: 'no' })).err)
			.toEqual({ code: 'invalid', message: 'Wrong email or password.' });
	});

	it('logIn trims and lower-cases the email', function () {
		settle(AuthFactory.signUp({ name: 'A', email: 'a@b.c', password: 'pw' }));
		settle(AuthFactory.logOut());
		expect(settle(AuthFactory.logIn({ email: '  A@B.C  ', password: 'pw' })).ok.email).toBe('a@b.c');
	});

	it('a failing session remove (not not-found) is propagated by logIn and signUp', function () {
		settle(AuthFactory.signUp({ name: 'A', email: 'a@b.c', password: 'pw' }));
		var boom = { code: 'boom', message: 'disk' };
		vi.spyOn(DataStore, 'remove').mockImplementation(function () { return $q.reject(boom); });
		expect(settle(AuthFactory.logIn({ email: 'a@b.c', password: 'pw' })).err).toBe(boom);
		expect(settle(AuthFactory.signUp({ name: 'B', email: 'b@b.c', password: 'pw' })).err).toBe(boom);
	});

	it('an undefined remove rejection is propagated as is by logIn', function () {
		settle(AuthFactory.signUp({ name: 'A', email: 'a@b.c', password: 'pw' }));
		vi.spyOn(DataStore, 'remove').mockImplementation(function () { return $q.reject(undefined); });
		var r = settle(AuthFactory.logIn({ email: 'a@b.c', password: 'pw' }));
		expect(r.ok).toBeUndefined();
		expect(r.err).toBeUndefined();
	});

	it('logOut clears currentUser', function () {
		settle(AuthFactory.signUp({ name: 'A', email: 'a@b.c', password: 'pw' }));
		expect($rootScope.currentUser.email).toBe('a@b.c');
		settle(AuthFactory.logOut());
		expect($rootScope.currentUser).toBe('');
	});

	it('logOut propagates a non-not-found error and keeps currentUser', function () {
		settle(AuthFactory.signUp({ name: 'A', email: 'a@b.c', password: 'pw' }));
		var boom = { code: 'boom' };
		vi.spyOn(DataStore, 'remove').mockImplementation(function () { return $q.reject(boom); });
		var r = settle(AuthFactory.logOut());
		expect(r.err).toBe(boom);
		expect($rootScope.currentUser.email).toBe('a@b.c');
	});

	it('logOut propagates an undefined rejection as is', function () {
		vi.spyOn(DataStore, 'remove').mockImplementation(function () { return $q.reject(undefined); });
		var r = settle(AuthFactory.logOut());
		expect(r.ok).toBeUndefined();
		expect(r.err).toBeUndefined();
	});

	it('currentUser unauthenticated message is exact', function () {
		expect(settle(AuthFactory.currentUser()).err).toEqual({ code: 'unauthenticated', message: 'Not signed in.' });
	});

	it('currentUser propagates other errors unchanged', function () {
		var boom = { code: 'boom', message: 'disk' };
		vi.spyOn(DataStore, 'get').mockImplementation(function () { return $q.reject(boom); });
		expect(settle(AuthFactory.currentUser()).err).toBe(boom);
	});

	it('currentUser propagates an undefined rejection as is', function () {
		vi.spyOn(DataStore, 'get').mockImplementation(function () { return $q.reject(undefined); });
		var r = settle(AuthFactory.currentUser());
		expect(r.err).toBeUndefined();
	});

	it('register maps legacy names', function () {
		expect(settle(AuthFactory.register({ firstname: 'Cy', email: 'cy@b.c', password: 'p' })).ok.name).toBe('Cy');
		expect(settle(AuthFactory.register({ name: 'Zed', firstname: 'X', lastname: 'Y', email: 'z@b.c', password: 'p' })).ok.name).toBe('Zed');
		expect(settle(AuthFactory.register({ lastname: 'Lee', email: 'l@b.c', password: 'p' })).ok.name).toBe('Lee');
	});

	it('register with no argument rejects invalid', function () {
		expect(settle(AuthFactory.register()).err.code).toBe('invalid');
	});

	it('the old names are aliases of the new ones', function () {
		expect(AuthFactory.login).toBe(AuthFactory.logIn);
		expect(AuthFactory.logout).toBe(AuthFactory.logOut);
	});
});
