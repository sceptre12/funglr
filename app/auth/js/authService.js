(function(window) {
    var angular = window.angular;
    angular.module('funglr.auth')
        .factory('AuthFactory', ['FUNGLR_DB', function(FUNGLR_DB) {
            var ref = new Firebase("https://funglr.firebaseio.com");
            return ref;
            // returns the if the user is authenticated or not
            // in the case they aren't authenticated it returns null
            // this.user = ref.getAuth();
            // var saveNewUser = function(userObj) {
            //     ref.child('users').child(userObj.id).set(userObj);
            // };
            // this.isLoggedIn = function() {
            //     return !!ref.getAuth();
            // };

            // this.loginWithPw = function(usrObj, callback, callbackOnRegister) {
            //     ref.authWithPassword(userObj, function(err, authData) {
            //         if (err) {
            //             console.log('error');
            //         } else {
            //             authData.email = userObj.email;
            //             this.user = authData;
            //             cb(authData);
            //             callbackOnRegister && callbackOnRegister(true);
            //         }
            //     }.bind(this));
            // };
            // this.createUser = function(userName, callback) {
            //     ref.createUser(userName, function(error, userData) {
            //         if (error) {
            //             switch (error.code) {
            //                 case "EMAIL_TAKEN":
            //                     console.log("The new user account cannot be created because the email is already in use.");
            //                     break;
            //                 case "INVALID_EMAIL":
            //                     console.log("The specified email is not a valid email.");
            //                     break;
            //                 default:
            //                     console.log("Error creating user:", error);
            //             }
            //         } else {
            //             this.loginWithPw(userName, function(authData){
            //             	saveNewUser(authData);
            //             }, callback)
            //         }
            //     })
            // }.bind(this);
            
        }]);
}(window));
