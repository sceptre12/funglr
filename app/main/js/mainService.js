(function(window) {
    var angular = window.angular;
    angular.module('funglr')
        .factory('mainService', function() {
            var pages = {
                list: [{
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
                }]
            };
            var getListTab = function(){
            	return pages.list;
            }
            var getLoginTab = function(){
            	return pages.listLogin;
            }
            return {
            	getListTab: getListTab(),
            	getLoginTab: getLoginTab()
            }
        });
}(window));
