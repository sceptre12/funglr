(function(window) {
	var angular = window.angular;
	angular.module('funglr.user')
		.controller('dashMainCtrl', ['userFactory', '$rootScope', '$scope', function(userFactory, $rootScope, $scope) {
			

			var dashFeed = userFactory.fullDashList().dpost,
				dashref = userFactory.fullDashList().ref,
				rebloglist = userFactory.userReblogged().reblog,
				reblogref = userFactory.userReblogged().ref,
				profileBlogFeed = userFactory.userBlog().upbf,
				userref = userFactory.userBlog().ref,
				userslist = userFactory.usersList();

			// value is an event that reports all changes that happens underneath this ref
			dashref.on('value', function(data) {
				profileBlogFeed.$loaded().then(function() {
					userslist.on('value', function(usrlist) {
						rebloglist.$loaded().then(function() {
							var objlist = [],
								addToList = function(ListToSearch, info, list, listofusers) {
									var post = ListToSearch.$getRecord(ListToSearch.$keyAt(a)).postid;
									var item = {};
									var commentsobj = userFactory.getComments(post).list;
									commentsobj.$loaded().then(function() {
										if (info.hasChild(post)) {
											item.content = info.child(post).val();
											item.key = post;
											item.comments = commentsobj;
											var pOwner = listofusers.child(item.content.owner).val();
											item.owner = pOwner.firstname + " " + pOwner.lastname;
											list.push(item);
										}
									});
								};
							for (var a = 0; a < profileBlogFeed.length; a++) {
								addToList(profileBlogFeed, data, objlist, usrlist);
							}
							for (var a = 0; a < rebloglist.length; a++) {
								addToList(rebloglist, data, objlist, usrlist);
							}
							console.log(objlist);
							$scope.postlist = objlist;
						});
					});
				});
				$scope.isCurrentUser = function(postkey) {
					var postval = data.child(postkey).val();
					return postval.owner === $rootScope.currentUser.$id;
				};
			});
			$scope.item = "";
			$scope.subComments = function(key, response) {
				console.log(response);
				userFactory.addComments(key, response);
				response = '';
			};
			$scope.deleteComment = function(pkey, ckey) {
				userFactory.deleteComments(pkey, ckey);
			};
			$scope.deletePost = function(postkey) {
				userFactory.removePost(postkey);
			};
			$scope.liked = function(key, clicked) {
				if (clicked) {
					// $scope.lclick = false;
					userFactory.likePost(key);
				}
				else {
					// $scope.lclick = true;
					userFactory.unLikePost(key);
				}
			};
			$scope.reblogged = function(key, clicked) {
				if (clicked) {
					// $scope.rclick = false;
					userFactory.reblogPost(key);
				}
				else {
					// $scope.rclick = true;
					userFactory.unReblog(key);
				}
			};
			// $scope.lclick = true; // Liked clicked
			// $scope.rclick = true; // reblogged clicked
		}]);
}(window));