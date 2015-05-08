(function (window){
	var angular = window.angular;
	angular.module('funglr.auth')
	.factory('AuthFactory',['FUNGLR_DB', function(FUNGLR_DB){
		var ref = new Firebase(FUNGLR_DB);
		// returns the if the user is authenticated or not
		// in the case they aren't authenticated it returns null
		this.user = ref.getAuth();
		var saveNewUser = function(userObj){
			ref.child('users').child(userObj.id).set(userObj);
		};
		this.isLoggedIn = function(){
			return !!ref.getAuth();
		};

		this.loginWithPw= function(usrObj, callback, callbackOnRegister){
			ref.authWithPassword(userObj, function(err,authData){
				if(err){
					console.log('error');
				}else{
					authData.email = userObj.email;
					this.user = authData;
					cb(authData);
					callbackOnRegister && callbackOnRegister(true);
				}
			}.bind(this));
		}

	}]);
}(window));