(function (window) {
	var angular = window.angular;
	angular.module('funglr', [
		'ui.bootstrap', 'ui.router', 'ngAnimate', 'anim-in-out', 'naif.base64', 'base64',
		'funglr.data', 'funglr.auth', 'funglr.text-posts', 'funglr.image-posts', 'funglr.audio-posts',
		'funglr.comments', 'funglr.likes', 'funglr.follow', 'funglr.reblog', 'funglr.profile',
		'funglr.dashboard', 'funglr.feed', 'funglr.activity', 'funglr.session'
	]);
}(window));
