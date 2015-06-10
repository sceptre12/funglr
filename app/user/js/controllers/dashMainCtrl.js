(function(window) {
	var angular = window.angular;
	angular.module('funglr.user')
		.controller('dashMainCtrl', ['userFactory', '$rootScope', '$scope', function(userFactory, $rootScope, $scope) {
			// var dMainCtrl = this;

			var dashFeed = userFactory.fullDashList().dpost,
				dashref = userFactory.fullDashList().ref,
				rebloglist = userFactory.userReblogged().reblog,
				reblogref = userFactory.userReblogged().ref,
				profileBlogFeed = userFactory.userBlog().upbf,
				userref = userFactory.userBlog().ref;

			// value is an event that reports all changes that happens 
			// underneath this ref
			dashref.on('value', function(data) {
				profileBlogFeed.$loaded().then(function() {
					var objlist = [],
						addToList = function(ListToSearch,info,list) {
							var post = ListToSearch.$getRecord(ListToSearch.$keyAt(a)).postid;
							var item = {};
							
							if(info.hasChild(post)){
								item.content = info.child(post).val();
								item.key = post;
								list.push(item);
							}
						};
					for (var a = 0; a < profileBlogFeed.length; a++) {
						addToList(profileBlogFeed,data,objlist);
					}
					for (var a = 0; a < rebloglist.length; a++) {
						addToList(rebloglist,data,objlist);
					}
					console.log(objlist);
					$scope.postlist = objlist;
					
				});
			});
			$scope.owner = function(postkey){
				return userFactory.whoOwnsPost(postkey);
			}
		}]);
}(window));