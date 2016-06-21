(function(){
    'use strict';

    angular.module('kps')
        .directive('eventCreator', ['$uibModal', 'MailService', 'RouteService', directive]);

    function directive($uibModal, MailService, RouteService){
        return {
            restrict: 'EA',
            replace: true,
            templateUrl: "templates/eventCreator.html",
            link: function (scope) {

                scope.dayOptions = [
                    "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"
                ];

                scope.routeList = RouteService.getRouteList();
                scope.activeRoutes = filterActiveRoutes();
                scope.eventDefaults = getInitialisedEventDefaults();

                scope.newEventSuccess = false;

                scope.selectedEvent = angular.copy(scope.eventDefaults['mail']);
                scope.eventAttrsLength = Object.keys(scope.selectedEvent).length;
                
                scope.eventCreationError = "";
                


                scope.selectEventDefaults = function(event){
                    scope.selectedEvent = angular.copy(scope.eventDefaults[event]);
                    scope.eventAttrsLength = Object.keys(scope.selectedEvent).length;
                    scope.clearEventMessages();
                };

                scope.createEvent = function(){
                    console.log(scope.selectedEvent);
                    var invalidAttrs = scope.eventDataVerified(scope.selectedEvent);
                    if (invalidAttrs.length > 0){
                        scope.displayInvalidFieldsModal(invalidAttrs);
                    }
                    else {
                        if (scope.selectedEvent.eventType == 'mail'){
                            MailService.createMailEvent(scope.selectedEvent);
                            eventSuccess();
                        }
                        else if (scope.selectedEvent.eventType == 'discontinue') {
                            // Ensures that at least one route with at 
                            // least one transport option will always be active
                            if (scope.activeRoutes.length > 1 || scope.activeRoutes[0].transportList.length > 1){
                                RouteService.createDiscontinueEvent(scope.selectedEvent);
                                eventSuccess();
                            }
                            else {
                                eventError("At least one route transport must be active");
                            }
                        }
                        else if (scope.selectedEvent.eventType == 'price') {
                            RouteService.updatePriceEvent(scope.selectedEvent);
                            eventSuccess();
                        }
                        else if (scope.selectedEvent.eventType == 'cost') {
                            RouteService.updateCostEvent(scope.selectedEvent);
                            eventSuccess();
                        }
                        else if (scope.selectedEvent.eventType == 'newRoute') {
                            RouteService.addRoute(scope.selectedEvent);
                            eventSuccess();
                        }
                    }

                    function eventSuccess(){
                        scope.routeList = RouteService.getRouteList();
                        scope.activeRoutes = filterActiveRoutes();
                        scope.newEventSuccess = true;
                        scope.eventDefaults = getInitialisedEventDefaults();
                        scope.selectedEvent = angular.copy(scope.eventDefaults[scope.selectedEvent.eventType]);
                    }
                    function eventError(message){
                        scope.newEventSuccess = false;
                        scope.eventCreationError = message;
                    }
                };

                scope.eventDataVerified = function(ev){
                    var invalidAttrs = [];

                    if (ev.eventType == "mail"){
                        verifyIntegerAttrs(["weight", "volume"]);
                    }
                    else if (ev.eventType == "price"){
                        verifyIntegerAttrs(["weightCost", "volumeCost"]);
                    }
                    else if (ev.eventType == "cost"){
                        verifyIntegerAttrs(["weightCost", "volumeCost", "maxWeight", "maxVolume", "duration", "frequency"]);
                    }
                    else if (ev.eventType == "newRoute"){
                        verifyIntegerAttrs(["weightCost", "volumeCost", "maxWeight", "maxVolume", "duration", "frequency"]);
                    }

                    else if (ev.eventType == "discontinue"){

                    }
                    ensureNoAttrsAreBlank(ev);

                    return invalidAttrs;

                    

                    function ensureNoAttrsAreBlank(ev){
                        for (var attr in ev) {
                            if (ev.hasOwnProperty(attr) && attr != 'eventType') {
                                if (ev[attr].length == 0 && attrNotInInvalidAttrs(attr)){
                                    addToInvalidAttrs(attr, ev[attr]);
                                }
                            }
                        }
                    }
                    function verifyIntegerAttrs(attrNames){
                        for (var i = 0; i < attrNames.length; i++){
                            var attrName = attrNames[i];
                            isInt(ev[attrName]) ? ev[attrName] = parseInt(ev[attrName]) : addToInvalidAttrs(attrName, ev[attrName]);
                        }
                    }
                    function addToInvalidAttrs(attrName, attrValue){
                        invalidAttrs.push({
                            attrName: attrName,
                            attrValue: attrValue
                        });
                    }
                    function isInt(value) {
                        return !isNaN(value) &&
                            parseInt(Number(value)) == value &&
                            !isNaN(parseInt(value, 10));
                    }
                    function attrNotInInvalidAttrs(attrName){
                        for (var i = 0; i < invalidAttrs.length; i++){
                            if (invalidAttrs[i].attrName == attrName){
                                return false;
                            }
                        }
                        return true;
                    }
                };

                scope.clearEventMessages = function(){
                    scope.newEventSuccess = false;
                    scope.eventCreationError = "";
                };

                scope.displayInvalidFieldsModal = function(fields){
                    var invalidFieldsModal = $uibModal.open({
                        animation: true,
                        templateUrl: 'templates/invalidFieldsModal.html',
                        controller: 'InvalidFieldsModalCtrl as invFields',
                        size: 'md',
                        resolve: {
                            fields: function(){ return fields; }
                        }
                    });
                };

                function filterActiveRoutes() {
                    var activeRoutes = [];
                    for (var i = 0; i < scope.routeList.length; i++){
                        var route = angular.copy(scope.routeList[i]);
                        route.transportList = [];
                        for (var j = 0; j < scope.routeList[i].transportList.length; j++){
                            var transport = angular.copy(scope.routeList[i].transportList[j]);
                            if (!transport.discontinued){
                                route.transportList.push(transport);
                            }
                        }
                        if (route.transportList.length > 0){
                            activeRoutes.push(route);
                        }
                    }
                    return activeRoutes;
                }

                function getInitialisedEventDefaults(){
                    return {
                        mail: {
                            eventType: "mail",
                            day: scope.dayOptions[0],
                            route: scope.activeRoutes[0],
                            highPriority: false,
                            weight: 0,
                            volume: 0
                        },
                        price: {
                            eventType: "price",
                            route: scope.activeRoutes[0],
                            highPriority: false,
                            weightCost: 0,
                            volumeCost: 0
                        },
                        cost: {
                            eventType: "cost",
                            route: scope.activeRoutes[0],
                            company: scope.activeRoutes[0].transportList[0],
                            day: scope.dayOptions[0],
                            highPriority: false,
                            weightCost: 0,
                            volumeCost: 0,
                            maxWeight: 0,
                            maxVolume: 0,
                            duration: 0,
                            frequency: 0
                        },
                        newRoute: {
                            eventType: "newRoute",
                            company: "",
                            to: "",
                            from: "",
                            type: "",
                            day: scope.dayOptions[0],
                            highPriority: false,
                            weightCost: 0,
                            volumeCost: 0,
                            maxWeight: 0,
                            maxVolume: 0,
                            duration: 0,
                            frequency: 0
                        },
                        discontinue: {
                            eventType: "discontinue",
                            route: scope.activeRoutes[0],
                            transport: scope.activeRoutes[0].transportList[0]
                        }
                    };
                }


            }
        }
    }
})();