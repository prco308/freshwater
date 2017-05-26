(function () {
    'use strict';

    angular
        .module('app')
        .factory('QuestionService', Service);

    function Service($http, $q) {
        var service = {};

        service.GetById = GetById;
        service.Delete = Delete;

        return service;

        function GetById(_id) {
            return $http.get('/api/questions/' + _id).then(handleSuccess, handleError);
        }

        function Delete(_id) {
            return $http.delete('/api/questions/' + _id).then(handleSuccess, handleError);
        }

        // private functions

        function handleSuccess(res) {
            return res.data;
        }

        function handleError(res) {
            return $q.reject(res.data);
        }
    }

})();
