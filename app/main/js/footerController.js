(function(window) {
    var angular = window.angular;
    angular.module('funglr')
        .controller('footerCtrl', ['$state', 'mainService', '$rootScope', function($state, mainService,$rootScope) {
            var footCtrl = this;
            footCtrl.footerListTab = mainService.getListTab;
            footCtrl.footerLoginTab = mainService.getLoginTab;
            
        }]);
}(window));
