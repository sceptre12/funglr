(function(window) {
    var angular = window.angular;
    angular.module('funglr')
        .factory('mainService', function() {
            var pages = {
                homeList: [{
                    name: 'Home',
                    link: 'funglr.home'
                }, {
                    name: 'About',
                    link: 'funglr.about'
                }, {
                    name: 'Contact',
                    link: 'funglr.contact'
                }],
                listLogin: [{
                    name: 'SignUp',
                    link: 'funglr.signup'
                }, {
                    name: 'Login',
                    link: 'funglr.login'
                }],
                userList: [{
                    name: 'Profile page',
                    link: 'funglr.user.mainscreen.landing'
                }, {
                    name: 'User Dashboard',
                    link: 'funglr.user.dashboard.post.landing'
                }]

            };
            var mainServices = {
                getHListTab: function() {
                    return pages.homeList;
                },
                getUListTab: function(){
                    return pages.userList;
                },
                getLoginTab: function() {
                    return pages.listLogin;
                }

            };


            return mainServices;
        });
}(window));
