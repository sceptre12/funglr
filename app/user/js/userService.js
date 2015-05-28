(function (window){
	var angular = window.angular;
	angular.module('funglr.user')
	.factory('userFactory',['FUNGLR_DB','$rootScope','$firebaseObject','$firebaseArray', function(FUNGLR_DB,$rootScope,$firebaseObject,$firebaseArray){
		var userProfile = new Firebase(FUNGLR_DB +"/users/" + "/profile"),
			insertpost =  "/dashboard/data/post/",
			dashText = new Firebase(FUNGLR_DB + insertpost + "/text"),
			dashImage = new Firebase(FUNGLR_DB + insertpost + "/image"),
			dashAudio = new Firebase(FUNGLR_DB + insertpost + "/audio");
			
		var userChoices = {
			insertPost: {
				text: function(post){
					var newPost = dashText.push({
						'title'		: post.title,
						'subject'	: post.subject,
						'body'		: post.body,
						'owner'		: $rootScope.currentUser.regUser
					});
					var postkey = newPost.key();
					var commentPosts = new Firebase(FUNGLR_DB + insertpost + "/text/" + postkey + "/comments");
					var reblogged = new Firebase(FUNGLR_DB + insertpost + "/text/" + postkey + "/subscribers");
					commentPosts.push({
						'owner'		: $rootScope.currentUser.regUser,
						'comment'	: post.comment
					});
					reblogged.push({
						// This was created becuase a user shouldnt be able to reblog their own post even after
						// Someone else has reblogged it.. Maby later but I don't want to duplicate data
						'userid' 	: $rootScope.currentUser.regUser
					});
				},
				image: function(post){
					var newPost = dashImage.push({
						'title'		: post.title,
						'image'		: post.body,
						'owner'		: $rootScope.currentUser.regUser
					});
					var postkey = newPost.key();
					var commentPosts = new Firebase(FUNGLR_DB + insertpost + "/image/" + postkey + "/comments")
					commentPosts.push({
						'owner'		: $rootScope.currentUser.regUser,
						'comment'	: post.comment
					});
				},
				audio: function(post){
					var newPost = dashAudio.push({
						'title'		: post.title,
						'audio'		: post.audio,
						'owner'		: $rootScope.currentUser.regUser
					});
					var postkey = newPost.key();
					var commentPosts = new Firebase(FUNGLR_DB + insertpost + "/audio/" + postkey + "/comments")
					commentPosts.push({
						'owner'		: $rootScope.currentUser.regUser,
						'comment'	: post.comment
					});
				}
			},
			addComments: {
				text: function(key,post){
					dashText.child(key).child('comments').push({
						'owner'		: $rootScope.currentUser,
						'comment'	: post.comment
					});
				},
				image: function(key,post){
					dashImage.child(key).child('comments').push({
						'owner'		: $rootScope.currentUser,
						'comment'	: post.comment
					});
				},
				audio: function(key,post){
					dashAudio.child(key).child('comments').push({
						'owner'		: $rootScope.currentUser,
						'comment'	: post.comment
					});
				}
			}
		};
		return userChoices;
	}]);
}(window));