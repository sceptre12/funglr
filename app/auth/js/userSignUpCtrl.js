(function (window){
	var angular = window.angular;
	angular.module('funglr.auth')
	.controller('userSignUpCtrl', ['AuthFactory','$state', function(AuthFactory,$state){
		var userRegister = this;
		userRegister.user = {
			firstname 	: "",
			lastname	: "",
			email		: "",
			password	: "",
			test		: ""
		};
		userRegister.register = function(){
			AuthFactory.register(userRegister.user)
			.then(function(user){
				AuthFactory.login(userRegister.user);
			}).catch(function(error){
				console.log(error);
			})
		};

	}])
}(window));