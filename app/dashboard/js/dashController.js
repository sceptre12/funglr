(function (window) {
	var angular = window.angular;
	angular.module('funglr.dashboard')
		.controller('dashController', ['DataStore', function (DataStore) {
			var vm = this;
			vm.user = null;
			vm.signedIn = false;

			// the signed-in user comes from the session document (contracts/data-layer.md)
			DataStore.get('session', 'current').then(function (session) {
				vm.user = { id: session.userId, name: session.name, email: session.email };
				vm.signedIn = true;
			}, function () {
				vm.user = null;
				vm.signedIn = false;
			});
		}]);
}(window));
