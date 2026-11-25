describe('navCtrl', function () {
	var $controller, $rootScope, DataStore, mainService, goCalls;

	beforeAll(function () {
		return import('../../data/js/dataModule.js')
			.then(function () { return import('../../data/js/localAdapter.js'); })
			.then(function () { return import('../../data/js/dataStore.js'); })
			.then(function () {
				angular.module('funglr', ['funglr.data']);
				return import('../js/mainService.js');
			})
			.then(function () { return import('../js/navController.js'); });
	});

	beforeEach(function () {
		localStorage.clear();
		angular.mock.module('funglr', function ($provide) {
			goCalls = [];
			$provide.value('$state', { go: function (name) { goCalls.push(name); } });
		});
		angular.mock.inject(function (_$controller_, _$rootScope_, _DataStore_, _mainService_) {
			mainService = _mainService_;
			$controller = _$controller_;
			$rootScope = _$rootScope_;
			DataStore = _DataStore_;
		});
	});

	function makeNav() {
		var nav = $controller('navCtrl');
		$rootScope.$digest();
		return nav;
	}

	it('with a seeded session the nav shows the user name', function () {
		DataStore.create('session', { id: 'current', userId: 'u1', email: 'a@b.c', name: 'Ada' });
		var nav = makeNav();
		expect(nav.user.name).toBe('Ada');
	});

	it('with no session the nav shows the sign-in links', function () {
		var nav = makeNav();
		expect(nav.user).toBeNull();
		expect(nav.navLoginTab.length).toBe(2);
	});

	it('logout removes the session', function () {
		DataStore.create('session', { id: 'current', userId: 'u1', email: 'a@b.c', name: 'Ada' });
		var nav = makeNav();
		nav.logout();
		$rootScope.$digest();
		expect(nav.user).toBeNull();
		expect(localStorage.getItem('funglr:session')).toBeNull();
	});

	it('wires the list, login and user tabs from mainService', function () {
		var nav = makeNav();
		expect(nav.navListTab).toBe(mainService.getHListTab());
		expect(nav.navLoginTab).toBe(mainService.getLoginTab());
		expect(nav.userNavTab).toBe(mainService.getUListTab());
		expect(nav.navListTab.length).toBe(3);
		expect(nav.userNavTab.length).toBe(2);
	});

	it('starts with user null before the session read resolves', function () {
		var nav = $controller('navCtrl');
		expect(nav.user).toBeNull();
	});

	it('logout resolves after the session is removed', function () {
		DataStore.create('session', { id: 'current', userId: 'u1', email: 'a@b.c', name: 'Ada' });
		var nav = makeNav();
		var done = false;
		var result = nav.logout();
		expect(result).toBeDefined();
		expect(typeof result.then).toBe('function');
		result.then(function () { done = true; });
		$rootScope.$digest();
		expect(done).toBe(true);
	});

	it('logout clears the user and goes to funglr.home', function () {
		DataStore.create('session', { id: 'current', userId: 'u1', email: 'a@b.c', name: 'Ada' });
		var nav = makeNav();
		expect(nav.user).not.toBeNull();
		nav.logout();
		$rootScope.$digest();
		expect(nav.user).toBeNull();
		expect(goCalls).toEqual(['funglr.home']);
	});

	it('a failed session read sets user to null', function () {
		DataStore.create('session', { id: 'current', userId: 'u1', email: 'a@b.c', name: 'Ada' });
		var nav = makeNav();
		expect(nav.user.name).toBe('Ada');
		localStorage.clear();
		$rootScope.$broadcast('$stateChangeSuccess');
		$rootScope.$digest();
		expect(nav.user).toBeNull();
	});

	it('reloads the session on $stateChangeSuccess', function () {
		var nav = makeNav();
		expect(nav.user).toBeNull();
		DataStore.create('session', { id: 'current', userId: 'u1', email: 'a@b.c', name: 'Ada' });
		$rootScope.$broadcast('$stateChangeSuccess');
		$rootScope.$digest();
		expect(nav.user.name).toBe('Ada');
	});

	it('does not reload the session on $stateChangeStart', function () {
		var nav = makeNav();
		DataStore.create('session', { id: 'current', userId: 'u1', email: 'a@b.c', name: 'Ada' });
		$rootScope.$broadcast('$stateChangeStart');
		$rootScope.$digest();
		expect(nav.user).toBeNull();
	});
});
