(function (window){
	var angular = window.angular;
	angular.module('funglr.auth',[])
	.constant('FUNGLR_DB',{
		url: 'https://funglr.firebaseio.com'
	});	
}(window));