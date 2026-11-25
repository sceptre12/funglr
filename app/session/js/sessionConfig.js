(function (window) {
	'use strict';
	var angular = window.angular;
	var PUBLIC_STATES = ['funglr.home', 'funglr.about', 'funglr.contact', 'funglr.login', 'funglr.signup'];

	angular.module('funglr.session')
		.constant('PUBLIC_STATES', PUBLIC_STATES)
		.run(['$rootScope', '$state', '$q', 'AuthFactory', 'DataStore', 'PUBLIC_STATES',
			function ($rootScope, $state, $q, AuthFactory, DataStore, publicStates) {
				// read the stored session; keep it only when its user still exists.
				// A missing user removes the stale session; any other error is anonymous
				// and leaves the stored session alone. Sets $rootScope.currentUser.
				function resolveSession() {
					return AuthFactory.currentUser().then(function (session) {
						return DataStore.get('users', session.userId).then(function () {
							return session;
						}, function (err) {
							if (err && err.code !== 'not-found') { return $q.reject(err); }
							return DataStore.remove('session', 'current').then(function () { return null; });
						});
					}).catch(function () {
						return null;
					}).then(function (session) {
						$rootScope.currentUser = session || '';
						return session;
					});
				}

				// restore after a reload
				resolveSession();

				// one-shot bypass for the $stateChangeStart that our own $state.go re-fires
				var allowed = null;

				// guarded states never trust the cached currentUser: cancel, re-read the
				// stored session, then replay the navigation (once) or go to login
				$rootScope.$on('$stateChangeStart', function (event, toState, toParams) {
					if (publicStates.indexOf(toState.name) !== -1) { return; }
					if (allowed && allowed.name === toState.name) { allowed = null; return; }
					allowed = null;
					event.preventDefault();
					resolveSession().then(function (session) {
						if (session) {
							allowed = { name: toState.name };
							$state.go(toState.name, toParams);
						} else {
							$state.go('funglr.login');
						}
					});
				});
			}]);
}(window));
