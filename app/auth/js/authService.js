(function(window) {
    var angular = window.angular;
    angular.module('funglr.auth')
        .factory('AuthFactory', ['FUNGLR_DB','$firebaseAuth','$rootScope','$firebaseObject',function(FUNGLR_DB,$firebaseAuth,$rootScope,$firebaseObject) {
            var ref = new Firebase(FUNGLR_DB);
            var auth = $firebaseAuth(ref);
            auth.$onAuth(function(userData){
               if(userData){
                   // if user is logged in
                   var ref = new Firebase(FUNGLR_DB + "/users/" + userData.uid);
                   $rootScope.currentUser = $firebaseObject(ref);                   
               }else{
                   $rootScope.currentUser = "";
               }
            });
            var myObj ={
                login   : function(user){
                    return auth.$authWithPassword({
                        email       : user.email,
                        password    : user.password
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
                    ref.getAuth();
                }
            };
            return myObj;

        }]);
}(window));
