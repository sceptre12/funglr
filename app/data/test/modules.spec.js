describe('root module', function () {
	var features = ['data', 'auth', 'text-posts', 'image-posts', 'audio-posts', 'comments', 'likes', 'follow', 'reblog', 'profile', 'dashboard', 'feed', 'activity', 'session'];

	beforeAll(function () {
		return import('../../main/js/mainModule.js')
			.then(function () { return import('../js/dataModule.js'); })
			.then(function () { return import('../../auth/js/authConfig.js'); })
			.then(function () { return Promise.all(['text-posts', 'image-posts', 'audio-posts', 'comments', 'likes', 'follow', 'reblog', 'profile', 'dashboard', 'feed', 'activity', 'session'].map(function (f) { return import('../../' + f + '/js/' + f + 'Module.js'); })); });
	});

	features.forEach(function (f) {
		it('funglr depends on funglr.' + f + ' and that module is declared', function () {
			expect(angular.module('funglr').requires).toContain('funglr.' + f);
			expect(angular.module('funglr.' + f).name).toBe('funglr.' + f);
		});
	});
});
