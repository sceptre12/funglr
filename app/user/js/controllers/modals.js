(function(window){
    var angular = window.angular;
    angular.module('funglr.user')
    .controller('modalInstance',['userFactory','$rootScope','$modalInstance',function(userFactory,$rootscope,$modalInstance,clicked){
        var modal = this;
        modal.typeOfPost = clicked;
        
        if(modal.typeOfPost === "Text"){
            modal.insertTextPost = function(post){
			    userFactory.insertPost.text(post);
			    $modalInstance.close();
		    };
        }else if(modal.typeOfPost === "Image"){
            
        }else if(modal.typeOfPost === "Audio"){
            
        }
    }]);
}(window));