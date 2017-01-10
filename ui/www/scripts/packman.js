(function(window, document) {

  var app = angular.module('packman',['ngRoute']);

  app
    .controller('homeCtrl',HomeCtrl)
    .config(PackmanConfig);



  function HomeCtrl($scope,$location) {
    var ctrl = this;

    function codeDetected(data) {
      console.log('code detected', data);
      ctrl.codeFound = data.codeResult.code;
      $scope.$apply();
    }

    function startScanner() {
      Quagga.init({
        locate: true,
        inputStream : {
          name : "Live",
          type : "LiveStream",
          target: '#quaggas-viewport',
          constraints: {
            width: '500',
            height: '500'
          }
        },
        decoder : {
          readers : ["code_128_reader"]
        }
      }, function(err) {
          if (err) {
              console.log(err);
              return
          }
          console.log("Initialization finished. Ready to start");
          Quagga.start();
      });
      Quagga.onDetected(codeDetected);
    }

    ctrl.launchScanner = function() {
      ctrl.scannerActive = true;
      startScanner();
    }

    ctrl.endScanner = function() {
      Quagga.stop();
      ctrl.scannerActive = false;
    }

    ctrl.searchItems = function() {
      console.log('search items', ctrl.itemQ);
      if (ctrl.itemQ) {
        $location.path('search/packages').search('q',ctrl.itemQ);  
      }
    }
    
  }


  PackmanConfig.$inject = ['$routeProvider','$locationProvider'];
  function PackmanConfig($route,$location) {
    $location.html5Mode(true);
    $route
      .when('/', {
        templateUrl: 'templates/home.html',
        controller: 'homeCtrl as ctrl'
      })
      .when('/packages', {
        templateUrl: 'templates/package.list.html',
        resolve: {
          data: function($http) {
            return $http.get('/api/packages').then(function(resp) { return resp.data; });
          }
        },
        controller: 'packageListCtrl as ctrl'
      })
      .when('/addpackage', {
        templateUrl: 'templates/package.form.html',
        controller: 'addPackageCtrl as ctrl'
      })
      .when('/search/packages', {
        templateUrl: 'templates/package.search.html',
        controller: 'packageSearchCtrl as ctrl'
      })
      .when('/package/:packageName', {
        templateUrl: 'templates/package.form.html',
        resolve: {
          data: function($http, $route) {
            return $http.get('/api/package/' + $route.current.params.packageName).then(function(response) {
              //console.log('response', response.data.package);
              return response.data.package;
            })
          },
          items: function($http, $route) {
            return $http.get('/api/package/' + $route.current.params.packageName + '/items').then(function(response) {
              return response.data.items;
            });
          }
        },
        controller: 'editPackageCtrl as ctrl'
      })
      .when('/package/:packageName/barcodes', {
        templateUrl: 'templates/package.barcode.html',
        controller: 'barcodeCtrl as ctrl'
      })
      .otherwise('/');

  }


  
})(window, document);(function(window, document) {

  var app = angular.module('packman');

  app.directive('packmanItemForm', ItemFormDirective);

  function ItemFormDirective($http) {
    return {
      restrict: 'E',
      replace: true,
      scope: {
        'packmanItem': '=',
        'packmanPackageName': '=',
        'packmanItemFinished': '&'
      },
      link: function($scope) {
        $scope.$watch('packmanItem', function(newVal) {
          console.log('packmanItem changed', newVal);
          if (newVal) {
            var isNew = $scope.isNew = !newVal.hasOwnProperty('name');
            $scope.formTitle = isNew ? 'Add Item' : newVal.name;
            $scope.formButton = isNew ? 'Add Item' : 'Save Changes';
            $scope.formData = angular.extend({},newVal);
          }
        })

        $scope.cancelForm = function() {
          $scope.packmanItemFinished();
        }

        $scope.submitForm = function() {
          console.log('save the item');
          $http.post('/api/package/' + $scope.packmanPackageName + '/item/' + $scope.formData.id, $scope.formData).then(function(resp) {
            console.log('item form response', resp);
            if (resp.data.insertId) {
              $scope.formData.id = resp.data.insertId;
            }
            $scope.packmanItemFinished({ itemData: $scope.formData });
          }, function(resp) {
            console.log('error', resp);
            $scope.cancelForm();
          })
        }
      },
      templateUrl: 'templates/item.form.html'
    }
  }
  
})(window, document);(function(window, document) {

  var app = angular.module('packman');

  app
    .controller('barcodeCtrl', BarcodeCtrl)
    .controller('packageSearchCtrl', PackageSearchCtrl)
    .controller('packageListCtrl', PackageListCtrl)
    .controller('addPackageCtrl', AddPackageCtrl)
    .controller('editPackageCtrl', EditPackageCtrl);


  function BarcodeCtrl($route,$location) {
    var ctrl = this;
    ctrl.name = $route.current.params.packageName;
    ctrl.done = function() {
      $location.path('package/' + ctrl.name);
    }
  }

  function PackageSearchCtrl($http, $location) {
    var ctrl = this, s = $location.search();

    ctrl.searchForm = {
      q: s.q
    }

    ctrl.gotoPackage = function(p) {
      $location.path('package/' + p.name);
    }

    ctrl.doSearch = function() {
      ctrl.searching = true;
      if (ctrl.searchForm.q) {
        $http.get('/api/search/packages?q=' + ctrl.searchForm.q).then(function(resp) {
          ctrl.searching = false;
          console.log('search results ', resp);
          ctrl.results = resp.data.results[0];
        }, function(resp) {
          console.log('Error searching', resp);
          alert('There was an error.');
        })
      }
    }

    if (s.q) {
      console.log('do search');
      ctrl.doSearch();
    }
  }

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
        ctrl.sizes = ['small','medium','large','xlarge'];

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
        ctrl.sizes = ['small','medium','large','xlarge'];
    ctrl.title = data.name;
    ctrl.buttonLabel = "Save Changes";
    ctrl.formData = data;
    ctrl.showItems = true;
    ctrl.expandItems = true;
    ctrl.items = items;

    ctrl.printBarcodes = function() {
      $location.path('package/' + ctrl.title + '/barcodes');
    }

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