(function(window) {
	var angular = window.angular;
	angular.module('funglr.user')
		.controller('dashMainCtrl', ['userFactory', '$rootScope', '$scope', function(userFactory, $rootScope, $scope) {
			// var dMainCtrl = this;

			var postlist = userFactory.pullPosts().dpost,
				usrpostlist = userFactory.userPosts().upbf,
				dashBoardRef = userFactory.pullPosts().ref,
				userref = userFactory.userPosts().ref;


			dashBoardRef.on('value', function(data) {
				usrpostlist.$loaded().then(function() {
					var objlist = [];
					for (var a = 0; a < usrpostlist.length; a++) {
						var post = usrpostlist.$getRecord(usrpostlist.$keyAt(a)).postid;

						var items = data.hasChild(post) ? data.child(post).val() : (function(error) {
							console.log(post + " does not exist " + error);
						})();
						objlist.push(items);
					}
					$scope.randomObj = objlist;
				});
			});





		}]);
}(window));