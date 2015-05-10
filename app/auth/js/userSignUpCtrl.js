(function (window){
	var angular = window.angular;
	angular.module('funglr.auth')
	.controller('userSignUpCtrl', ['AuthFactory', function(AuthFactory){
		this.user.createAccount = AuthFactory.getRef;

	}])
}(window));