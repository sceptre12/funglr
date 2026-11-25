(function (window) {
	var angular = window.angular;
	angular.module('funglr.text-posts')
		.config(['$stateProvider', function ($stateProvider) {
			$stateProvider.state('funglr.textposts', {
				url: '/text-posts',
				templateUrl: 'app/text-posts/views/postList.html',
				controller: 'postListCtrl'
			});
		}]);
}(window));
