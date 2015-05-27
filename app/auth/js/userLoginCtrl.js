(function (window){
	var angular = window.angular;
	angular.module('funglr.auth')
	.controller('userLoginCtrl', ['AuthFactory', function(AuthFactory){
		var userlogin = this;
		userlogin.user = {
			email: "",
			password: ""
		};
		userlogin.login = function(){
			AuthFactory.login(userlogin.user)
			.then(function(){
				console.log('success');
			}).catch(function(error){
				console.log(error);
			});
		};
	}]);
}(window));