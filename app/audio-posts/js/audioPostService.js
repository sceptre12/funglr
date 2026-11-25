(function (window) {
	var angular = window.angular;
	var MAX_BYTES = 1048576;
	var DATA_PREFIX = 'data:audio/';

	angular.module('funglr.audio-posts')
		.constant('AUDIO_POST_MAX_BYTES', MAX_BYTES)
		.factory('AudioPostService', ['$q', '$window', 'DataStore', 'AUDIO_POST_MAX_BYTES', function ($q, $window, DataStore, maxBytes) {
			function invalid(message) {
				return $q.reject({ code: 'invalid', message: message });
			}

			function readAsDataUrl(file) {
				var deferred = $q.defer();
				var reader = new $window.FileReader();
				reader.onload = function () { deferred.resolve(reader.result); };
				reader.onerror = function () { deferred.reject({ code: 'invalid', message: 'The file could not be read.' }); };
				reader.readAsDataURL(file);
				return deferred.promise;
			}

			function createAudioPost(file, title) {
				if (!file || typeof file.type !== 'string' || file.type.indexOf('audio/') !== 0) {
					return invalid('Choose an audio file.');
				}
				if (file.size > maxBytes) {
					return invalid('The audio file must be 1 MB or smaller.');
				}
				return DataStore.get('session', 'current').then(function (session) {
					return readAsDataUrl(file).then(function (dataUrl) {
						if (typeof dataUrl !== 'string' || dataUrl.indexOf(DATA_PREFIX) !== 0) {
							return $q.reject({ code: 'invalid', message: 'Choose an audio file.' });
						}
						return DataStore.create('posts', {
							authorId: session.userId,
							type: 'audio',
							title: title || '',
							body: '',
							mediaData: dataUrl,
							reblogOf: null
						});
					});
				}, function (err) {
					return $q.reject(err && err.code === 'not-found' ? { code: 'unauthenticated', message: 'Sign in to post.' } : err);
				});
			}

			return { createAudioPost: createAudioPost, maxBytes: maxBytes };
		}]);
}(window));
