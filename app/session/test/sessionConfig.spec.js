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
});
