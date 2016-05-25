
angular.module('kps')
    .factory('MailService', service);

function service(EventService, $rootScope) {

    var mailList;

    var svc = {
        createMailEvent: createMailEvent
    };

    $rootScope.$on('logFileLoaded', function(event, args){
        mailList = args.mail;
    });

    // mailList automatically updated on EventService.addEvent()
    function createMailEvent(event){
        EventService.addEvent(event);
    }

    return svc;
}