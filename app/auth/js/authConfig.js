(function (window) {
	'use strict';
	var angular = window.angular;
	angular.module('funglr.auth')
		.config(['$stateProvider', function ($stateProvider) {
			$stateProvider
				.state('funglr.signup', {
					url: '/signup',
					templateUrl: 'app/auth/signup.html',
					controller: 'userSignUpCtrl as signUp'
				})
				.state('funglr.login', {
					url: '/login',
					templateUrl: 'app/auth/login.html',
					controller: 'userLoginCtrl as login'
				});
		}]);
}(window));
