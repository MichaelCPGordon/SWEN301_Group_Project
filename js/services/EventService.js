
angular.module('kps')
    .factory('EventService', service);

function service($http, $state, $rootScope) {

    var loggedIn = false;
    var username = "";
    var eventList;

    var svc = {
        addEvent: addEvent,
        getAllEvents: getAllEvents,
        readLogFile: readLogFile,
        clerkLogin: clerkLogin,
        managerLogin: managerLogin,
        logout: logout,
        isLoggedIn: isLoggedIn,
        getUsername: getUsername,
        getMailEvents: getMailEvents,
        getRouteEvents: getRouteEvents
    };

    function addEvent(event){
        event.timestamp = new Date();
        event.timestamp.setMilliseconds(0);

        eventList[event.eventType].push(event);
    }

    function getAllEvents(){
        var allEvents = [], i;
        for (i = 0; i < eventList.cost.length; i++){
            allEvents.push(eventList.cost[i]);
        }
        for (i = 0; i < eventList.price.length; i++){
            allEvents.push(eventList.price[i]);
        }
        for (i = 0; i < eventList.discontinue.length; i++){
            allEvents.push(eventList.discontinue[i]);
        }
        for (i = 0; i < eventList.mail.length; i++){
            allEvents.push(eventList.mail[i]);
        }
        return allEvents;
    }

    function addEventTypeToEachEvent(){
        var i;
        for (i = 0; i < eventList.cost.length; i++){
            eventList.cost[i].eventType = "cost";
        }
        for (i = 0; i < eventList.price.length; i++){
            eventList.price[i].eventType = "price";
        }
        for (i = 0; i < eventList.discontinue.length; i++){
            eventList.discontinue[i].eventType = "discontinue";
        }
        for (i = 0; i < eventList.mail.length; i++){
            eventList.mail[i].eventType = "mail";
        }
    }

    function readLogFile(){
        $http.get('././log.xml').then(
            function(response){
                var x2js = new X2JS();
                eventList = x2js.xml_str2json(response.data).simulation;
                formatEventDatesToObjects();
                ensureEventsAreInLists();
                addEventTypeToEachEvent();
                delete eventList['_xsi:noNamespaceSchemaLocation'];
                delete eventList['_xmlns:xsi'];
                console.log(eventList);
                $rootScope.$broadcast('logFileLoaded');
            },
            function(error){
                console.log(error);
            }
        );
    }

    function ensureEventsAreInLists(){
        if (!(eventList.cost instanceof Array)){
            eventList.cost = [eventList.cost];
        }
        if (!(eventList.price instanceof Array)){
            eventList.price = [eventList.price];
        }
        if (!(eventList.discontinue instanceof Array)){
            eventList.discontinue = [eventList.discontinue];
        }
        if (!(eventList.mail instanceof Array)){
            eventList.mail = [eventList.mail];
        }
        if (!(eventList.timelimit instanceof Array)){
            eventList.timelimit = [eventList.timelimit];
        }
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

    function getMailEvents(){
        return eventList.mail;
    }

    function getRouteEvents(){
        return [eventList.price, eventList.cost, eventList.discontinue];
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
        loggedIn = false;
        username = "";
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
