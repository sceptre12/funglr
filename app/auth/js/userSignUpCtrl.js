(function (window){
	var angular = window.angular;
	angular.module('funglr.auth')
	.controller('userSignUpCtrl', ['AuthFactory','$scope', function(AuthFactory){
		var signup = this;
		signup.register = {
			form: {
				email: "",
				password: "",
				passDuplicate: ""
			},
			actions: {
				createUser: function (){
					AuthFactory.createUser(signup.register.form);
				},
				duplicatePassword: function (){
					return signup.register.form.password === signup.register.form.passDuplicate;
				},
				isError: function (){
					if(!AuthFactory.errors){
						signup.register.error = AuthFactory.errors;
					}
					return !AuthFactory.errors;
				},
				isSuccess: function (){
					if(!signup.register.actions.isError()){
						signup.register.success = AuthFactory.success;
						return true;
					}
				}
			},
			error: "",
			success: ""
		}

	}])
}(window));