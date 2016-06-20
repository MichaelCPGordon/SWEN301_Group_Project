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
                    $("#extras").slideToggle(500);
                };

                scope.averageTimeCalculationTo = "Sydney";
                scope.averageTimeCalculationFrom = "Wellington";
                scope.hoursTag1 = "Hours";
                scope.hoursTag2 = "Hours";
                
                //total amount of events
                scope.eventListLength = EventService.getAllEvents().length;
                console.log(scope.eventListLength);


                //Amount of mail
                // - Number of Mail items
                scope.numberMailItems = MailService.getMailList().length;


                //Total weight value of all mail
                function getTotalMailWeight() {
                    var totalMailWeight = 0;
                    var mailList = MailService.getMailList();
                    for(var i=0; i < mailList.length; i++){
                        totalMailWeight += parseInt(mailList[i].weight);
                    }
                    console.log(totalMailWeight);
                    return totalMailWeight;
                }
                scope.totalMailWeight = getTotalMailWeight();


                //total volume value of all mail
                function getTotalMailVolume() {
                    var totalMailVolume = 0;
                    var mailList = MailService.getMailList();
                    for(var i=0; i < mailList.length; i++){
                        totalMailVolume += parseInt(mailList[i].volume);
                    }
                    console.log(totalMailVolume);
                    return totalMailVolume;
                }
                scope.totalMailVolume = getTotalMailVolume();


                //function for finding total revenue
                function getTotalRevenue(){
                    var revenue = 0;
                    var mailList = MailService.getMailList();
                    //console.log(mailList);
                    for(var i=0; i < mailList.length; i++){
                        var totalWeightCost = 0;
                        var totalVolumeCost = 0;
                        var routeList = RouteService.getRouteList()
                        for(var j = 0; j < routeList.length; j++){
                            if(mailList[i].from == routeList[j].from && mailList[i].to == routeList[j].to){
                                if(mailList[i].priority == "International Air" || mailList[i].priority == "Domestic Air"){
                                    totalWeightCost += (mailList[i].weight*routeList[j].airPriceInfo.weightCost);
                                    totalVolumeCost += (mailList[i].volume*routeList[j].airPriceInfo.volumeCost);
                                }
                                else if(mailList[i].priority == "International Standard" || mailList[i].priority == "Domestic Standard"){
                                    totalWeightCost += (mailList[i].weight*routeList[j].standardPriceInfo.weightCost);
                                    totalVolumeCost += (mailList[i].volume*routeList[j].standardPriceInfo.volumeCost);
                                }
                            }
                        }
                        revenue += totalWeightCost + totalVolumeCost;
                    }
                    return revenue;
                }
                scope.totalRevenue = getTotalRevenue()/100;


                //calculates the total expenditure
                function getTotalExpenditure(){
                    var expenditure = 0;
                    var mailList = MailService.getMailList();
                    var routeList = RouteService.getRouteList();
                    for(var i=0; i < mailList.length; i++){
                        var totalWeightCost = 0;
                        var totalVolumeCost = 0;
                        for(var j = 0; j < routeList.length; j++){
                            if(mailList[i].from == routeList[j].from && mailList[i].to == routeList[j].to ) {
                                var sameType = [];
                                for(var k = 0; k < routeList[j].transportList.length; k++){
                                    // console.log(routeList[j].transportList[l]);
                                    if(mailList[i].priority == "International Air" || mailList[i].priority == "Domestic Air"){
                                        if(routeList[j].transportList[k].type == "Air"){
                                            sameType.push(routeList[j].transportList[k]);
                                        }
                                    }
                                    else if(mailList[i].priority == "International Standard"){
                                        if(routeList[j].transportList[k].type == "Sea"){
                                            sameType.push(routeList[j].transportList[k]);
                                        }
                                    }
                                    else if(mailList[i].priority == "Domestic Standard"){
                                        if(routeList[j].transportList[k].type == "Land"){
                                            sameType.push(routeList[j].transportList[k]);
                                        }
                                    }
                                }
                                var cheapest = sameType[0];
                                for(var l = 1; l < sameType.length; l++){
                                    if(sameType[l].weightCost + sameType[l].volumeCost < cheapest){
                                        cheapest = sameType[l];
                                    }
                                }
                                totalWeightCost += (mailList[i].weight * cheapest.weightCost);
                                totalVolumeCost += (mailList[i].volume * cheapest.volumeCost);
                                // console.log(totalWeightCost + totalVolumeCost);
                            }
                        }
                        expenditure += totalWeightCost + totalVolumeCost;
                    }
                    return expenditure;
                }
                scope.totalExpenditure = getTotalExpenditure()/100;


                //finding the average Delivery times
                function averageDeliveryTime( from , to ){
                    var routeList = RouteService.getRouteList();
                    var transportList = null;
                    var airCount = 0;
                    var standCount = 0;
                    var aveAir = 0;
                    var aveStandard = 0;
                    for(var i = 0; i < routeList.length; i++){
                        if(routeList[i].to == to && routeList[i].from == from){
                            transportList = routeList[i].transportList;
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
                    console.log(aveAir);
                    aveAir = airCount == 0 ? 0 : aveAir/airCount;

                    console.log(aveAir);
                    aveStandard = standCount == 0 ? 0 : aveStandard/standCount;
                    var averageTimes = [];
                    if(aveAir == 0){
                        aveAir = "No mail on this Route";
                        scope.hoursTag1 = "";
                    }
                    if(aveStandard == 0){
                        aveStandard = "No mail on this Route";
                        scope.hoursTag2 = "";
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
                scope.averages = averageDeliveryTime("Wellington", "Sydney");


                //finds the critical routes
                function criticalRoutes(){
                    var criticalRoutes = [];



                    return criticalRoutes;
                }
            }
        }
    }
})();