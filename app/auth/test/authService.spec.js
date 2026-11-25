describe('AuthFactory', function () {
	var AuthFactory, DataStore, $rootScope;

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
		angular.mock.inject(function (_AuthFactory_, _DataStore_, _$rootScope_) {
			AuthFactory = _AuthFactory_;
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

	var ann = { name: 'Ann', email: 'ann@example.com', password: 'pw1' };

	it('signUp creates a user and a session', function () {
		var r = settle(AuthFactory.signUp(ann));
		expect(r.ok.email).toBe('ann@example.com');
		expect(r.ok.name).toBe('Ann');
		expect(r.ok.userId).toBeTruthy();
		expect(r.ok.signedInAt).toBeTruthy();
		expect(settle(DataStore.list('users')).ok.length).toBe(1);
		expect(settle(DataStore.get('session', 'current')).ok.userId).toBe(r.ok.userId);
	});

	it('signUp stores no clear-text password', function () {
		settle(AuthFactory.signUp(ann));
		expect(localStorage.getItem('funglr:users')).not.toContain('pw1');
	});

	it('signUp rejects exists on a duplicate email', function () {
		settle(AuthFactory.signUp(ann));
		var r = settle(AuthFactory.signUp({ name: 'Other', email: 'ANN@example.com', password: 'x' }));
		expect(r.err.code).toBe('exists');
		expect(settle(DataStore.list('users')).ok.length).toBe(1);
	});

	it('signUp rejects invalid on an empty field', function () {
		expect(settle(AuthFactory.signUp({ name: '', email: 'a@b.c', password: 'x' })).err.code).toBe('invalid');
		expect(settle(DataStore.list('users')).ok.length).toBe(0);
	});

	it('logIn returns a promise and resolves the session', function () {
		settle(AuthFactory.signUp(ann));
		settle(AuthFactory.logOut());
		var p = AuthFactory.logIn({ email: 'ann@example.com', password: 'pw1' });
		expect(typeof p.then).toBe('function');
		var r = settle(p);
		expect(r.ok.email).toBe('ann@example.com');
		expect($rootScope.currentUser.email).toBe('ann@example.com');
	});

	it('logIn with a wrong password rejects invalid', function () {
		settle(AuthFactory.signUp(ann));
		settle(AuthFactory.logOut());
		expect(settle(AuthFactory.logIn({ email: 'ann@example.com', password: 'bad' })).err.code).toBe('invalid');
		expect(settle(AuthFactory.logIn({ email: 'none@example.com', password: 'pw1' })).err.code).toBe('invalid');
		expect(settle(DataStore.get('session', 'current')).err.code).toBe('not-found');
	});

	it('a second logIn replaces the session', function () {
		settle(AuthFactory.signUp(ann));
		settle(AuthFactory.signUp({ name: 'Bob', email: 'bob@example.com', password: 'pw2' }));
		var r = settle(AuthFactory.logIn({ email: 'ann@example.com', password: 'pw1' }));
		expect(r.ok.name).toBe('Ann');
		expect(settle(DataStore.get('session', 'current')).ok.name).toBe('Ann');
	});

	it('logOut removes the session document', function () {
		settle(AuthFactory.signUp(ann));
		expect(settle(AuthFactory.logOut()).ok).toBe(true);
		expect(settle(DataStore.get('session', 'current')).err.code).toBe('not-found');
		expect(localStorage.getItem('funglr:session')).toBeNull();
	});

	it('logOut without a session still resolves', function () {
		expect(settle(AuthFactory.logOut()).ok).toBe(true);
	});

	it('currentUser resolves the session document', function () {
		settle(AuthFactory.signUp(ann));
		var r = settle(AuthFactory.currentUser());
		expect(r.ok.email).toBe('ann@example.com');
		expect(r.ok.name).toBe('Ann');
		expect(r.ok.userId).toBeTruthy();
	});

	it('currentUser rejects unauthenticated without a session', function () {
		expect(settle(AuthFactory.currentUser()).err.code).toBe('unauthenticated');
	});

	it('register and login keep the old controller names working', function () {
		var r = settle(AuthFactory.register({ firstname: 'Cy', lastname: 'Lee', email: 'cy@example.com', password: 'p' }));
		expect(r.ok.name).toBe('Cy Lee');
		expect(typeof AuthFactory.login({ email: 'cy@example.com', password: 'p' }).then).toBe('function');
	});
});

describe('funglr.auth config', function () {
	var states = {};

	beforeAll(function () {
		angular.module('fakeRouter', []).provider('$state', function () {
			this.state = function (name, def) { states[name] = def; return this; };
			this.$get = function () { return {}; };
		});
		return import('../js/authModule.js').then(function () { return import('../js/authConfig.js'); });
	});

	it('registers the funglr.signup and funglr.login states', function () {
		angular.mock.module('fakeRouter', 'funglr.auth');
		angular.mock.inject(function () {});
		expect(states['funglr.signup'].url).toBe('/signup');
		expect(states['funglr.login'].url).toBe('/login');
	});
});
