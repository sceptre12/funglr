(function(window) {
    var angular = window.angular;
    angular.module('funglr.user')
        .factory('userFactory', ['FUNGLR_DB', '$rootScope', '$firebaseObject', '$firebaseArray', function(FUNGLR_DB, $rootScope, $firebaseObject, $firebaseArray) {
            var currUser = $rootScope.currentUser.regUser,
                profile = "/users/" + currUser + "/profile";
            var userProfile = new Firebase(FUNGLR_DB + Profile),
                userProfileReblog = new Firbase(FUNGLR_DB + profile + "/reblogged"), // list of reblogged posts
                userProfileFollowers = new Firebase(FUNGLR_DB + profile + "/followers"),
                userProfileFollowing = new Firebase(FUNGLR_DB + profile + "/following"),
                userProfileBlogFeed = new Firebase(FUNGLR_DB + profile + "/blogfeed"), // list of all the blogs the user has ether reblogged, created, or is following from someone 
                insertpost = "/dashboard/data/post",
                dashText = new Firebase(FUNGLR_DB + insertpost + "/text"),
                dashImage = new Firebase(FUNGLR_DB + insertpost + "/image"),
                dashAudio = new Firebase(FUNGLR_DB + insertpost + "/audio");

            var postEssentials = function(post, type, newpost) {
                var postkey = newPost.key(),
                    commentPosts = new Firebase(FUNGLR_DB + insertpost + type + postkey + "/comments"),
                    reblogged = new Firebase(FUNGLR_DB + insertpost + type + postkey + "/reblogged"), // list of users that have reblogged
                    liked = new Firebase(FUNGLR_DB + insertpost + type + postkey + "/liked"); // list of people that have liked the post
                if (post.comment) {
                    commentPosts.push({
                        'owner': currUser,
                        'comment': post.comment
                    });
                }
                userProfileBlogFeed.push({
                    "postid": postkey
                });
                reblogged.push({
                    // This was created because a user shouldnt be able to reblog their own post even after
                    // someone else has reblogged it.. Maby later but I don't want to duplicate data
                    'userid': currUser
                });
            };
            var userChoices = {
                whoOwnsPost: function(key) {
                    var determineOwner = function(dashSomething) {
                        return dashSomething.child(key).child("owner");
                    };
                    if (dashText.hasChild(key)) {
                        return determineOwner(dashText);
                    } else if (dashAudio.hasChild(key)) {
                        return determineOwner(dashAudio);
                    } else if (dashImage.hasChild(key)) {
                        return determineOwner(dashImage);
                    } else {
                        return null;
                        console.log("No one owns post")
                    }
                },
                insertPost: {
                    text: function(post) {
                        var newPost = dashText.push({
                            'title': post.title,
                            'subject': post.subject,
                            'body': post.body,
                            'owner': currUser
                        });
                        postEssentials(post, "/text/", newPost);
                    },
                    image: function(post) {
                        var newPost = dashImage.push({
                            'title': post.title,
                            'image': post.body,
                            'owner': currUser
                        });
                        postEssentials(post, "/image/", newPost);
                    },
                    audio: function(post) {
                        var newPost = dashAudio.push({
                            'title': post.title,
                            'audio': post.audio,
                            'owner': currUser
                        });
                        postEssentials(post, "/audio/", newPost);
                    }
                },
                removePost: function(postkey) {
                    // I will need to get the list of people who have reblogged this 
                    // I will need to get the list of people that are currently following this user
                    // delete this id from their lists
                    if (currUser) {

                    }
                },
                addComments: {
                    text: function(key, post) {
                        dashText.child(key).child('comments').push({
                            'owner': currUser,
                            'comment': post.comment
                        });
                    },
                    image: function(key, post) {
                        dashImage.child(key).child('comments').push({
                            'owner': currUser,
                            'comment': post.comment
                        });
                    },
                    audio: function(key, post) {
                        dashAudio.child(key).child('comments').push({
                            'owner': currUser,
                            'comment': post.comment
                        });
                    }
                },
                deleteComments: function(postkey, commentkey) {
                    // Make sure the outside function takes care of determining its the owner
                    // of the comment or blog doing the removal of the comments
                    var removeComment = function(dashSomething) {
                        dashSomething.child(postkey).child('comments').child(commentkey).remove();
                    };
                    if (dashText.hasChild(key)) {
                        removeComment();
                    } else if (dashAudio.hasChild(key)) {
                        removeComment();
                    } else if (dashImage.hasChild(key)) {
                        removeComment();
                    } else {
                        console.log("No post to delete")
                    }
                },
                reblogPost: function(key) {
                    var reblog = function(dashSomething) {
                        /**
							So when a user reblogs a posts the post's Id gets stored under the users list
							of reblogged blogs, the post also gets the id of the user that reblogged that
							post, and finally the data now gets added to that users blog feed
                		*/
                        userProfileReblog.push({
                            'userid': key
                        });
                        userProfileBlogFeed.push({
                            "postid": key
                        })
                        dashSomething.child(key).child('reblogged').push({
                            'userid': currUser
                        });
                    };
                    if (dashText.hasChild(key)) {
                        reblog(dashText);
                    } else if (dashAudio.hasChild(key)) {
                        reblog(dashAudio);
                    } else if (dashImage.hasChild(key)) {
                        reblog(dashImage);
                    } else {
                        console.log("an error occured No child available")
                    }
                },
                unReblog: function(key) {
                    var unreblog = function(dashSomething) {
                        /**
							So when a user reblogs a posts the post's Id gets stored under the users list
							of reblogged blogs, the post also gets the id of the user that reblogged that
							post, and finally the data now gets added to that users blog feed
                		*/
                        userProfileReblog.forEach(function(childData) {
                            if (childData.userid.val() === key) {
                                childData.remove();
                                return true;
                            }
                        });
                        userProfileBlogFeed.forEach(function(childData) {
                            if (childData.postid.val() === key) {
                                childData.remove();
                                return true;
                            }
                        });
                        dashSomething.child(key).child('reblogged').forEach(function(childData) {
                            if (childData.userid.val() === currUser) {
                                childData.remove();
                                return true;
                            }
                        });
                    };
                    if (dashText.hasChild(key)) {
                        unreblog(dashText);
                    } else if (dashAudio.hasChild(key)) {
                        unreblog(dashAudio);
                    } else if (dashImage.hasChild(key)) {
                        unreblog(dashImage);
                    } else {
                        console.log("an error occured No child available")
                    }
                },
                follow: function(userid) {
                    var followingList = new Firebase(FUNGLR_DB + "/users/" + userid + "/followers");
                    var followingBlogFeed = new Firebase(FUNGLR_DB + "/users/" + userid + "/blogfeed");
                    // check if user is already following random person
                    var found = false;
                    var userArrList = $firebaseArray(userProfileBlogFeed);
                    followingList.forEach(function(users) {
                        if (users.val().userid === currUser) {
                            found = true;
                        }                        
                    });
                    followingBlogFeed.forEach(function(data){
                    	userArrList.$add({
                        	userid: users.val().postid
                        });
                    })
                    if (!found) {
                        followingList.push({
                            "userid": currUser
                        });
                    }
                    userProfileFollowing.push({
                        "userid": userid
                    });
                }
            };
            return userChoices;
        }]);
}(window));
