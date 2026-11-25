(function(window) {
    var angular = window.angular;
    angular.module('funglr')
        .run(["$rootScope", '$state', function($rootScope, $state) {
            // $rootScope.$on("$stateChangeError", ['event','toState','toParams','fromState','fromParams','error',function(event, toState, toParams, fromState, fromParams, error) {
            //     console.log(error)
            //     if (error === "AUTH_REQUIRED") {
            //         console.log(error)
            //         $rootScope.RouteChangeError = error;
            //         $state.go('funglr.login');
            //     }
            // }]);
            $rootScope.$on("$stateChangeStart",function(event, toState, toParams, fromState, fromParams){
                $rootScope.toState = toState;
                $rootScope.toParams = toParams;
                // console.log(event);
                // console.log(toState);
                // console.log(toParams);
                // console.log(fromState);
                // console.log(fromParams);
            });
        }])
        .config(['$stateProvider', '$urlRouterProvider', function($stateProvider, $urlRouterProvider) {
            $urlRouterProvider.otherwise('/home');
            $stateProvider
                .state('funglr', {
                    abstract: true,
                    views: {
                        header: {
                            templateUrl: "app/main/include/nav.html",
                            controller: "navCtrl as nav"
                        },
                        '': {
                            templateUrl: "app/main/homeSkeleton.html"
                        },
                        footer: {
                            templateUrl: "app/main/include/footer.html",
                            controller: "footerCtrl as footer"
                        }
                    }
                })
                .state('funglr.home', {
                    url: '/home',
                    templateUrl: "app/main/views/main.html",
                    controller: "mainCtrl as main"
                })
                .state('funglr.about', {
                    url: '/about',
                    templateUrl: 'app/main/views/about.html'
                })
                .state('funglr.contact', {
                    url: '/contact',
                    templateUrl: 'app/main/views/contact.html'
                });
        }]);
}(window));
