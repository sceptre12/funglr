(function(window) {
    var angular = window.angular;
    angular.module('funglr.auth')
        .factory('AuthFactory', ['FUNGLR_DB','$firebaseAuth','$rootScope','$firebaseObject','$state', function(FUNGLR_DB,$firebaseAuth,$rootScope,$firebaseObject, $state) {
            var ref = new Firebase(FUNGLR_DB);
            var auth = $firebaseAuth(ref);
            ref.onAuth(function(userData){
               if(userData){
                   var userdata = new Firebase(FUNGLR_DB + "/users/" + userData.uid);
                   $rootScope.currentUser = $firebaseObject(userdata);                   
               }else{
                   $rootScope.currentUser = "";
               }
            });
            var myObj ={
                login   : function(user){
                    return ref.authWithPassword({
                        "email": user.email,
                        "password": user.password
                    }, function(error, authdata){
                        if(error){
                            console.log(error)
                            $rootScope.loginError = "LOGIN FAILED";
                        }else{
                            console.log(authdata);
                            $state.go('funglr.user.mainscreen.landing');
                        }
                    });
                },
                register: function(user){
                    return auth.$createUser({
                        email       : user.email,
                        password    : user.password
                    }).then(function(regUser){
                        var ref = new Firebase(FUNGLR_DB + '/users');
                        var userInfo = {
                            date        : Firebase.ServerValue.TIMESTAMP,
                            regUser     : regUser.uid,
                            firstname   : user.firstname,
                            lastname    : user.lastname,
                            email       : user.email
                        };
                        ref.child(regUser.uid).set(userInfo);
                    });
                },
                logout : function(){
                    auth.$unauth();
                },
                requireAuth: function(){
                   return auth.$requireAuth();
                }
            };
            return myObj;
        }]);
}(window));
