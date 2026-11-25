(function (window) {
	var angular = window.angular;
	angular.module('funglr.activity')
		.config(['$stateProvider', function ($stateProvider) {
			$stateProvider.state('funglr.activity', {
				url: '/activity',
				templateUrl: 'app/activity/views/activity.html',
				controller: 'activityCtrl'
			});
		}]);
}(window));
