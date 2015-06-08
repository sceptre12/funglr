(function(window) {
	var angular = window.angular;
	angular.module('funglr.user')
		.controller('dashMainCtrl', ['userFactory', '$rootScope','$scope', function(userFactory, $rootScope,$scope) {
			// var dMainCtrl = this;
			var posts = userFactory.pullPosts();
			var usrposts = userFactory.userPosts();
			posts.$loaded().then(function(){
				usrposts.$loaded().then(function(){
					var objList = {items: []};
					for(var a = 0; a < usrposts.length; a++){
						objList.items.push(posts.$getRecord(usrposts.$getRecord(usrposts.$keyAt(a)).postid));
							console.log(usrposts.$getRecord(usrposts.$keyAt(a)).postid);
							console.log(posts.$getRecord(usrposts.$getRecord(usrposts.$keyAt(a)).postid))
						
					}
					$scope.randomObj = objList.items;
					
				});
			});
			
			
			

		}]);
}(window));