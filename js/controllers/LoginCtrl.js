
angular.module('kps')
    .controller('LoginCtrl', controller);

function controller($scope, MailService, EventService, RouteService, $state) {
    var vm = this;



    vm.clerkLogin = clerkLogin;
    vm.managerLogin = managerLogin;


    function clerkLogin(){
        EventService.clerkLogin();
    }

    function managerLogin(){
        EventService.managerLogin();
    }



}