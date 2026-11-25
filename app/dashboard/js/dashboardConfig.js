(function (window) {
	var angular = window.angular;
	angular.module('funglr.dashboard')
		.config(['$stateProvider', function ($stateProvider) {
			$stateProvider
				.state('funglr.user.dashboard', {
					abstract: true,
					url: '',
					template: '<ui-view/>'
				})
				.state('funglr.user.dashboard.post', {
					abstract: true,
					url: '/dashboard',
					templateUrl: 'app/dashboard/userdash.html',
					controller: 'dashController as dashCtrl'
				})
				.state('funglr.user.dashboard.post.landing', {
					url: '/post',
					views: {
						'userItems': {
							templateUrl: 'app/dashboard/views/userItems.html',
							controller: 'userItemCtrl as uItem'
						},
						'dashselections': {
							templateUrl: 'app/dashboard/views/dashnav.html',
							controller: 'dashNavCtrl as dSelc'
						},
						'maincontent': {
							templateUrl: 'app/dashboard/views/maincontent.html',
							controller: 'mainContentCtrl as mContent'
						}
					}
				})
				.state('funglr.dashboard', {
					abstract: true,
					url: '/dashboard'
				});
		}]);
}(window));
