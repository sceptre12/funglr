(function (window) {
	var angular = window.angular;
	angular.module('funglr.dashboard')
		.controller('mainContentCtrl', ['DataStore', function (DataStore) {
			var vm = this;
			vm.heading = 'Dashboard';
			vm.template = 'app/dashboard/views/userdashmain.html';

			DataStore.get('session', 'current').then(function (session) {
				vm.heading = (session.name || 'Your') + ' dashboard';
			});
		}]);
}(window));
