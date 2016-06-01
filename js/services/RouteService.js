
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
        type: "",
        priority: "",
        company: "",
        duration: 0,
        frequency: 0,
        day: "",
        priceInfo: {
            weightCost: 0,
            volumeCost: 0
        },
        costInfo: {
            weightCost: 0,
            volumeCost: 0,
            maxWeight: 0,
            maxVolume: 0
        }
    };

    $rootScope.$on('logFileLoaded', function(event, args){
        buildRouteListFromEvents(EventService.getRouteEvents());
    });

    function buildRouteListFromEvents(events){
        var priceList = events[0], costList = events[1], discontinueList = events[2];
        var price, cost, discontinue, route;

        for (var i = 0; i < priceList.length; i++){
            price = priceList[i];
            route = getRouteForEvent(price);
            if (route){
                route.priceInfo.weightCost = price.weightcost;
                route.priceInfo.volumeCost = price.volumecost;
            }
            else {

            }
        }
        for (i = 0; i < costList.length; i++){
            cost = costList[i];
            route = getRouteForEvent(cost);
            if (route){

            }
            else {

            }
        }
        for (i = 0; i < discontinueList.length; i++){
            discontinue = discontinueList[i];
            route = getRouteForEvent(discontinue);
            if (route){

            }
            else {

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
        return null;
    }

    function createRouteEvent(event){

    }

    return svc;
}