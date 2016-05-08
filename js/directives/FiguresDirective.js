(function(){
    'use strict';

    angular.module('kps')
        .directive('Figures', [directive]);

    function directive(){
        return {
            restrict: 'EA',
            replace: true,
            scope: {},
            templateUrl: "templates/figures.html",
            link: function (scope) {

            }
        }
    }
});