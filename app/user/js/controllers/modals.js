(function(window){
    var angular = window.angular;
    angular.module('funglr.user')
    .controller('ModalInstanceCtrl',['$scope','userFactory','$rootScope','$modalInstance','clicked',function($scope,userFactory,$rootScope,$modalInstance,clicked){
        
        $scope.typeOfPost = clicked;
        $scope.post = {
            'title': '',
            'subject': '',
            'body': '',
            'image':'',
            'audio':'',
            'owner': $rootScope.currentUser.regUser
        };
        
        if($scope.typeOfPost === "Text"){
            $scope.insertPost = function(){
                console.log($scope.post)
			    userFactory.insertPost.text($scope.post);
			    $modalInstance.close();
		    };
		    
        }else if($scope.typeOfPost === "Image"){
            $scope.insertPost = function(){
    			userFactory.insertPost.image($scope.post);
    			$modalInstance.close();
    		};
        }else if($scope.typeOfPost === "Audio"){
            $scope.insertPost = function(){
    			userFactory.insertPost.audio($scope.post);
    			$modalInstance.close();
    		};
        }
        $scope.cancel = function(){
            $modalInstance.dismiss('cancel');
        };
    }]);
}(window));