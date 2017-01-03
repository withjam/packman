(function(window, document) {

  var app = angular.module('packman');

  app
    .controller('packageListCtrl', PackageListCtrl)
    .controller('addPackageCtrl', AddPackageCtrl)
    .controller('editPackageCtrl', EditPackageCtrl);

  function PackageListCtrl(data, $location) {
    var ctrl = this;

    console.log('package list', data.packages);

    ctrl.list = data.packages;
    ctrl.viewPackage = function(p) {
      console.log('view package', p);
      $location.path('/package/' + p.name);
    }
  }

  function AddPackageCtrl($http, $location) {
    var ctrl = this;

    ctrl.title = "Create New Package";
    ctrl.buttonLabel = "Create Package";
    ctrl.formData = {};

    ctrl.submitForm = function() {
      $http.post('/api/package/0', ctrl.formData).then(function(resp) {
        console.log('create package response', resp);
        $location.path('/package/' + resp.data.packages[0].name);
      });
    }
  }

  function EditPackageCtrl($http, $location, data, items) {
    console.log('edit package', data);
    var ctrl = this;
    ctrl.title = data.name;
    ctrl.buttonLabel = "Edit Package";
    ctrl.formData = data;
    ctrl.showItems = true;
    ctrl.expandItems = true;
    ctrl.items = items;

    ctrl.deletePackage = function() {
      if ( confirm('Are you sure you want to delete ' + ctrl.title + '?')) {
        $http.delete('/api/package/' + ctrl.title).then(function(resp) {
          console.log('deleted', resp);
          $location.path('/packages');
        });
      };
    };

    ctrl.addItem = function() {
      ctrl.showItemForm = true;
      ctrl.selectedItem = { id: 0 };
    }

    ctrl.editItem = function(item) {
      ctrl.showItemForm = true;
      ctrl.selectedItem = item;
    }

    ctrl.updateItems = function(itemData) {
      ctrl.showItemForm = false;
      // will pass back an item if a submission
      if (itemData) {
        console.log('got item data');
        // existing items will have package_id
        if (itemData.hasOwnProperty('package_id')) {
          ctrl.selectedItem.name = itemData.name;
          ctrl.selectedItem.body = itemData.body;
        } else {
          ctrl.items.push(itemData);
        }
      }
    }
  }

  
})(window, document);