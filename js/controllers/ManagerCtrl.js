
angular.module('kps')
    .controller('ManagerCtrl', controller);

function controller($scope, EventService) {
    var vm = this;

    vm.pageToShow = "newEvent";

    vm.eventList = EventService.getAllEvents();
    vm.username = EventService.getUsername();

    console.log(vm.eventList);


    vm.logout = logout;
    vm.goToPage = goToPage;

    function logout(){
        EventService.logout();
    }

    function goToPage(pageName){
        vm.pageToShow = pageName;
    }

}