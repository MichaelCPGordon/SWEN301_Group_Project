
angular.module('kps')
    .controller('ManagerCtrl', controller);

function controller($scope, EventService) {
    var vm = this;

    vm.pageToShow = "newEvent";

    vm.username = EventService.getUsername();


    vm.logout = logout;
    vm.goToPage = goToPage;

    function logout(){
        EventService.logout();
    }

    function goToPage(pageName){
        vm.pageToShow = pageName;
    }

}