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
                usersList: function() {
                    return new Firebase(FUNGLR_DB + '/users/');
                },
                insertPost: {
                    post: function(post) {
                        var postEssentials = function(post, newpost) {
                            var postkey = newpost.key(),
                                commentPosts = new Firebase(FUNGLR_DB + insertpost + "/" + postkey + "/comments");

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
                    // only the owner of the post can delete the post

                    var usrbloglist = $firebaseArray(userProfileBlogFeed);
                    var usrebloglist = $firebaseArray(userProfileReblog);
                    usrbloglist.$loaded().then(function() {
                        usrebloglist.$loaded().then(function() {
                            for (var a = 0; a < usrbloglist.length; a++) {
                                var value = usrbloglist.$getRecord(usrbloglist.$keyAt(a));
                                if (value.postid === postkey) {
                                    usrbloglist.$remove(value);
                                }
                            }
                            for(var a = 0; a < usrebloglist.length; a++){
                                var postid = usrebloglist.$getRecord(usrebloglist.$keyAt(a)).postid;
                                if(postid === postkey){
                                    usrebloglist.$remove(a);
                                }
                            }
                            dashPost.child(postkey).remove();
                        });
                    });
                },
                addComments: function(key, post) {
                    var commentPosts = new Firebase(FUNGLR_DB + insertpost + "/" + key + "/comments");
                    commentPosts.push({
                        'owner': currUser,
                        'comment': post,
                        'date': Firebase.ServerValue.TIMESTAMP
                    });
                },
                getComments: function(key) {
                    var reference = new Firebase(FUNGLR_DB + insertpost + "/" + key + "/comments")
                    var comments = {
                        list: $firebaseArray(reference),
                        ref: reference
                    }
                    return comments;
                },
                deleteComments: function(postkey, commentkey) {
                    dashPost.child(postkey).child('comments').child(commentkey).remove();
                },
                reblogPost: function(key) {
                    /**
							So when a user reblogs a posts the post's Id gets stored under the users list
							of reblogged blogs, the post also gets the id of the user that reblogged that
							post, and finally the data now gets added to that users blog feed
                		*/
                    userProfileReblog.push({
                        'postid': key
                    });
                    dashPost.child(key).child('reblogged').push({
                        'userid': currUser,
                        'date': Firebase.ServerValue.TIMESTAMP
                    });
                },
                unReblog: function(key) {

                    /**
							So when a user reblogs a posts the post's Id gets stored under the users list
							of reblogged blogs, the post also gets the id of the user that reblogged that
							post, and finally the data now gets added to that users blog feed
                		*/
                    var reblogList = $firebaseArray(userProfileReblog);
                    var postslist = $firebaseArray(dashPost.child(key).child('reblogged'));
                    reblogList.$loaded().then(function() {
                        postslist.$loaded().then(function() {
                            for (var a = 0; a < reblogList.length; a++) {
                                var postid = reblogList.$getRecord(reblogList.$keyAt(a)).postid;
                                if (postid === key) {
                                    reblogList.$remove(a);
                                }
                            }
                            for (var a = 0; a < postslist.length; a++) {
                                var userid = postslist.$getRecord(postslist.$keyAt(a)).userid;
                                if (userid === currUser) {
                                    postslist.$remove(a);
                                }
                            }
                        });
                    });
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
                    var likedlist = $firebaseArray(liked);
                    likedlist.$loaded().then(function() {
                        for (var a = 0; a < likedlist.length; a++) {
                            var record = likedlist.$getRecord(likedlist.$keyAt(a));
                            console.log(record)
                            if (record.userid === currUser) {
                                liked.child(record.$id).remove();
                            }
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
