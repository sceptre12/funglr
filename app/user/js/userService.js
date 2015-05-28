(function (window){
	var angular = window.angular;
	angular.module('funglr.user')
	.factory('userFactory',['FUNGLR_DB','$rootScope','$firebaseObject','$firebaseArray', function(FUNGLR_DB,$rootScope,$firebaseObject,$firebaseArray){
		var ref = new Firebase('FUNGLR_DB'),
		userProfile = ref.child('users').child('profile');
		var userChoices = {

		}
		return userChoices;
	}])
}(window));