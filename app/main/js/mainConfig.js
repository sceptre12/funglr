(function (window){
	var angular = window.angular;
	angular.module('funglr',['ui.bootstrap','ui.router','funglr.user','funglr.auth'])
	.config(['$stateProvider','$urlRouterProvider', function($stateProvider,$urlRouterProvider){
		$stateProvider
			.state('funglr',{
				url:'/funglr',
				abstract: true,
				controller: 'mainController as main',
				templateUrl: 'app/main/homepage.html'
			})
			.state('funglr.login',{
				url: '/login',
				controller: 'userLoginCtrl as login',
				templateUrl: 'app/auth/login.html'
			})
			.state('funglr.signup',{
				url: '/signup',
				controller: 'userLoginCtrl as user',
				templateUrl: 'app/auth/signup.html'
			})
			.state('funglr.about',{
				url:'/about',
				templateUrl: 'app/main/views/about.html'
			})
			.state('funglr.contact',{
				url:'/contact',
				templateUrl: 'app/main/views/contact.html'
			});
			$urlRouterProvider.otherwise('/app/home');
	}])
}(window));