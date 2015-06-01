(function (window){
	var angular = window.angular;
	angular.module('funglr.user')
	.controller('dashMainCtrl', ['userFactory','$rootScope',function(userFactory,$rootScope){
		var dMainCtrl = this;
		dMainCtrl.listPost = userFactory.populateUserDash();
	}]);
}(window));