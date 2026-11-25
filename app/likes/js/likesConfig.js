(function (window) {
	var angular = window.angular;
	angular.module('funglr.likes')
		.config(['$stateProvider', function ($stateProvider) {
			$stateProvider.state('funglr.likes', {
				url: '/likes',
				templateUrl: 'app/likes/views/likes.html',
				controller: 'likesCtrl'
			});
		}]);
}(window));
