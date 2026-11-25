describe('footerCtrl', function () {
	var $controller, mainService;

	beforeAll(function () {
		return import('../../data/js/dataModule.js')
			.then(function () {
				angular.module('funglr', ['funglr.data']);
				return import('../js/mainService.js');
			})
			.then(function () { return import('../js/footerController.js'); });
	});

	beforeEach(function () {
		angular.mock.module('funglr');
		angular.mock.inject(function (_$controller_, _mainService_) {
			$controller = _$controller_;
			mainService = _mainService_;
		});
	});

	it('wires the footer list tab from the home list', function () {
		var footer = $controller('footerCtrl');
		expect(footer.footerListTab).toBe(mainService.getHListTab());
		expect(footer.footerListTab.map(function (t) { return t.link; }))
			.toEqual(['funglr.home', 'funglr.about', 'funglr.contact']);
	});

	it('wires the footer login tab from the login list', function () {
		var footer = $controller('footerCtrl');
		expect(footer.footerLoginTab).toBe(mainService.getLoginTab());
		expect(footer.footerLoginTab.map(function (t) { return t.link; }))
			.toEqual(['funglr.signup', 'funglr.login']);
	});
});
