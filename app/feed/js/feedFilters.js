(function (window) {
	var angular = window.angular;
	angular.module('funglr.feed')
		.filter('userData', [function () {
			return function (postlist) {
				var list = [];
				if (postlist) {
					for (var a = 0; a < postlist.length; a++) {
						list.push(postlist[a]);
					}
				}
				return list;
			};
		}]);
}(window));
