(function (window) {
	var angular = window.angular;
	angular.module('funglr.comments')
		.config(['$stateProvider', function ($stateProvider) {
			$stateProvider.state('funglr.comments', {
				url: '/comments',
				templateUrl: 'app/comments/views/comments.html',
				controller: 'commentsCtrl'
			});
		}]);
}(window));
