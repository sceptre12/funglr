(function(window) {
    var angular = window.angular;
    angular.module('funglr.auth')
        .controller('userSignUpCtrl', ['AuthFactory', '$state', function(AuthFactory, $state) {
            var userRegister = this;
            userRegister.user = {
                firstname: "",
                lastname: "",
                email: "",
                password: "",
                test: ""
            };
            userRegister.register = function() {
                AuthFactory.register(userRegister.user)
                    .then(function() {
                        AuthFactory.login(userRegister.user)
                            .then(function() {
                                $state.go('funglr.user.mainscreen.landing');
                            }).catch(function(error) {
                                userlogin.error = error;
                            });
                    }).catch(function(error) {
                        userlogin.error = error;
                    })
            };

        }])
}(window));
