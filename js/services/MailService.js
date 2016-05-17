
angular.module('kps')
    .factory('MailService', service);

function service() {

    console.log("MailService");

    var mailList;

    var svc = {
        initialiseMailList: initialiseMailList
    };

    function initialiseMailList(list){
        mailList = list;
    }

    return svc;
}