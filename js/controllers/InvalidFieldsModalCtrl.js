
angular.module('kps')
    .controller('InvalidFieldsModalCtrl', controller);

function controller($scope, $uibModalInstance, fields) {
    var vm = this;

    vm.fields = fields;

    vm.close = close;

    function close(){
        $uibModalInstance.close();
    }


}