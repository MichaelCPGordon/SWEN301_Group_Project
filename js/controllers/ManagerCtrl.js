
angular.module('kps')
    .controller('ManagerCtrl', controller);

function controller($scope, $rootScope, EventService) {
    var vm = this;

    vm.pageToShow = "newEvent";

    $rootScope.$on('logFileLoaded', function(){
        vm.eventList = EventService.getAllEvents();
    });

    vm.eventList = EventService.getAllEvents();

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