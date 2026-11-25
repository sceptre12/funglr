(function (window) {
	'use strict';
	var angular = window.angular;
	angular.module('funglr.auth')
		.controller('userSignUpCtrl', ['AuthFactory', '$state', function (AuthFactory, $state) {
			var signUp = this;
			signUp.error = '';
			signUp.user = {
				firstname: '',
				lastname: '',
				email: '',
				password: ''
			};
			signUp.register = function (form) {
				signUp.error = '';
				if (form && form.$invalid) {
					signUp.error = 'Please fill in every field with valid values.';
					return;
				}
				AuthFactory.register(signUp.user)
					.then(function () {
						$state.go('funglr.home');
					})
					.catch(function (error) {
						signUp.error = (error && error.message) || 'Sign up failed.';
					});
			};
		}]);
}(window));
