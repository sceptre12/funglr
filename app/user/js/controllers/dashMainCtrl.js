(function(window) {
	var angular = window.angular;
	angular.module('funglr.user')
		.controller('dashMainCtrl', ['userFactory', '$rootScope', function(userFactory, $rootScope) {
			var dMainCtrl = this;
			var info = userFactory.populateUserDash();
			var randomObj = [];

			var storage = function(text, image, audio, value, listStore) {
				var postkey = value.postid;
				angular.forEach(info.text, function(curr, key) {
					if (postkey === curr.$id) {
						listStore.push(curr);
						return true;
					}
				});
				angular.forEach(info.image, function(curr, key) {
					if (postkey === curr.$id) {
						listStore.push(curr);
						return true;
					}
				});
				angular.forEach(info.audio, function(curr, key) {
					if (postkey === curr.$id) {
						listStore.push(curr);
						return true;
					}
				});
			};
			info.blog.$loaded().then(function() {
				info.text.$loaded().then(function() {
					info.image.$loaded().then(function() {
						info.audio.$loaded().then(function() {
							angular.forEach(info.blog, function(value, key) {
								storage(info.text,info.image,info.audio,value,this);
							}, randomObj);
							dMainCtrl.listPost = randomObj;
						});
					});
				});
			});

		}]);
}(window));