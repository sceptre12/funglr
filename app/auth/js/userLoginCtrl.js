(function (window){
	var angular = window.angular;
	angular.module('funglr.auth')
	.controller('userLoginCtrl', ['AuthFactory','$state','$rootScope', function(AuthFactory,$state,$rootScope){
		var userlogin = this;
		userlogin.user = {
			email: "",
			password: ""
		};
		userlogin.login = function(){
			AuthFactory.login(userlogin.user)
			.then(function(){
				$state.go('funglr.user.mainscreen.landing');
			}).catch(function(error){
				userlogin.error = error;
				console.log(error);
			});
		};
	}]);
}(window));