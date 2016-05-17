(function(){
    'use strict';

    angular.module('kps')
        .directive('eventCreator', [directive]);

    function directive(){
        return {
            restrict: 'EA',
            replace: true,
            scope: {
                name: "="
            },
            templateUrl: "templates/eventCreator.html",
            link: function (scope) {

                console.log(scope.name);

                scope.dayOptions = [
                    "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"
                ];

                scope.eventDefaults = {
                    mail: {
                        day: scope.dayOptions[0],
                        to: "",
                        from: "",
                        weight: 0,
                        volume: 0,
                        priority: ""
                    },
                    price: {
                        to: "",
                        from: "",
                        priority: "",
                        weightCost: 0,
                        volumeCost: 0
                    },
                    cost: {
                        company: "",
                        to: "",
                        from: "",
                        type: "",
                        weightCost: 0,
                        volumeCost: 0,
                        maxWeight: 0,
                        maxVolume: 0,
                        duration: 0,
                        frequency: 0,
                        day: scope.dayOptions[0]
                    },
                    discontinue: {
                        company: "",
                        to: "",
                        from: "",
                        type: ""
                    }
                };

                scope.selectedEvent = scope.eventDefaults['mail'];
                scope.eventFieldsLength = Object.keys(scope.selectedEvent).length;

                console.log(scope.selectedEvent);
                
                scope.selectEventDefaults = function(event){
                    scope.selectedEvent = scope.eventDefaults[event];
                    scope.eventFieldsLength = Object.keys(scope.selectedEvent).length;
                }



            }
        }
    }
})();