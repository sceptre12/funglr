(function (window) {
	var angular = window.angular;
	angular.module('funglr.follow')
		.config(['$stateProvider', function ($stateProvider) {
			$stateProvider.state('funglr.follow', {
				url: '/follow',
				templateUrl: 'app/follow/views/followList.html',
				controller: 'followListCtrl'
			});
		}]);
}(window));
