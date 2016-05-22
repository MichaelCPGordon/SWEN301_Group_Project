
angular.module('kps')
    .factory('MailService', service);

function service() {

    var mailList;

    var svc = {
        initialiseMailList: initialiseMailList
    };

    function initialiseMailList(list){
        mailList = list;
    }

    return svc;
}