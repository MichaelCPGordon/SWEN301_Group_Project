(function(){
    'use strict';

    angular.module('kps')
        .directive('figures', ["EventService", "RouteService", "MailService", directive]);

    function directive(EventService, RouteService, MailService){
        return {
            restrict: 'EA',
            replace: true,
            scope: {},
            templateUrl: "templates/figures.html",
            link: function (scope) {
                scope.toggleExtras = function () {
                    scope.figuresExpanded = !scope.figuresExpanded;
                    $("#extras").slideToggle(500);
                };
                scope.figuresExpanded = false;

                scope.timeFilterUpdated = timeFilterUpdated;

                initialiseTimerFilter();
                timeFilterUpdated();

                function initialiseTimerFilter(){
                    var from = new Date(1980, 0, 1, 0, 0);
                    var to = new Date();
                    to.setSeconds(0, 0);

                    scope.timeFilter = {
                        from: from,
                        to: to
                    };
                }

                function timeFilterUpdated(){
                    scope.mailList = MailService.getFilteredMailList(scope.timeFilter);
                    scope.routeList = RouteService.getFilteredRouteList(scope.timeFilter);

                    scope.eventListLength = EventService.getFilteredEvents(scope.timeFilter).length;
                    scope.numberMailItems = scope.mailList.length;
                    scope.totalMailWeight = getTotalMailWeight();
                    scope.totalMailVolume = getTotalMailVolume();
                    scope.totalRevenue = getTotalRevenue()/100;
                    scope.totalExpenditure = getTotalExpenditure()/100;
                    //TODO change static routelist
                    scope.averages = averageDeliveryTime(scope.routeList[0]);
                }

                //Total weight value of all mail
                function getTotalMailWeight() {
                    var totalMailWeight = 0;
                    for(var i=0; i < scope.mailList.length; i++){
                        totalMailWeight += parseInt(scope.mailList[i].weight);
                    }
                    return totalMailWeight;
                }


                //total volume value of all mail
                function getTotalMailVolume() {
                    var totalMailVolume = 0;
                    for(var i=0; i < scope.mailList.length; i++){
                        totalMailVolume += parseInt(scope.mailList[i].volume);
                    }
                    return totalMailVolume;
                }


                //function for finding total revenue
                function getTotalRevenue(){
                    var revenue = 0;
                    for(var i=0; i < scope.mailList.length; i++){
                        var totalWeightCost = 0;
                        var totalVolumeCost = 0;
                        var routeList = RouteService.getRouteList()
                        for(var j = 0; j < routeList.length; j++){
                            if(scope.mailList[i].from == routeList[j].from && scope.mailList[i].to == routeList[j].to){
                                if(scope.mailList[i].priority == "International Air" || scope.mailList[i].priority == "Domestic Air"){
                                    totalWeightCost += (scope.mailList[i].weight*routeList[j].airPriceInfo.weightCost);
                                    totalVolumeCost += (scope.mailList[i].volume*routeList[j].airPriceInfo.volumeCost);
                                }
                                else if(scope.mailList[i].priority == "International Standard" || scope.mailList[i].priority == "Domestic Standard"){
                                    totalWeightCost += (scope.mailList[i].weight*routeList[j].standardPriceInfo.weightCost);
                                    totalVolumeCost += (scope.mailList[i].volume*routeList[j].standardPriceInfo.volumeCost);
                                }
                            }
                        }
                        revenue += totalWeightCost + totalVolumeCost;
                    }
                    return revenue;
                }


                //calculates the total expenditure
                function getTotalExpenditure(){
                    var expenditure = 0;
                    for(var i=0; i < scope.mailList.length; i++){
                        var totalWeightCost = 0;
                        var totalVolumeCost = 0;
                        for(var j = 0; j < scope.routeList.length; j++){
                            if(scope.mailList[i].from == scope.routeList[j].from && scope.mailList[i].to == scope.routeList[j].to ) {
                                var sameType = [];
                                for(var k = 0; k < scope.routeList[j].transportList.length; k++){
                                    if(scope.mailList[i].priority == "International Air" || scope.mailList[i].priority == "Domestic Air"){
                                        if(scope.routeList[j].transportList[k].type == "Air"){
                                            sameType.push(scope.routeList[j].transportList[k]);
                                        }
                                    }
                                    else if(scope.mailList[i].priority == "International Standard"){
                                        if(scope.routeList[j].transportList[k].type == "Sea"){
                                            sameType.push(scope.routeList[j].transportList[k]);
                                        }
                                    }
                                    else if(scope.mailList[i].priority == "Domestic Standard"){
                                        if(scope.routeList[j].transportList[k].type == "Land"){
                                            sameType.push(scope.routeList[j].transportList[k]);
                                        }
                                    }
                                }
                                var cheapest = sameType[0];
                                for(var l = 1; l < sameType.length; l++){
                                    if(sameType[l].weightCost + sameType[l].volumeCost < cheapest){
                                        cheapest = sameType[l];
                                    }
                                }
                                totalWeightCost += (scope.mailList[i].weight * cheapest.weightCost);
                                totalVolumeCost += (scope.mailList[i].volume * cheapest.volumeCost);
                            }
                        }
                        expenditure += totalWeightCost + totalVolumeCost;
                    }
                    return expenditure;
                }


                //finding the average Delivery times
                function averageDeliveryTime( route ){
                    if (!route){ return null; }

                    var transportList = null;
                    var airCount = 0;
                    var standCount = 0;
                    var aveAir = 0;
                    var aveStandard = 0;
                    for(var i = 0; i < scope.routeList.length; i++){
                        if(scope.routeList[i].to == route.to && scope.routeList[i].from == route.from){
                            transportList = scope.routeList[i].transportList;
                        }
                    }

                    for(var j = 0; j < transportList.length; j++){
                        if(transportList[j].type == "Air"){
                            aveAir += parseInt(transportList[j].duration);
                            airCount++;
                        }
                        else if(transportList.type == "Land" || transportList.type == "Sea"){
                            aveStandard += parseInt(transportList[j].duration);
                            standCount++;
                        }
                    }
                    aveAir = airCount == 0 ? 0 : aveAir/airCount;

                    aveStandard = standCount == 0 ? 0 : aveStandard/standCount;
                    var averageTimes = [];
                    if(aveAir == 0){
                        aveAir = "No mail on this Route";
                    }
                    if(aveStandard == 0){
                        aveStandard = "No mail on this Route";
                    }
                    averageTimes.push(aveAir);
                    averageTimes.push(aveStandard);

                    if(transportList != null) {
                        return averageTimes;
                    }
                    else{
                        return "No Such Route";
                    }
                    
                }


                //finds the critical routes
                function criticalRoutes(){
                    var criticalRoutes = [];
                    var customerCost = 0;
                    for(var i=0; i < scope.mailList.length; i++) {
                        console.log(scope.mailList.length);
                        var routeList = RouteService.getRouteList()
                        for (var j = 0; j < routeList.length; j++) {
                            if (scope.mailList[i].from == routeList[j].from && scope.mailList[i].to == routeList[j].to) {
                                if (scope.mailList[i].priority == "International Air" || scope.mailList[i].priority == "Domestic Air") {
                                    customerCost = (scope.mailList[i].weight * routeList[j].airPriceInfo.weightCost);
                                    customerCost += (scope.mailList[i].volume * routeList[j].airPriceInfo.volumeCost);
                                    console.log(customerCost);
                                    if(comparePrices(routeList[j],scope.mailList[i],customerCost)){
                                        criticalRoutes.push(routeList[j]);
                                    }
                                }
                                else if (scope.mailList[i].priority == "International Standard" || scope.mailList[i].priority == "Domestic Standard") {
                                    customerCost = (scope.mailList[i].weight * routeList[j].airPriceInfo.weightCost);
                                    customerCost += (scope.mailList[i].volume * routeList[j].airPriceInfo.volumeCost);
                                    if(comparePrices(routeList[j],scope.mailList[i],customerCost)){
                                        criticalRoutes.push(routeList[j]);
                                    }
                                }
                            }
                        }
                    }
                    return criticalRoutes;
                }

                // assisting method for critical routes
                function comparePrices(route,mailItem,customerCost){
                    var kpsCost = 0;
                    for(var i = 0; i < route.transportList.length; i++){
                        if(route.transportList[i].type == "Air") {
                            kpsCost = mailItem.weight * route.transportList[i].weightCost;
                            kpsCost += mailItem.volume * route.transportList[i].volumeCost;
                            console.log(kpsCost);
                            if (kpsCost > customerCost) {
                                return true;
                            }
                        }
                        else if(route.transportList[i].type == "Sea" || route.transportList[i].type == "Land"){
                            kpsCost = mailItem.weight * route.transportList[i].weightCost;
                            kpsCost += mailItem.volume * route.transportList[i].volumeCost;
                            if (kpsCost > customerCost) {
                                return true;
                            }
                        }
                    }
                    return false;
                }
                scope.critical = criticalRoutes();
                console.log(scope.critical);
            }
        }
    }
})();