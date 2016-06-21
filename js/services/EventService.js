
angular.module('kps')
    .factory('EventService', service);

function service($http, $state, $rootScope, FileSaver) {

    var loggedIn = false;
    var username = "";
    var eventList;

    var nzLocations = ["Auckland", "Wellington", "Hamilton", "Rotorua", "Palmerston North", "Christchurch", "Dunedin"];

    var svc = {
        generateXMLLog: generateXMLLog,
        getEventsBetweenDateRange: getEventsBetweenDateRange,
        addEvent: addEvent,
        getAllEvents: getAllEvents,
        getFilteredEvents: getFilteredEvents,
        readLogFile: readLogFile,
        clerkLogin: clerkLogin,
        managerLogin: managerLogin,
        logout: logout,
        isLoggedIn: isLoggedIn,
        getUsername: getUsername,
        getFilteredMailEvents: getFilteredMailEvents,
        getMailEvents: getMailEvents,
        getFilteredRouteEvents: getFilteredRouteEvents,
        getRouteEvents: getRouteEvents,
        routeIsInternational: routeIsInternational,
        locationIsInNz: locationIsInNz
    };

    function generateXMLLog(){
        var allEvents = angular.copy(getAllEvents());
        var x2js = new X2JS();
        var xml = "", xmlItem;

        for (var i = 0; i < allEvents.length; i++){
            allEvents[i].timestamp = convertDateObjectToString(allEvents[i].timestamp);
            xmlItem = "<" + allEvents[i].eventType + ">" +
                x2js.json2xml_str(allEvents[i]) + "</" +
                allEvents[i].eventType + ">";
            xml += xmlItem;

        }
        xml = '<simulation>' + xml + '</simulation>';

        var data = new Blob([xml], { type: 'text/plain;charset=utf-8' });
        FileSaver.saveAs(data, 'log.xml');
    }

    function getEventsBetweenDateRange(to, from){
        var i, filteredEvents = [], timestamp;
        for (i = 0; i < eventList.cost.length; i++){
            timestamp = eventList.cost[i].timestamp;
            if (timestamp > from && timestamp < to){
                filteredEvents.push(eventList.cost[i]);
            }
        }
        for (i = 0; i < eventList.price.length; i++){
            timestamp = eventList.price[i].timestamp;
            if (timestamp > from && timestamp < to){
                filteredEvents.push(eventList.price[i]);
            }
        }
        for (i = 0; i < eventList.discontinue.length; i++){
            timestamp = eventList.discontinue[i].timestamp;
            if (timestamp > from && timestamp < to){
                filteredEvents.push(eventList.discontinue[i]);
            }
        }
        for (i = 0; i < eventList.mail.length; i++){
            timestamp = eventList.mail[i].timestamp;
            if (timestamp > from && timestamp < to){
                filteredEvents.push(eventList.mail[i]);
            }
        }
        return filteredEvents;
    }

    function addEvent(event){
        event.timestamp = new Date();
        event.timestamp.setSeconds(0, 0);

        eventList[event.eventType].push(event);
        $rootScope.$broadcast('eventCreated');
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

    function getFilteredEvents(filter){
        var allEvents = [], i, item;
        for (i = 0; i < eventList.cost.length; i++){
            item = eventList.cost[i];
            if (item.timestamp > filter.from && item.timestamp < filter.to){
                allEvents.push(item);
            }
        }
        for (i = 0; i < eventList.price.length; i++){
            item = eventList.price[i];
            if (item.timestamp > filter.from && item.timestamp < filter.to){
                allEvents.push(item);
            }
        }
        for (i = 0; i < eventList.discontinue.length; i++){
            item = eventList.discontinue[i];
            if (item.timestamp > filter.from && item.timestamp < filter.to){
                allEvents.push(item);
            }
        }
        for (i = 0; i < eventList.mail.length; i++){
            item = eventList.mail[i];
            if (item.timestamp > filter.from && item.timestamp < filter.to){
                allEvents.push(item);
            }
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


    }

    function convertDateObjectToString(obj){
        var year, month, date, hour, min;
        year = obj.getFullYear();
        month = obj.getMonth();
        if (month < 10){ month = "0" + month; }
        date = obj.getDate();
        if (date < 10){ date = "0" + date; }
        hour = obj.getHours();
        if (hour < 10){ hour = "0" + hour; }
        min = obj.getMinutes();
        if (min < 10){ min = "0" + min; }
        console.log(year + "," + month + "," + date + "," + hour + "," + min + "," + "00,00");

        return year + "," + month + "," + date + "," + hour + "," + min + "," + "00,00";
    }

    function locationIsInNz(location){
        for (var i = 0; i < nzLocations.length; i++){
            if (location == nzLocations[i]){
                return true;
            }
        }
        return false;
    }

    function routeIsInternational(to, from) {
        return !locationIsInNz(to) || !locationIsInNz(from);
    }

    function getFilteredMailEvents(filter){
        var mail = [];
        for (var i = 0; i < eventList.mail.length; i++){
            var item = eventList.mail[i];
            if (item.timestamp > filter.from && item.timestamp < filter.to){
                mail.push(item);
            }
        }
        return mail;
    }

    function getMailEvents(){
        return eventList.mail;
    }

    function getFilteredRouteEvents(filter){
        var i, item, prices = [], costs = [], discontinues = [];
        for (i = 0; i < eventList.price.length; i++){
            item = eventList.price[i];
            if (item.timestamp > filter.from && item.timestamp < filter.to){
                prices.push(item);
            }
        }
        for (i = 0; i < eventList.cost.length; i++){
            item = eventList.cost[i];
            if (item.timestamp > filter.from && item.timestamp < filter.to){
                costs.push(item);
            }
        }
        for (i = 0; i < eventList.discontinue.length; i++){
            item = eventList.discontinue[i];
            if (item.timestamp > filter.from && item.timestamp < filter.to){
                discontinues.push(item);
            }
        }
        return [prices, costs, discontinues];
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
        generateXMLLog();
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
