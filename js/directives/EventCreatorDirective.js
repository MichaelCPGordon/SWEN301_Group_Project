(function(){
    'use strict';

    angular.module('kps')
        .directive('eventCreator', ['$uibModal', directive]);

    function directive($uibModal){
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
                scope.eventFieldsLength = Object.keys(scope.selectedEvent).length;
                
                scope.selectEventDefaults = function(event){
                    scope.selectedEvent = scope.eventDefaults[event];
                    scope.eventFieldsLength = Object.keys(scope.selectedEvent).length;
                };

                scope.createEvent = function(){
                    var invalidFields = scope.eventDataVerified(scope.selectedEvent);
                    if (invalidFields.length > 0){
                        scope.displayInvalidFieldsModal(invalidFields);
                    }
                };

                scope.eventDataVerified = function(ev){
                    var invalidFields = [];

                    if (ev.eventType == "mail"){
                        verifyIntegerFields(["weight", "volume"]);
                    }
                    else if (ev.eventType == "price"){
                        verifyIntegerFields(["weightCost", "volumeCost"]);
                    }
                    else if (ev.eventType == "cost"){
                        verifyIntegerFields(["weightCost", "volumeCost", "maxWeight", "maxVolume", "duration", "frequency"]);
                    }
                    else if (ev.eventType == "discontinue"){

                    }

                    return invalidFields;

                    function verifyIntegerFields(fieldNames){
                        for (var i = 0; i < fieldNames.length; i++){
                            var fieldName = fieldNames[i];
                            isInt(ev[fieldName]) ? ev[fieldName] = parseInt(ev[fieldName]) : addToInvalidFields(fieldName, ev[fieldName]);
                        }
                    }
                    function addToInvalidFields(fieldName, fieldValue){
                        invalidFields.push({
                            fieldName: fieldName,
                            fieldValue: fieldValue
                        });
                    }
                    function isInt(value) {
                        return !isNaN(value) &&
                            parseInt(Number(value)) == value &&
                            !isNaN(parseInt(value, 10));
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
                }



            }
        }
    }
})();