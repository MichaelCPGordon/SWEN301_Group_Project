(function(){
    'use strict';

    angular.module('kps')
        .directive('EventCreator', [directive]);

    function directive(){
        return {
            restrict: 'EA',
            replace: true,
            scope: {},
            templateUrl: "templates/eventCreator.html",
            link: function (scope) {

            }
        }
    }
});