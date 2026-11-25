describe('followConfig', function () {
	var states;

	beforeAll(function () {
		return import('../../auth/js/authModule.js')
			.then(function () { return import('../js/followModule.js'); })
			.then(function () { return import('../../data/js/dataModule.js'); })
			.then(function () { return import('../js/followConfig.js'); });
	});

	beforeEach(function () {
		states = {};
		angular.mock.module(function ($provide) {
			$provide.provider('$state', {
				state: function (name, def) { states[name] = def; return this; },
				$get: function () { return {}; }
			});
		});
		angular.mock.module('funglr.follow');
		angular.mock.inject();
	});

	it('registers only the funglr.follow state', function () {
		expect(Object.keys(states)).toEqual(['funglr.follow']);
		expect(states['funglr.follow']).toEqual({
			url: '/follow',
			templateUrl: 'app/follow/views/followList.html',
			controller: 'followListCtrl'
		});
	});
});
