describe('sessionConfig route guard', function () {
	var $rootScope, go;

	beforeAll(function () {
		return import('../../data/js/dataModule.js')
			.then(function () { return import('../../auth/js/authModule.js'); })
			.then(function () { return import('../js/sessionModule.js'); })
			.then(function () { return import('../../data/js/localAdapter.js'); })
			.then(function () { return import('../../data/js/dataStore.js'); })
			.then(function () { return import('../../auth/js/authService.js'); })
			.then(function () { return import('../js/sessionConfig.js'); });
	});

	function boot() {
		go = vi.fn();
		angular.mock.module(function ($provide) {
			$provide.value('$state', { go: go });
		});
		angular.mock.module('funglr.session');
		angular.mock.inject(function (_$rootScope_) {
			$rootScope = _$rootScope_;
		});
	}

	function seedStored(userExists) {
		localStorage.clear();
		if (userExists) {
			localStorage.setItem('funglr:users', JSON.stringify({ u1: { id: 'u1', email: 'a@b.c', name: 'A', passwordHash: 'x' } }));
		}
		localStorage.setItem('funglr:session', JSON.stringify({ id: 'current', userId: userExists ? 'u1' : 'ghost', email: 'a@b.c', name: 'A' }));
	}

	function navigate(name) {
		var event = $rootScope.$broadcast('$stateChangeStart', { name: name }, { id: 1 });
		$rootScope.$digest();
		return event;
	}

	beforeEach(function () { localStorage.clear(); });

	it('redirects anonymous navigation to funglr.profile to funglr.login', function () {
		boot();
		$rootScope.$digest();
		var event = navigate('funglr.profile');
		expect(event.defaultPrevented).toBe(true);
		expect(go).toHaveBeenCalledWith('funglr.login');
	});

	it('lets the allowlisted states pass without a session', function () {
		boot();
		$rootScope.$digest();
		['funglr.home', 'funglr.about', 'funglr.contact', 'funglr.login', 'funglr.signup'].forEach(function (name) {
			expect(navigate(name).defaultPrevented).toBe(false);
		});
		expect(go).not.toHaveBeenCalled();
	});

	it('does not allowlist bare home or login', function () {
		boot();
		$rootScope.$digest();
		expect(navigate('home').defaultPrevented).toBe(true);
		expect(navigate('login').defaultPrevented).toBe(true);
	});

	it('removes a restored session whose user is missing and treats it as anonymous', function () {
		seedStored(false);
		boot();
		$rootScope.$digest();
		expect(localStorage.getItem('funglr:session')).toBeNull();
		expect($rootScope.currentUser).toBeFalsy();
		navigate('funglr.profile');
		expect(go).toHaveBeenCalledWith('funglr.login');
	});

	it('restores a session whose user exists and lets guarded states through', function () {
		seedStored(true);
		boot();
		$rootScope.$digest();
		expect($rootScope.currentUser.userId).toBe('u1');
		expect(navigate('funglr.profile').defaultPrevented).toBe(false);
		expect(go).not.toHaveBeenCalled();
	});

	it('resumes the requested state after restore when a navigation races the restore', function () {
		seedStored(true);
		boot();
		var event = navigate('funglr.profile');
		expect(event.defaultPrevented).toBe(true);
		expect(go).toHaveBeenCalledWith('funglr.profile', { id: 1 });
	});

	it('clears currentUser to an empty string when the restore fails with no stored session', function () {
		boot();
		$rootScope.$digest();
		expect($rootScope.currentUser).toBe('');
		navigate('funglr.profile');
		expect(go).toHaveBeenCalledWith('funglr.login');
	});

	it('clears a stale currentUser when the restore fails', function () {
		boot();
		$rootScope.currentUser = { userId: 'stale' };
		$rootScope.$digest();
		expect($rootScope.currentUser).toBe('');
		navigate('funglr.profile');
		expect(go).toHaveBeenCalledWith('funglr.login');
	});

	it('keeps the stored session and treats the user as anonymous when the user lookup fails unexpectedly', function () {
		seedStored(true);
		go = vi.fn();
		angular.mock.module('funglr.session');
		angular.mock.module(function ($provide) {
			$provide.value('$state', { go: go });
			$provide.decorator('LocalAdapter', function ($delegate) {
				var realGet = $delegate.get;
				$delegate.get = function (collection, id) {
					if (collection === 'users') {
						var e = new Error('storage broke');
						e.code = 'invalid';
						throw e;
					}
					return realGet.apply($delegate, arguments);
				};
				return $delegate;
			});
		});
		angular.mock.inject(function (_$rootScope_) { $rootScope = _$rootScope_; });
		$rootScope.currentUser = { userId: 'stale' };
		$rootScope.$digest();
		expect(localStorage.getItem('funglr:session')).not.toBeNull();
		expect($rootScope.currentUser).toBe('');
		var event = navigate('funglr.profile');
		expect(event.defaultPrevented).toBe(true);
		expect(go).toHaveBeenCalledWith('funglr.login');
		expect(go).not.toHaveBeenCalledWith('funglr.profile', expect.anything());
	});

	it('declares funglr.data and funglr.auth as module dependencies', function () {
		var requires = angular.module('funglr.session').requires;
		expect(requires).toContain('funglr.data');
		expect(requires).toContain('funglr.auth');
	});
});
