(function (window) {
	var angular = window.angular;
	angular.module('funglr.profile')
		.config(['$stateProvider', function ($stateProvider) {
			$stateProvider
				.state('funglr.user', {
					abstract: true,
					url: '/user',
					templateUrl: 'app/profile/profile.html'
				})
				.state('funglr.user.mainscreen', {
					abstract: true,
					url: '',
					templateUrl: 'app/dashboard/views/mainscreen.html',
					controller: 'userController as userCtrl'
				})
				.state('funglr.user.mainscreen.landing', {
					url: '/mainscreen',
					views: {
						'profilenav': {
							templateUrl: 'app/profile/views/profilenav.html',
							controller: 'profileNavCtrl as pNav'
						},
						'dashnav': {
							templateUrl: 'app/dashboard/views/dashnav.html',
							controller: 'dashNavCtrl as dNav'
						},
						'dashmain': {
							templateUrl: 'app/dashboard/views/userdashmain.html',
							controller: 'dashMainCtrl as dMain'
						}
					}
				});
		}]);
}(window));
