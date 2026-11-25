(function (window) {
	var angular = window.angular;
	var MAX_BYTES = 512 * 1024;
	var IMAGE_PREFIX = 'data:image/';

	angular.module('funglr.image-posts')
		.constant('IMAGE_POST_MAX_BYTES', MAX_BYTES)
		.factory('ImagePostService', ['DataStore', '$q', 'IMAGE_POST_MAX_BYTES', function (DataStore, $q, maxBytes) {
			function invalid(message) {
				return $q.reject({ code: 'invalid', message: message });
			}

			function readAsDataUrl(file) {
				var deferred = $q.defer();
				var reader = new window.FileReader();
				reader.onload = function () { deferred.resolve(reader.result); };
				reader.onerror = function () { deferred.reject({ code: 'invalid', message: 'the file could not be read' }); };
				reader.readAsDataURL(file);
				return deferred.promise;
			}

			function currentUser() {
				return DataStore.get('session', 'current').then(null, function () {
					return $q.reject({ code: 'unauthenticated', message: 'sign in required' });
				});
			}

			return {
				maxBytes: maxBytes,
				createImagePost: function (post, file) {
					if (!file) {
						return invalid('choose an image file');
					}
					if (file.size > maxBytes) {
						return invalid('the image is larger than 512 KB');
					}
					return currentUser().then(function (session) {
						return readAsDataUrl(file).then(function (dataUrl) {
							if (typeof dataUrl !== 'string' || dataUrl.indexOf(IMAGE_PREFIX) !== 0) {
								return $q.reject({ code: 'invalid', message: 'the file is not an image' });
							}
							return DataStore.create('posts', {
								authorId: session.userId,
								type: 'image',
								title: (post && post.title) || '',
								body: (post && post.body) || '',
								mediaData: dataUrl,
								reblogOf: null
							});
						});
					});
				}
			};
		}]);
}(window));
