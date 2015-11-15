angular.module('hapi-learning')
    .controller('UploadCtrl', ['$scope', 'FileUploader', function ($scope, FileUploader) {

        var uploader = $scope.uploader = new FileUploader({
            url: 'upload.php'
        });

        uploader.onAfterAddingFile = function(item) {
            item.file.visible = true;
        };

        $scope.isVisible = function(item) {
            return item.file.visible;
        }

        $scope.toggleFileVisible = function(item) {
            console.log(item.file.visible);
            item.file.visible = !item.file.visible;
        };

        $scope.fileChooser = function () {
            angular.element('#fileSelect').trigger('click');
        };

    }]);
