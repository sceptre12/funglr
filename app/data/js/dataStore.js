(function () {
	'use strict';

	angular.module('funglr.data').factory('DataStore', ['$q', 'LocalAdapter', function ($q, adapter) {
		function run(fn) {
			var deferred = $q.defer();
			try {
				deferred.resolve(fn());
			} catch (e) {
				if (e && e.code) {
					deferred.reject({ code: e.code, message: e.message });
				} else {
					deferred.reject({ code: 'invalid', message: String(e && e.message || e) });
				}
			}
			return deferred.promise;
		}

		return {
			get: function (collection, id) { return run(function () { return adapter.get(collection, id); }); },
			list: function (collection, filter) { return run(function () { return adapter.list(collection, filter); }); },
			create: function (collection, record) { return run(function () { return adapter.create(collection, record); }); },
			update: function (collection, id, patch) { return run(function () { return adapter.update(collection, id, patch); }); },
			remove: function (collection, id) { return run(function () { return adapter.remove(collection, id); }); },
			reset: function () { return run(function () { return adapter.reset(); }); }
		};
	}]);
})();
