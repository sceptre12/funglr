(function(window) {
    var angular = window.angular;
    angular.module('funglr')
        .controller('navCtrl', ['$state', 'mainService','$rootScope','AuthFactory', function($state,mainService, $rootScope,AuthFactory) {
                var navCurr = this;
            navCurr.navListTab = mainService.getHListTab();
            navCurr.navLoginTab = mainService.getLoginTab();
            navCurr.userNavTab = mainService.getUListTab();
            navCurr.userIsLogged = $rootScope.currentUser;
            // need help figuring out how to initiate the watch on
            // the above expression
            navCurr.logout = function(){
                $state.go('funglr.home');
                AuthFactory.logout();
            };
        }]);
}(window));
