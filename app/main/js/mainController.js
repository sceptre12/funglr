(function (window){
	var angular = window.angular;
	angular.module('funglr')
	.controller('navCtrl', ['$scope', function($scope){
		this.nav.list = [
			{
				home: 'funglr'
			},
			{
				about: 'funglr.about'	
			},
			{
				contact: 'funglr.contact'
			}
		];
		this.nav.listLogin = [
			{
				signup: 'funglr.signup'
			},
			{
				login: 'funglr.login'
			}
		];
	}])
}(window));