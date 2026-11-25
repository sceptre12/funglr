(function (window) {
	var angular = window.angular;
	angular.module('funglr.reblog')
		.config(['$stateProvider', function ($stateProvider) {
			$stateProvider.state('funglr.reblog', {
				url: '/reblog',
				templateUrl: 'app/reblog/views/reblog.html',
				controller: 'reblogCtrl'
			});
		}]);
}(window));
