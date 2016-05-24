
angular.module('kps')
    .factory('EventService', service);

function service($http, $state, MailService, RouteService) {

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
                formatEventDatesToObjects();
                console.log(eventList);
            },
            function(error){
                console.log(error);
            }
        );
    }

    function formatEventDatesToObjects(){
        loopThroughEvents("cost");
        loopThroughEvents("price");
        loopThroughEvents("mail");
        loopThroughEvents("discontinue");

        function loopThroughEvents(eventType){
            if (eventList[eventType] instanceof Array){
                for (var i = 0; i < eventList[eventType].length; i++){
                    eventList[eventType][i].timestamp = convertStringToDateObject(eventList[eventType][i].timestamp);
                }
            }
            else { eventList[eventType].timestamp = convertStringToDateObject(eventList[eventType].timestamp); }
        }

        function convertStringToDateObject(dateString){
            return new Date(dateString.slice(0,4), dateString.slice(5,7), dateString.slice(8,10),
                dateString.slice(11,13), dateString.slice(14,16), dateString.slice(17,19));
        }
    }

    function formatEventDatesToStrings(){
        loopThroughEvents("cost");
        loopThroughEvents("price");
        loopThroughEvents("mail");
        loopThroughEvents("discontinue");

        function loopThroughEvents(eventType){
            if (eventList[eventType] instanceof Array){
                for (var i = 0; i < eventList[eventType].length; i++){
                    eventList[eventType][i].timestamp = convertDateObjectToString(eventList[eventType][i].timestamp);
                }
            }
            else { eventList[eventType].timestamp = convertDateObjectToString(eventList[eventType].timestamp); }
        }

        function convertDateObjectToString(obj){
            return obj.getFullYear() + "," + (obj.getMonth() + 1) + "," + obj.getDay() + "," +
                obj.getHours().toFixed(2) + "," + obj.getMinutes().toFixed(2) + "," + obj.getSeconds().toFixed(2);
        }
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
