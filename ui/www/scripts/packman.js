(function(window, document) {

  var app = angular.module('packman',['ngRoute']);

  app
    .controller('homeCtrl',HomeCtrl)
    .config(PackmanConfig);



  function HomeCtrl($scope) {
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
      .otherwise('/');

  }


  
})(window, document);(function(window, document) {

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
  }

  
})(window, document);