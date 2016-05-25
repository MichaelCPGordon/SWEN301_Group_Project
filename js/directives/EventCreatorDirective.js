(function(){
    'use strict';

    angular.module('kps')
        .directive('eventCreator', ['$uibModal', 'MailService', 'RouteService', directive]);

    function directive($uibModal, MailService, RouteService){
        return {
            restrict: 'EA',
            replace: true,
            scope: {
                name: "="
            },
            templateUrl: "templates/eventCreator.html",
            link: function (scope) {

                scope.dayOptions = [
                    "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"
                ];

                scope.eventDefaults = {
                    mail: {
                        eventType: "mail",
                        day: scope.dayOptions[0],
                        to: "",
                        from: "",
                        weight: 0,
                        volume: 0,
                        priority: ""
                    },
                    price: {
                        eventType: "price",
                        to: "",
                        from: "",
                        priority: "",
                        weightCost: 0,
                        volumeCost: 0
                    },
                    cost: {
                        eventType: "cost",
                        day: scope.dayOptions[0],
                        company: "",
                        to: "",
                        from: "",
                        type: "",
                        weightCost: 0,
                        volumeCost: 0,
                        maxWeight: 0,
                        maxVolume: 0,
                        duration: 0,
                        frequency: 0
                    },
                    discontinue: {
                        eventType: "discontinue",
                        company: "",
                        to: "",
                        from: "",
                        type: ""
                    }
                };

                scope.selectedEvent = scope.eventDefaults['mail'];
                scope.eventAttrsLength = Object.keys(scope.selectedEvent).length;

                scope.selectEventDefaults = function(event){
                    scope.selectedEvent = scope.eventDefaults[event];
                    scope.eventAttrsLength = Object.keys(scope.selectedEvent).length;
                };

                scope.createEvent = function(){
                    var invalidAttrs = scope.eventDataVerified(scope.selectedEvent);
                    if (invalidAttrs.length > 0){
                        scope.displayInvalidFieldsModal(invalidAttrs);
                    }
                    else {
                        if (scope.selectedEvent.eventType == 'mail'){
                            MailService.createMailEvent(scope.selectedEvent);
                        }
                        else {
                            RouteService.createRouteEvent(scope.selectedEvent);
                        }
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




            }
        }
    }
})();