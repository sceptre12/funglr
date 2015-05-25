(function (window){
	var angular = window.angular;
	angular.module('funglr.auth')
	.controller('userSignUpCtrl', ['AuthFactory', function(AuthFactory){
		var userRegister = this;

		userRegister.register = function(){
			AuthFactory.register(userRegister.user)
			.then(function(user){
				AuthFactory.login(userRegister.user);
				console.log(user);
			}).catch(function(error){
				console.log(error);
			})
		}
		
		console.log("work register");

	}])
}(window));