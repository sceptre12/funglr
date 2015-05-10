(function(window) {
    var angular = window.angular;
    angular.module('funglr')
        .controller('navCtrl', ['$state', 'mainService', function($state,mainService) {
            this.navListTab = mainService.getListTab;
            this.navLoginTab = mainService.getLoginTab;
        }]);
}(window));
