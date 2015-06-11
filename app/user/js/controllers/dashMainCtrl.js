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
				userref = userFactory.userBlog().ref,
				userslist = userFactory.usersList();

			// value is an event that reports all changes that happens 
			// underneath this ref
			dashref.on('value', function(data) {
				profileBlogFeed.$loaded().then(function() {
					userslist.on('value', function(usrlist) {
						var objlist = [],
							addToList = function(ListToSearch, info, list, listofusers) {
								var post = ListToSearch.$getRecord(ListToSearch.$keyAt(a)).postid;
								var item = {};

								if (info.hasChild(post)) {
									item.content = info.child(post).val();
									item.key = post;
									var pOwner = listofusers.child(item.content.owner).val();
									item.owner = pOwner.firstname + " " + pOwner.lastname;
									list.push(item);
								}
							};
						for (var a = 0; a < profileBlogFeed.length; a++) {
							addToList(profileBlogFeed, data, objlist, usrlist);
						}
						for (var a = 0; a < rebloglist.length; a++) {
							addToList(rebloglist, data, objlist, usrlist);
						}
						console.log(objlist);
						$scope.postlist = objlist;
					})
				});
			});
		}]);
}(window));