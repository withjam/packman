(function(window, document) {

  var app = angular.module('packman');

  app
    .controller('addPackageCtrl', AddPackageCtrl)
    .controller('editPackageCtrl', EditPackageCtrl);

  function AddPackageCtrl($http) {
    var ctrl = this;

    ctrl.title = "Create New Package"
    ctrl.formData = {};
  }

  function EditPackageCtrl($http, data) {
    console.log('edit package', data);
    var ctrl = this;
    ctrl.title = 'Edit Package';
    this.formData = data;
  }

  
})(window, document);