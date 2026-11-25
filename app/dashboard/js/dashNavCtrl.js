(function (window) {
	var angular = window.angular;
	var modals = {
		Text: { templateUrl: 'app/text-posts/views/textPost.html', controller: 'textPostCtrl' },
		Image: { templateUrl: 'app/image-posts/views/imagePost.html', controller: 'imagePostCtrl' },
		Audio: { templateUrl: 'app/audio-posts/views/audioPost.html', controller: 'audioPostCtrl' }
	};
	angular.module('funglr.dashboard')
		.controller('dashNavCtrl', ['$scope', '$modal', function ($scope, $modal) {
			$scope.nav = [{
				name: 'Text'
			}, {
				name: 'Image'
			}, {
				name: 'Audio'
			}];

			$scope.clicked = function (item) {
				$modal.open({
					templateUrl: modals[item].templateUrl,
					controller: modals[item].controller,
					resolve: {
						clicked: function () {
							return item;
						}
					}
				});
			};
		}]);
}(window));
