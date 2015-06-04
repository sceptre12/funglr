(function(window) {
	var angular = window.angular;
	angular.module('funglr.user')
		.controller('dashMainCtrl', ['userFactory', '$rootScope','$scope', function(userFactory, $rootScope,$scope) {
			// var dMainCtrl = this;
			var posts = userFactory.pullPosts();
			posts.$loaded().then(function(){
				$scope.randomObj = posts;
			});
			
			
			

		}]);
}(window));