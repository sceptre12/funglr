(function(window) {
    var angular = window.angular;
    angular.module('funglr')
        .controller('footerCtrl', ['mainService', function(mainService) {
            var footCtrl = this;
            footCtrl.footerListTab = mainService.getHListTab();
            footCtrl.footerLoginTab = mainService.getLoginTab();
        }]);
}(window));
