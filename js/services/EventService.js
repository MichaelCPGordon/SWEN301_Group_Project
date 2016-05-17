
angular.module('kps')
    .factory('EventService', service);

function service($http, $state, MailService, RouteService) {

    console.log("EventService");

    var testList = {

    };

    var loggedIn = false;
    var eventList;

    var svc = {
        readLogFile: readLogFile,
        clerkLogin: clerkLogin,
        mangerLogin: managerLogin,
        isLoggedIn: isLoggedIn
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

    function clerkLogin(){
        loggedIn = true;
        readLogFile();
        $state.go('clerk');
    }

    function managerLogin(){
        loggedIn = true;
        readLogFile();
        $state.go('manager');
    }

    function isLoggedIn(){
        return loggedIn;
    }

    return svc;
}
