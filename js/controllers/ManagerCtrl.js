
angular.module('kps')
    .controller('ManagerCtrl', controller);

function controller($scope, EventService) {
    var vm = this;
    
    vm.username = EventService.getUsername();


    vm.logout = logout;

    function logout(){
        EventService.logout();
    }

}