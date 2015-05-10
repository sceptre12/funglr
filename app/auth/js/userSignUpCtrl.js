(function (window){
	var angular = window.angular;
	angular.module('funglr.auth')
	.controller('userSignUpCtrl', ['AuthFactory', function(AuthFactory){
		console.log(AuthFactory);

	}])
}(window));