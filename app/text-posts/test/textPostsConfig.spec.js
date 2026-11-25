describe('text-postsConfig', function () {
	var states;

	beforeAll(function () {
		return import('../js/text-postsModule.js')
			.then(function () { return import('../../data/js/dataModule.js'); })
			.then(function () { return import('../js/text-postsConfig.js'); });
	});

	beforeEach(function () {
		states = {};
		angular.mock.module(function ($provide) {
			$provide.provider('$state', {
				state: function (name, def) { states[name] = def; return this; },
				$get: function () { return {}; }
			});
		});
		angular.mock.module('funglr.text-posts');
		angular.mock.inject();
	});

	it('registers only the funglr.textposts state with its url, template and controller', function () {
		expect(Object.keys(states)).toEqual(['funglr.textposts']);
		expect(states['funglr.textposts']).toEqual({
			url: '/text-posts',
			templateUrl: 'app/text-posts/views/postList.html',
			controller: 'postListCtrl'
		});
	});
});
