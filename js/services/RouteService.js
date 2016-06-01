
angular.module('kps')
    .factory('RouteService', service);

function service(EventService, $rootScope) {

    var routeList = [];

    var svc = {
        createRouteEvent: createRouteEvent
    };


    var testRoute = {
        to: "",
        from: "",
        
    }

    $rootScope.$on('logFileLoaded', function(event, args){
        buildRouteListFromEvents(EventService.getRouteEvents());
    });

    function buildRouteListFromEvents(events){
        var price = events[0], cost = events[1], discontinue = events[2];

        for (var i = 0; i < price.length; i++){
            var route = getRouteForEvent(price[i]);
            if (route){

            }
            else {
                var newRoute = {
                    to:
                }
            }
        }
    }

    function getRouteForEvent(event){
        for (var i = 0; i < routeList.length; i++){
            var route = routeList[i];
            if (event.to == route.to && event.from == route.from){
                return route;
            }
        }
        null;
    }

    function createRouteEvent(event){

    }

    return svc;
}