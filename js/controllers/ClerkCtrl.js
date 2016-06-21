
angular.module('kps')
    .controller('ClerkCtrl', controller);

function controller($scope, EventService) {
    var vm = this;

    vm.username = EventService.getUsername();


    vm.logout = logout;

    function logout(){
        EventService.logout();
    }

    $scope.toggleFigures = function (){
        $("#figuresPanel").toggle();
    }
}