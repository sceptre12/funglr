(function (window) {
	var angular = window.angular;
	angular.module('funglr.image-posts')
		.directive('imageFileInput', function () {
			return {
				restrict: 'A',
				link: function (scope, element) {
					element.on('change', function (event) {
						var files = event.target.files;
						scope.$apply(function () {
							scope.setFile(files && files[0]);
						});
					});
				}
			};
		});
}(window));
