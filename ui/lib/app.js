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


  
})(window, document);