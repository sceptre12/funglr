(function (window) {
	'use strict';
	var angular = window.angular;
	angular.module('funglr.auth')
		.controller('userLoginCtrl', ['AuthFactory', '$state', function (AuthFactory, $state) {
			var userlogin = this;
			userlogin.error = '';
			userlogin.user = {
				email: '',
				password: ''
			};
			userlogin.login = function (form) {
				userlogin.error = '';
				if (form && form.$invalid) {
					userlogin.error = 'Enter a valid email and password.';
					return;
				}
				AuthFactory.login(userlogin.user)
					.then(function () {
						$state.go('funglr.home');
					})
					.catch(function (error) {
						userlogin.error = (error && error.message) || 'Login failed.';
					});
			};
		}]);
}(window));
