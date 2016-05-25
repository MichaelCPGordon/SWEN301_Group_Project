
angular.module('kps')
    .factory('RouteService', service);

function service(EventService, $rootScope) {

    var svc = {
        createRouteEvent: createRouteEvent
    };

    $rootScope.$on('logFileLoaded', function(event, args){

    });

    function createRouteEvent(event){

    }

    return svc;
}