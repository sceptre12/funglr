(function(window) {
    var angular = window.angular;
    angular.module('funglr.user')
        .filter('userData', ['userFactory', function(userFactory) {
            return function(postlist) {
                if (postlist) {
                    var usrp = userFactory.userPosts();
                    usrp.$loaded().then(function() {
                        var list = [];
                        for (var a = 0; a < postlist.length; a++) {
                            list.push(postlist[a]);
                        }
                        return list;
                    });
                }
            };
        }]);
}(window));