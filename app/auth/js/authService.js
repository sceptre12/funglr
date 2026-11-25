(function (window) {
	'use strict';
	var angular = window.angular;
	angular.module('funglr.auth')
		.factory('AuthFactory', ['$q', '$rootScope', 'DataStore', function ($q, $rootScope, DataStore) {
			var SESSION = 'session';
			var SESSION_ID = 'current';

			function fail(code, message) {
				return $q.reject({ code: code, message: message });
			}

			// demo-grade hash (contracts/data-layer.md: no real secret handling)
			function hash(text) {
				var h = 5381;
				var s = String(text);
				for (var i = 0; i < s.length; i++) {
					h = ((h * 33) ^ s.charCodeAt(i)) >>> 0;
				}
				return 'h' + h.toString(16);
			}

			function isBlank(value) {
				return value === undefined || value === null || String(value).trim() === '';
			}

			function sessionFor(user) {
				return {
					id: SESSION_ID,
					userId: user.id,
					email: user.email,
					name: user.name,
					signedInAt: new Date().toISOString()
				};
			}

			function startSession(user) {
				return DataStore.remove(SESSION, SESSION_ID)
					.catch(function (err) {
						if (!err || err.code !== 'not-found') { return $q.reject(err); }
					})
					.then(function () { return DataStore.create(SESSION, sessionFor(user)); })
					.then(function (session) {
						$rootScope.currentUser = session;
						return session;
					});
			}

			function signUp(user) {
				user = user || {};
				if (isBlank(user.name) || isBlank(user.email) || isBlank(user.password)) {
					return fail('invalid', 'Name, email and password are required.');
				}
				var email = String(user.email).trim().toLowerCase();
				return DataStore.list('users', { email: email }).then(function (found) {
					if (found.length) { return fail('exists', 'An account already exists for this email.'); }
					return DataStore.create('users', {
						email: email,
						name: String(user.name).trim(),
						passwordHash: hash(user.password)
					});
				}).then(startSession);
			}

			function logIn(user) {
				user = user || {};
				if (isBlank(user.email) || isBlank(user.password)) {
					return fail('invalid', 'Email and password are required.');
				}
				var email = String(user.email).trim().toLowerCase();
				return DataStore.list('users', { email: email }).then(function (found) {
					if (!found.length || found[0].passwordHash !== hash(user.password)) {
						return fail('invalid', 'Wrong email or password.');
					}
					return startSession(found[0]);
				});
			}

			function logOut() {
				return DataStore.remove(SESSION, SESSION_ID)
					.catch(function (err) {
						if (!err || err.code !== 'not-found') { return $q.reject(err); }
					})
					.then(function () {
						$rootScope.currentUser = '';
						return true;
					});
			}

			function currentUser() {
				return DataStore.get(SESSION, SESSION_ID).catch(function (err) {
					if (err && err.code === 'not-found') { return fail('unauthenticated', 'Not signed in.'); }
					return $q.reject(err);
				});
			}

			return {
				signUp: signUp,
				logIn: logIn,
				logOut: logOut,
				currentUser: currentUser,
				// names the existing controllers and navCtrl still call
				register: function (user) {
					user = user || {};
					var name = user.name || [user.firstname, user.lastname].filter(Boolean).join(' ');
					return signUp({ name: name, email: user.email, password: user.password });
				},
				login: logIn,
				logout: logOut
			};
		}]);
}(window));
