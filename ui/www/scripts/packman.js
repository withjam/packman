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
      .when('/addpackage', {
        templateUrl: 'templates/package.form.html',
        controller: 'addPackageCtrl as ctrl'
      })
      .when('/package/:packageName', {
        templateUrl: 'templates/package.form.html',
        resolve: {
          data: function($http, $route) {
            return $http.get('/api/package/' + $route.current.params.packageName).then(function(response) {
              console.log('response', response.data.package);
              return response.data.package;
            })
          }
        },
        controller: 'editPackageCtrl as ctrl'

      })
      .otherwise('/');

  }


  
})(window, document);(function(window, document) {

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