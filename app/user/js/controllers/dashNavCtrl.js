(function (window){
	var angular = window.angular;
	angular.module('funglr.user')
	.controller('dashNavCtrl', ['userFactory','$rootScope','$modal',function(userFactory,$rootScope,$modal){
		var dashNav = this;
		dashNav.nav = [
				{
					name: 'Text'
				},
				{
					name: 'Image'
				},
				{
					name: 'Audio'
				}
			];
		var modalinstance = $modal.open({
			animation: true,
			templateUrl: '../includes/modal.html',
			controller: 'modalInstance',
			resolve:{
				clicked: function(item){
					return item.name;
				}
			}
		});
		
		dashNav.clicked = function(item){
			return item.name;
		};
		
		dashNav
		dashNav.insertImagePost = function(post){
			userFactory.insertPost.image(post);
		};
		dashNav.insertAudioPost = function(post){
			userFactory.insertPost.audio(post);
		};
	}]);
}(window));