(function(window) {
    var angular = window.angular;
    angular.module('funglr')
        .controller('footerCtrl', ['$state', 'mainService', function($state, mainService) {
            this.footerListTab = mainService.getListTab;
            this.footerLoginTab = mainService.getLoginTab;
        }]);
}(window));
