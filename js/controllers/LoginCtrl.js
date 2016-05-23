
angular.module('kps')
    .controller('LoginCtrl', controller);

function controller($scope, MailService, EventService, RouteService, $state) {
    var vm = this;


    vm.username = "";
    vm.password = "";
    vm.showUsernameError = false;
    vm.showPasswordError = false;

    vm.clerkLogin = clerkLogin;
    vm.managerLogin = managerLogin;


    function loginDataVerified(){
        vm.showUsernameError = false;
        vm.showPasswordError = false;
        if (vm.username.length == 0){
            vm.showUsernameError = true
        }
        if (vm.password.length == 0){
            vm.showPasswordError = true;
        }
        return vm.showPasswordError == false && vm.showPasswordError == false;
    }

    function clerkLogin(){
        if (loginDataVerified()){
            EventService.clerkLogin(vm.username);
        }
    }

    function managerLogin(){
        if (loginDataVerified()){
            EventService.managerLogin(vm.username);
        }
    }



}