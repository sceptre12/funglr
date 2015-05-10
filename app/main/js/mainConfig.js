(function(window) {
    var angular = window.angular;
    angular.module('funglr', ['ui.bootstrap', 'ui.router', 'ngAnimate', 'anim-in-out','funglr.user', 'funglr.auth'])
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
                .state('funglr.login', {
                    url: '/login',
                    controllers: 'userLoginCtrl as login',
                    templateUrl: 'app/auth/login.html'
                })
                .state('funglr.signup', {
                    url: '/signup',
                    controller: 'userSignUpCtrl as signup',
                    templateUrl: 'app/auth/signup.html'
                })
                .state('funglr.about', {
                    url: '/about',
                    templateUrl: 'app/main/views/about.html'
                })
                .state('funglr.contact', {
                    url: '/contact',
                    templateUrl: 'app/main/views/contact.html'
                });

        }])
}(window));
