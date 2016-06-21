angular.module('kps')
    .factory('RouteService', service);

function service(EventService, $rootScope) {

    var routeList = [];
    var filteredRouteList = [];
    

    var svc = {
        getRouteList: getRouteList,
        getFilteredRouteList: getFilteredRouteList,
        createDiscontinueEvent: createDiscontinueEvent,
		updatePriceEvent: updatePriceEvent,
        updateCostEvent: updateCostEvent,
        addRoute: addRoute
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

	function updatePriceEvent(eventData){

        var route = findRoute(eventData.route.to, eventData.route.from);
        
        if(!route){console.log("Route not found");return;}

        if(eventData.highPriority){
            route.airPriceInfo.volumeCost = "" + eventData.volumeCost;
            route.airPriceInfo.weightCost = "" + eventData.weightCost;
        }
        else{
            route.standardPriceInfo.volumeCost = "" + eventData.volumeCost;
            route.standardPriceInfo.weightCost = "" + eventData.weightCost;
        }
    }

    function updateCostEvent(eventData){

        // console.log(eventData);

        // var route = findRoute(eventData.route.to, eventData.route.from);

        var route = findRoute(eventData.route.to, eventData.route.from);

        if(!route){console.log("Route not found");return;}

        var index = findTransportIndexInList(eventData.company.company, eventData.company.type, route.transportList);
        // var transport = eventData.transport;

        route.transportList[index] = eventData.transport;

        // var costData = {
        //     maxWeight: eventData.company.maxWeight,
        //     maxVolume: eventData.company.maxVolume,
        //     weightCost: eventData.company.weightCost,
        //     volumeCost: eventData.company.volumeCost,
        //     frequency: eventData.company.frequency,
        //     duration: eventData.company.duration
        // };
        //
        // updateTransportListItem(transport, costData);

        // console.log(routeList);
        
    }
    
    function addRoute(eventData) {

        if (findRoute(eventData.to, eventData.from)) {
            return;
        }

        var route = createNewRouteFromUser(eventData, routeList);

        var costEvent = {
            company: route.transportList[0].company,
            to: route.to,
            from: route.from,
            type: route.transportList[0].type,
            weightCost: route.transportList[0].weightCost,
            volumeCost: route.transportList[0].volumeCost,
            maxWeight: route.transportList[0].maxWeight,
            maxVolume: route.transportList[0].maxVolume,
            duration: route.transportList[0].duration,
            frequency: route.transportList[0].frequency,
            day: route.transportList[0].day,
            eventType: "cost"
        };
        // TotalEvents doesn't increase by one?

        EventService.addEvent(costEvent);
    }

    function determineRouteType(to, from, highPriority){
        if(EventService.routeIsInternational(to, from)){
            return highPriority ? "Air" : "Sea";
        }
        else { return highPriority ? "Air" : "Land"; }
    }

    function findRoute(to, from){

        for(var i=0; i<routeList.length; i++){
            if(to == routeList[i].to && from == routeList[i].from){
                return routeList[i];
            }
        }

        return null;
    }
	
    function createDiscontinueEvent(eventData){
        var event = {
            to: eventData.route.to,
            from: eventData.route.from,
            company: eventData.transport.company,
            type: eventData.transport.type,
            eventType: "discontinue"
        };
        discontinueTransport(event);
        EventService.addEvent(event);
    }

    function getRouteList(){
        return routeList;
    }

    function getFilteredRouteList(filter){
        buildRouteListFromEvents(EventService.getFilteredRouteEvents(filter), true);
        return filteredRouteList;
    }

    function discontinueTransport(ev){
        for (var i = 0; i < routeList.length; i++){
            var route = routeList[i];
            if (route.to == ev.to && route.from == ev.from){
                for (var j = 0; j < route.transportList.length; j++){
                    var transport = route.transportList[j];
                    if (transport.company == ev.company && transport.type == ev.type){
                        transport.discontinued = true;
                    }
                }
            }
        }
    }

    function buildRouteListFromEvents(events, filterEvents){
        var priceList = events[0], costList = events[1], discontinueList = events[2];
        var price, cost, discontinue, route, routes;
        var transportIndex, i, j;
        var currentList;

        if (filterEvents){
            filteredRouteList = [];
            currentList = filteredRouteList;
        }
        else {
            routeList = [];
            currentList = routeList;
        }

        for (i = 0; i < costList.length; i++){
            cost = costList[i];
            route = getRouteForEvent(cost, currentList);
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
                createNewRouteFromCostEvent(cost, currentList);
            }
        }

        for (i = 0; i < priceList.length; i++){
            price = priceList[i];
            routes = getRoutesForPriceEvent(price.to, price.from, currentList);
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
                // console.log("--- No route available for given price event ---");
                // console.log(price);
            }
        }

        for (i = 0; i < discontinueList.length; i++){
            discontinue = discontinueList[i];
            route = getRouteForEvent(discontinue, currentList);
            if (route){
                transportIndex = findTransportIndexInList(discontinue.company, discontinue.type, route.transportList);
                if (transportIndex != null){
                    route.transportList[transportIndex].discontinued = true;
                }
                else {
                    // console.log("--- No transport option found for given discontinue event ---");
                    // console.log(discontinue);
                }
            }
            else {
                // console.log("--- No route available for given discontinue event ---");
                // console.log(discontinue);
            }
        }
    }

    function createNewRouteFromCostEvent(costData, routeList){
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
                    day: costData.day,
                    discontinued: false
                }
            ]
        });

        return routeList[routeList.length-1];
    }

    function createNewRouteFromUser(costData, routeList){
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
                    type: determineRouteType(costData.to, costData.from, costData.highPriority),
                    weightCost: costData.weightCost,
                    volumeCost: costData.volumeCost,
                    maxWeight: costData.maxWeight,
                    maxVolume: costData.maxVolume,
                    frequency: costData.frequency,
                    duration: costData.duration,
                    day: costData.day,
                    discontinued: false
                }
            ]
        });

        return routeList[routeList.length-1];
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

    function getRoutesForPriceEvent(to, from, routeList){
        var i, route, routes = [];
        if (to == "New Zealand" && from == "New Zealand"){
            for (i = 0; i < routeList.length; i++){
                route = routeList[i];
                if (EventService.locationIsInNz(route.to) && EventService.locationIsInNz(route.from)){
                    routes.push(route);
                }
            }
        }
        else if (from == "New Zealand"){
            for (i = 0; i < routeList.length; i++){
                route = routeList[i];
                if (route.to == to && EventService.locationIsInNz(route.from)){
                    routes.push(route);
                }
            }
        }
        else if (to == "New Zealand"){
            for (i = 0; i < routeList.length; i++){
                route = routeList[i];
                if (EventService.locationIsInNz(route.to) && route.from == from){
                    routes.push(route);
                }
            }
        }
        return routes;
    }

    function getRouteForEvent(event, routeList){
        for (var i = 0; i < routeList.length; i++){
            var route = routeList[i];
            if (event.to == route.to && event.from == route.from){
                return route;
            }
        }
        return null;
    }

    return svc;
}