(function(window) {
    var angular = window.angular;
    angular.module('funglr.user')
        .controller('ModalInstanceCtrl', ['$scope', 'userFactory', '$rootScope', '$modalInstance', 'clicked', function($scope, userFactory, $rootScope, $modalInstance, clicked) {

            $scope.typeOfPost = clicked;
            $scope.post = {
                'type': $scope.typeOfPost,
                'title': '',
                'subject': '',
                'body': '',
                'image': {},
                'audio': '',
                'owner': $rootScope.currentUser.regUser
            };

            // modalinstance.close can be used to send information which can be
            // picked up by the modalinstance.result.then(function(){})
            $scope.insertPost = function() {
                userFactory.insertPost.post($scope.post);
                $modalInstance.close(); 
            };
            $scope.insertImage = function(){
                userFactory.insertPost.post($scope.post);
                
                $modalInstance.close(); 
            };
            $scope.cancel = function() {
                $modalInstance.dismiss('cancel');
            };
        }]);
}(window));