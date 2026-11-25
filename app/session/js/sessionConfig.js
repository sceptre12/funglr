(function (window) {
	'use strict';
	var angular = window.angular;
	var PUBLIC_STATES = ['funglr.home', 'funglr.about', 'funglr.contact', 'funglr.login', 'funglr.signup'];

	angular.module('funglr.session')
		.constant('PUBLIC_STATES', PUBLIC_STATES)
		.run(['$rootScope', '$state', '$q', 'AuthFactory', 'DataStore', 'PUBLIC_STATES',
			function ($rootScope, $state, $q, AuthFactory, DataStore, publicStates) {
				// restore the stored session; keep it only when its user still exists
				var restored = AuthFactory.currentUser().then(function (session) {
					return DataStore.get('users', session.userId).then(function () {
						$rootScope.currentUser = session;
						return session;
					}, function (err) {
						if (err && err.code !== 'not-found') { return $q.reject(err); }
						return DataStore.remove('session', 'current').then(function () { return null; });
					});
				}).catch(function () {
					$rootScope.currentUser = '';
					return null;
				});

				$rootScope.$on('$stateChangeStart', function (event, toState, toParams) {
					if (publicStates.indexOf(toState.name) !== -1 || $rootScope.currentUser) { return; }
					event.preventDefault();
					restored.then(function (session) {
						if (session) { $state.go(toState.name, toParams); } else { $state.go('funglr.login'); }
					});
				});
			}]);
}(window));
