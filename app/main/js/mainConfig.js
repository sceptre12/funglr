(function(window) {
    var angular = window.angular;
    angular.module('funglr', ['ui.bootstrap', 'ui.router', 'ngAnimate', 'anim-in-out','funglr.user','funglr.dash','funglr.auth','firebase'])
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
                    controller: 'userLoginCtrl as login',
                    templateUrl: 'app/auth/login.html'
                })
                .state('funglr.signup', {
                    url: '/signup',
                    controller: 'userSignUpCtrl as signUp',
                    templateUrl: 'app/auth/signup.html'
                })
                .state('funglr.about', {
                    url: '/about',
                    templateUrl: 'app/main/views/about.html'
                })
                .state('funglr.contact', {
                    url: '/contact',
                    templateUrl: 'app/main/views/contact.html'
                })
                .state('funglr.user',{
                    abstract: true,
                    url: '/user',
                    templateUrl: 'app/user/profile.html'
                    // resolve:{
                    //     currentAuth: function(Authentication){
                    //         return Authentication.requireAuth();
                    //     }
                    // }
                })
                .state('funglr.user.mainscreen',{
                    abstract: true,
                    url: '',
                    templateUrl: 'app/user/views/mainscreen.html',
                    controller: 'userController as userCtrl'
                })
                .state('funglr.user.mainscreen.landing', {
                     url: '/mainscreen',
                    views: {
                        'profilenav': {
                            templateUrl: 'app/user/views/profilenav.html',
                            controller: 'profileNavCtrl as pNav'
                        },
                        'dashnav': {
                            templateUrl: 'app/user/views/dashnav.html',
                            controller: 'dashNavCtrl as dNav'
                        },
                        'dashmain': {
                            templateUrl: 'app/user/views/userdashmain.html',
                            controller: 'dashMainCtrl as dMain'
                        }
                    }
                })
                .state('funglr.user.dashboard',{
                    abstract: true,
                    url: '',
                    templateUrl: 'app/dashboard/maindash.html',
                    controller: 'dashController as dashCtrl'
                })
                .state('funglr.user.dashboard.landing', {
                     url: '/dashboard',
                    views: {
                        'userItems': {
                            templateUrl: 'app/user/views/userItems.html',
                            controller: 'userItemCtrl as uItem'
                        },
                        'dashselections': {
                            templateUrl: 'app/user/views/dashselections.html',
                            controller: 'dashSelectionCtrl as dSec'
                        },
                        'maincontent': {
                            templateUrl: 'app/user/views/maincontent.html',
                            controller: 'mainContentCtrl as mContent'
                        }
                    }
                });
        }]);
}(window));
