describe('navCtrl', function () {
	var $controller, $rootScope, DataStore;

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
			$provide.value('$state', { go: function () {} });
		});
		angular.mock.inject(function (_$controller_, _$rootScope_, _DataStore_) {
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
});
