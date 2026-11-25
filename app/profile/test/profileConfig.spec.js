describe('profileConfig', function () {
	var states;

	beforeAll(function () {
		return import('../../data/js/dataModule.js')
			.then(function () { return import('../js/profileModule.js'); })
			.then(function () { return import('../js/profileConfig.js'); });
	});

	beforeEach(function () {
		states = {};
		angular.module('stubRouter', []).provider('$state', function () {
			var self = this;
			this.state = function (name, def) {
				states[name] = def;
				return self;
			};
			this.$get = function () { return {}; };
		});
		angular.mock.module('stubRouter');
		angular.mock.module('funglr.profile');
		angular.mock.inject(function () {});
	});

	it('registers the funglr.profile state with url, template and controller', function () {
		expect(states['funglr.profile']).toEqual({
			url: '/profile',
			templateUrl: 'app/profile/views/profile.html',
			controller: 'profileCtrl as profile'
		});
	});
});
