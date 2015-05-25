(function (window){
	var angular = window.angular;
	angular.module('funglr.auth')
	.controller('userLoginCtrl', ['AuthFactory', function(AuthFactory){
		var userLogin = this;
		// userlogin.login = function(){
		// 	// AuthFactory.login(userlogin.user)
		// 	// .then(function(){
		// 	// 	console.log('success');
		// 	// }).catch(function(error){
		// 	// 	console.log(error);
		// 	// });
		// 	console.log('click');
		// };
		console.log("work login")
	}]);
}(window));