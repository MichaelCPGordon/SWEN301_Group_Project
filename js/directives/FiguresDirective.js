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
                    console.log(mailList);
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
                                console.log(totalWeightCost + totalVolumeCost);
                            }
                        }
                        expenditure += totalWeightCost + totalVolumeCost;
                    }
                    return expenditure;
                }
                scope.totalExpenditure = getTotalExpenditure()/100;

            }
        }
    }
})();