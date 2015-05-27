(function(window) {
    var angular = window.angular;
    angular.module('funglr')
        .controller('navCtrl', ['$state', 'mainService','$rootScope', function($state,mainService, $rootScope) {
                var navCurr = this;
            navCurr.navListTab = mainService.getListTab;
            navCurr.navLoginTab = mainService.getLoginTab;
            navCurr.userIsLogged = $rootScope.currentUser;
            // need help figuring out how to initiate the watch on
            // the above expression
            
        }]);
}(window));
