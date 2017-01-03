(function(window, document) {

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
  
})(window, document);