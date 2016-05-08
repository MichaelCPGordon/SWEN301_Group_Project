
    angular.module('kps', [
        'ui.router',
    ])
    .run(function($rootScope, $state){
        $state.go('login');
    })
    .config(function($stateProvider, $urlRouterProvider){

        $stateProvider
        .state('login', {
            url:"/login",
            templateUrl: "templates/login.html",
            controller: "LoginCtrl"
        })
        .state('clerk', {
            url:"/clerk",
            templateUrl: "templates/clerk.html",
            controller: "ClerkCtrl as clerk"
        })
        .state('manager', {
            url:"/manager",
            templateUrl: "templates/manager.html",
            controller: "ManagerCtrl as manager"
        });

        $urlRouterProvider.otherwise('/login');
    });
