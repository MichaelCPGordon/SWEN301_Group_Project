
angular.module('kps')
    .factory('RouteService', service);

function service(EventService, $rootScope) {

    var routeList = [];
    var nzLocations = ["Auckland", "Wellington", "Hamilton"];

    var svc = {
        createRouteEvent: createRouteEvent
    };


    var testRoute = {
        to: "",
        from: "",
        standardPriceInfo: {
            weightCost: 0,
            volumeCost: 0
        },
        airPriceInfo: {
            weightCost: 0,
            volumeCost: 0
        },
        transportList: [
            {
                company: "",
                type: "",
                weightCost: 0,
                volumeCost: 0,
                maxWeight: 0,
                maxVolume: 0,
                frequency: 0,
                duration: 0,
                discontinued: false
            }
        ]
    };

    $rootScope.$on('logFileLoaded', function(event, args){
        buildRouteListFromEvents(EventService.getRouteEvents());
    });

    function createRouteEvent(){

    }

    function buildRouteListFromEvents(events){
        var priceList = events[0], costList = events[1], discontinueList = events[2];
        var price, cost, discontinue, route, routes;
        var transportIndex, i, j;

        for (i = 0; i < costList.length; i++){
            cost = costList[i];
            route = getRouteForEvent(cost);
            if (route){
                transportIndex = findTransportIndexInList(cost.company, cost.type, route.transportList);
                if (transportIndex != null){
                    updateTransportListItem(route.transportList[transportIndex], cost);
                }
                else {
                    createTransportListItem(route.transportList, cost);
                }
            }
            else {
                createNewRoute(cost);
            }
        }

        for (i = 0; i < priceList.length; i++){
            price = priceList[i];
            routes = getRoutesForPriceEvent(price.to, price.from);
            if (routes.length > 0){

                    if (price.priority == "International Air" || price.priority == "Domestic Air"){
                        for (j = 0; j < routes.length; j++) {
                            routes[j].airPriceInfo = {
                                weightCost: price.weightCost,
                                volumeCost: price.volumeCost
                            }
                        }
                    }
                    else {
                        for (j = 0; j < routes.length; j++) {
                            routes[j].standardPriceInfo = {
                                weightCost: price.weightCost,
                                volumeCost: price.volumeCost
                            }
                        }
                    }

            }
            else {
                //TODO Do this properly
                console.log("--- No route available for given price event ---");
                console.log(price);
            }
        }

        for (i = 0; i < discontinueList.length; i++){
            discontinue = discontinueList[i];
            route = getRouteForEvent(discontinue, "aa");
            if (route){
                transportIndex = findTransportIndexInList(discontinue.company, discontinue.type, route.transportList);
                if (transportIndex != null){
                    route.transportList[transportIndex].discontinued = true;
                }
                else {
                    console.log("--- No transport option found for given discontinue event ---");
                    console.log(discontinue);
                }
            }
            else {
                console.log("--- No route available for given discontinue event ---");
                console.log(discontinue);
            }
        }


        console.log(routeList);
    }

    function createNewRoute(costData){
        routeList.push({
            to: costData.to,
            from: costData.from,
            standardPriceInfo: {
                weightCost: costData.weightCost,
                volumeCost: costData.volumeCost
            },
            airPriceInfo: {
                weightCost: costData.weightCost,
                volumeCost: costData.volumeCost
            },
            transportList: [
                {
                    company: costData.company,
                    type: costData.type,
                    weightCost: costData.weightCost,
                    volumeCost: costData.volumeCost,
                    maxWeight: costData.maxWeight,
                    maxVolume: costData.maxVolume,
                    frequency: costData.frequency,
                    duration: costData.duration,
                    discontinued: false
                }
            ]
        });
    }

    function createTransportListItem(transportList, costData){
        transportList.push({
            company: costData.company,
            type: costData.type,
            weightCost: costData.weightCost,
            volumeCost: costData.volumeCost,
            maxWeight: costData.maxWeight,
            maxVolume: costData.maxVolume,
            frequency: costData.frequency,
            duration: costData.duration,
            discontinued: false
        });
    }

    function updateTransportListItem(listItem, costData){
        listItem.weightCost = costData.weightCost;
        listItem.volumeCost = costData.volumeCost;
        listItem.maxWeight = costData.maxWeight;
        listItem.maxVolume = costData.maxVolume;
        listItem.frequency = costData.frequency;
        listItem.duration = costData.duration;
    }

    function findTransportIndexInList(company, type, transportList){
        for (var i = 0; i < transportList.length; i++){
            var transport = transportList[i];
            if (transport.company == company && transport.type == type && !transport.discontinued){
                return i;
            }
        }
        return null;
    }

    function getRoutesForPriceEvent(to, from){
        var i, route, routes = [];
        if (to == "New Zealand" && from == "New Zealand"){
            for (i = 0; i < routeList.length; i++){
                route = routeList[i];
                if (locationIsInNz(route.to) && locationIsInNz(route.from)){
                    routes.push(route);
                }
            }
        }
        else if (from == "New Zealand"){
            for (i = 0; i < routeList.length; i++){
                route = routeList[i];
                if (route.to == to && locationIsInNz(route.from)){
                    routes.push(route);
                }
            }
        }
        else if (to == "New Zealand"){
            for (i = 0; i < routeList.length; i++){
                route = routeList[i];
                if (locationIsInNz(route.to) && route.from == from){
                    routes.push(route);
                }
            }
        }
        return routes;
    }

    function getRouteForEvent(event, test){
        for (var i = 0; i < routeList.length; i++){
            var route = routeList[i];
            if (event.to == route.to && event.from == route.from){
                return route;
            }
        }
        return null;
    }

    function locationIsInNz(location){
        for (var i = 0; i < nzLocations.length; i++){
            if (location == nzLocations[i]){
                return true;
            }
        }
        return false;
    }

    return svc;
}