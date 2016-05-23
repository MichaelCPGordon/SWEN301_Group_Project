
angular.module('kps')
    .factory('EventService', service);

function service($http, $state, MailService, RouteService) {

    var testList = {

    };

    var loggedIn = false;
    var username = "";
    var eventList;

    var svc = {
        readLogFile: readLogFile,
        clerkLogin: clerkLogin,
        managerLogin: managerLogin,
        logout: logout,
        isLoggedIn: isLoggedIn,
        getUsername: getUsername
    };

    function readLogFile(){
        $http.get('././log.xml').then(
            function(response){

                var x2js = new X2JS();
                eventList = x2js.xml_str2json(response.data).simulation;
                console.log(eventList);
            },
            function(error){
                console.log(error);
            }
        );
    }

    function loadMailFromEventList(){
        var mailList = [];
        for (var i = 0; i < eventList.mail.length; i++){
            mailList.push(eventList.mail[i]);
        }
        MailService.initialiseMailList(mailList);
    }

    function clerkLogin(un){
        loggedIn = true;
        username = un;
        readLogFile();
        $state.go('clerk');
    }

    function managerLogin(un){
        loggedIn = true;
        username = un;
        readLogFile();
        $state.go('manager');
    }

    function logout(){
        var loggedIn = false;
        var username = "";
        $state.go('login');
    }

    function isLoggedIn(){
        return loggedIn;
    }

    function getUsername(){
        return loggedIn ? username : null;
    }

    return svc;
}
