(function(window) {
	var angular = window.angular;
	angular.module('funglr.user')
		.controller('dashMainCtrl', ['userFactory', '$rootScope', function(userFactory, $rootScope) {
			var dMainCtrl = this;
			var info = userFactory.populateUserDash();
			var randomObj = [];
			
			var storage = function(text,image,audio,value){
				var postkey = value.postid;
				angular.forEach(text, function(value,key){
					if(postkey === value.$id){
						randomObj.push(value);
						return true;
					}
				});
				angular.forEach(image, function(value,key){
					if(postkey === value.$id){
						randomObj.push(value);
						return true;
					}
				});
				angular.forEach(audio, function(value,key){
					if(postkey === value.$id){
						randomObj.push(value);
						return true;
					}
				});
			}
			info.blog.$loaded().then(function(){
				info.text.$loaded().then(function(){
					info.image.$loaded().then(function(){
						info.audio.$loaded().then(function(){
							angular.forEach(info.blog,function(value,key){
								storage(info.text,info.image,info.audio,value);
								console.log(randomObj)
							})
						})
					})
				})
			})
		
		}]);
}(window));