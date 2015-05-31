(function(window) {
	var angular = window.angular;
	angular.module('funglr.user')
		.controller('dashNavCtrl', ['$scope', 'userFactory', '$rootScope', '$modal', function($scope, userFactory, $rootScope, $modal) {

			$scope.nav = [{
				name: 'Text'
			}, {
				name: 'Image'
			}, {
				name: 'Audio'
			}];
			
			$scope.clicked = function(item) {
				var modalInstance = $modal.open({
					templateUrl: 'app/user/includes/modal.html',
					controller: 'ModalInstanceCtrl',
					resolve: {
						clicked: function(){
							return item;
						}
					}
				});
			};
		}]);
}(window));