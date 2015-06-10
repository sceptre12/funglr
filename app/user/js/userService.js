(function(window) {
    var angular = window.angular;
    angular.module('funglr.user')
        .factory('userFactory', ['FUNGLR_DB', '$rootScope', '$firebaseObject', '$firebaseArray', function(FUNGLR_DB, $rootScope, $firebaseObject, $firebaseArray) {
            console.log($rootScope.currentUser.regUser)
            var currUser = $rootScope.currentUser.regUser,
                profile = "/users/" + currUser + "/profile";
            var userProfile = new Firebase(FUNGLR_DB + profile),
                userProfileReblog = new Firebase(FUNGLR_DB + profile + "/reblogged"), // list of reblogged posts
                userProfileFollowers = new Firebase(FUNGLR_DB + profile + "/followers"), // list of followers
                userProfileFollowing = new Firebase(FUNGLR_DB + profile + "/following"), // list of all those who user is following
                userProfileBlogFeed = new Firebase(FUNGLR_DB + profile + "/blogfeed"), // list of all the blogs the user has ether reblogged, created, or is following from someone 
                insertpost = "/dashboard/data/post",
                dashPost = new Firebase(FUNGLR_DB + insertpost);
            console.log(currUser);


            var userChoices = {
                whoOwnsPost: function(key) {
                        return dashPost.child(key).child("owner");
                },
                insertPost: {
                    post: function(post) {
                        var postEssentials = function(post, newpost) {
                            var postkey = newpost.key(),
                                commentPosts = new Firebase(FUNGLR_DB + insertpost + "/" + postkey + "/comments"),
                                reblogged = new Firebase(FUNGLR_DB + insertpost + "/" + postkey + "/reblogged"); // list of users that have reblogged
                                
                            if (post.comment) {
                                commentPosts.push({
                                    'owner': currUser,
                                    'comment': post.comment,
                                    'date': Firebase.ServerValue.TIMESTAMP
                                });
                            }
                            userProfileBlogFeed.push({
                                "postid": postkey,
                                'date': Firebase.ServerValue.TIMESTAMP
                            });
                            reblogged.push({
                                // This was created because a user shouldnt be able to reblog their own post even after
                                // someone else has reblogged it.. Maby later but I don't want to duplicate data
                                'userid': currUser,
                                'date': Firebase.ServerValue.TIMESTAMP
                            });
                        };
                        var newPost = dashPost.push({
                            'title': post.title,
                            'subject': post.subject,
                            'body': post.body,
                            'owner': currUser,
                            'date': Firebase.ServerValue.TIMESTAMP,
                            'type': post.type,
                            'image': post.image,
                            'audio': post.audio
                        });
                        postEssentials(post, newPost);
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
                    post: function(key, post) {
                        dashPost.child(key).child('comments').push({
                            'owner': currUser,
                            'comment': post.comment,
                            'date': Firebase.ServerValue.TIMESTAMP
                        });
                    }
                },
                deleteComments: function(postkey, commentkey) {
                    // Make sure the outside function takes care of determining its the owner
                    // of the comment or blog doing the removal of the comments
                    var removeComment = function(dashSomething) {
                        dashSomething.child(postkey).child('comments').child(commentkey).remove();
                    };
                    if (dashPost.hasChild(key)) {
                        removeComment(dashPost);
                    }
                    else {
                        console.log("No post to delete");
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
                        dashSomething.child(key).child('reblogged').push({
                            'userid': currUser,
                            'date': Firebase.ServerValue.TIMESTAMP
                        });
                        userProfileBlogFeed.push({
                            "postid": key,
                            'date': Firebase.ServerValue.TIMESTAMP
                        });

                    };
                    reblog(dashPost);

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
                                childData.key().remove();
                                return true;
                            }
                        });
                        userProfileBlogFeed.forEach(function(childData) {
                            if (childData.postid.val() === key) {
                                childData.key().remove();
                                return true;
                            }
                        });
                        dashSomething.child(key).child('reblogged').forEach(function(childData) {
                            if (childData.userid.val() === currUser) {
                                childData.key().remove();
                                return true;
                            }
                        });
                    };
                    unreblog(dashPost);
                },
                follow: function(userid) {
                    var follow = new Firebase(FUNGLR_DB + "/users/" + userid + "/followers");
                    var allposts = $firebaseArray(dashPost);
                    // adds the userid of the user to the 'following' list
                    userProfileFollowing.push({
                        'userid': userid,
                        'date': Firebase.ServerValue.TIMESTAMP
                    });
                    // adds the current user to the userid's followers list
                    follow.push({
                        'userid': currUser,
                        'date': Firebase.ServerValue.TIMESTAMP
                    });
                    dashPost.on('value', function(data) {
                        for (var a = 0; a < allposts.length; a++) {
                            var currentPost = allposts.$getRecord(allposts.$keyAt(a)).postid;
                            var currentOwner = data.child(currentPost).val().owner;
                            if (currentOwner === userid) {
                                userProfileBlogFeed.push({
                                    'postid': allposts.$keyAt(a),
                                    'date': Firebase.ServerValue.TIMESTAMP
                                });
                            }
                        }
                    });


                },
                unfollow: function(userid) {

                },
                likePost: function(key) {
                    var liked = new Firebase(FUNGLR_DB + insertpost + "/" + key + "/liked"); // list of people that have liked the post
                        liked.push({
                            'userid': currUser
                        });
                },
                unLikePost: function(key) {
                    var liked = new Firebase(FUNGLR_DB + insertpost + "/" + key + "/liked"); // list of people that have liked the post
                    
                        liked.forEach(function(liked) {
                            if (liked.val().userid === currUser) {
                                liked.key().remove();
                            }
                        });
                },
                fullDashList: function() {
                    var posts = {
                        dpost: $firebaseArray(dashPost),
                        ref: dashPost
                    };
                    return posts;
                },
                userBlog: function() {
                    var posts = {
                        upbf: $firebaseArray(userProfileBlogFeed),
                        ref: userProfileBlogFeed
                    };
                    return posts;
                },
                userReblogged: function() {
                    var posts = {
                        reblog: $firebaseArray(userProfileReblog),
                        ref: userProfileReblog
                    };
                    return posts;
                }

            };
            return userChoices;
        }]);
}(window));
