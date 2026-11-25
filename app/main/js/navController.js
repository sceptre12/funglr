(function(window) {
    var angular = window.angular;
    angular.module('funglr')
        .controller('navCtrl', ['$state', '$rootScope', 'mainService', 'DataStore', function($state, $rootScope, mainService, DataStore) {
            var navCurr = this;
            navCurr.navListTab = mainService.getHListTab();
            navCurr.navLoginTab = mainService.getLoginTab();
            navCurr.userNavTab = mainService.getUListTab();
            navCurr.user = null;

            function loadSession() {
                return DataStore.get('session', 'current').then(function(session) {
                    navCurr.user = session;
                }, function() {
                    navCurr.user = null;
                });
            }

            navCurr.logout = function() {
                return DataStore.remove('session', 'current').then(function() {
                    navCurr.user = null;
                    $state.go('funglr.home');
                });
            };

            loadSession();
            $rootScope.$on('$stateChangeSuccess', loadSession);
        }]);
}(window));
