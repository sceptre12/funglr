(function (window) {
	var angular = window.angular;
	angular.module('funglr.feed')
		.config(['$stateProvider', function ($stateProvider) {
			$stateProvider.state('funglr.feed', {
				url: '/feed',
				templateUrl: 'app/feed/views/feed.html',
				controller: 'feedCtrl'
			});
		}]);
}(window));
