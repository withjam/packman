(function(window, document) {

  var app = angular.module('packman');

  app
    .controller('addPackageCtrl', AddPackageCtrl)
    .controller('editPackageCtrl', EditPackageCtrl);

  function AddPackageCtrl($http, $location) {
    var ctrl = this;

    ctrl.title = "Create New Package"
    ctrl.formData = {};

    ctrl.submitForm = function() {
      $http.post('/api/package/0', ctrl.formData).then(function(resp) {
        console.log('create package response', resp);
        $location.path('/package/' + resp.data.packages[0].name);
      });
    }
  }

  function EditPackageCtrl($http, data) {
    console.log('edit package', data);
    var ctrl = this;
    ctrl.title = data.name;
    this.formData = data;
  }

  
})(window, document);