(function(){
    'use strict';

    angular.module('kps')
        .directive('figures', [directive]);

    function directive(){
        return {
            restrict: 'EA',
            replace: true,
            scope: {},
            templateUrl: "templates/figures.html",
            link: function (scope) {
                scope.toggleExtras = function () {
                    $("#extras").slideToggle(500);
                };
            }
        }
    }
})();