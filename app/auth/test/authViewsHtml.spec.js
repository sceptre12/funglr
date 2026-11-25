describe('auth views', function () {
	var $compile, $rootScope, fs;

	beforeAll(function () {
		return import('node:fs').then(function (m) { fs = m; });
	});

	function html(name) {
		return fs.readFileSync('app/auth/' + name, 'utf8');
	}

	beforeEach(function () {
		angular.mock.module('ng');
		angular.mock.inject(function (_$compile_, _$rootScope_) {
			$compile = _$compile_;
			$rootScope = _$rootScope_;
		});
	});

	function render(name, alias, ctrl) {
		var scope = $rootScope.$new();
		scope[alias] = ctrl;
		var el = $compile('<div>' + html(name) + '</div>')(scope);
		scope.$digest();
		return { el: el, scope: scope };
	}

	[
		{ file: 'login.html', alias: 'login', fn: 'login', form: 'usrlogin' },
		{ file: 'signup.html', alias: 'signUp', fn: 'register', form: 'userRegistration' }
	].forEach(function (v) {
		it(v.file + ' shows the controller error in a text-danger paragraph', function () {
			var ctrl = { error: '', user: {} };
			ctrl[v.fn] = vi.fn();
			var r = render(v.file, v.alias, ctrl);
			var p = r.el[0].querySelector('p.text-danger');
			expect(p).not.toBeNull();
			expect(p.parentNode.classList.contains('ng-hide')).toBe(true);
			ctrl.error = 'Boom happened';
			r.scope.$digest();
			expect(p.textContent).toBe('Boom happened');
			expect(p.parentNode.classList.contains('ng-hide')).toBe(false);
		});

		it(v.file + ' submits the named form to the controller', function () {
			var ctrl = { error: '', user: {} };
			ctrl[v.fn] = vi.fn();
			var r = render(v.file, v.alias, ctrl);
			var form = angular.element(r.el[0].querySelector('form'));
			form.triggerHandler('submit');
			expect(ctrl[v.fn]).toHaveBeenCalledTimes(1);
			var arg = ctrl[v.fn].mock.calls[0][0];
			expect(arg).toBeDefined();
			expect(arg.$name).toBe(v.form);
		});
	});
});
