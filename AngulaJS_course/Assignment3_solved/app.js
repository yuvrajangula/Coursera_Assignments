(function () {
    'use strict';
    angular.module('NarrowItDownApp', [])
        .controller('NarrowItDownController', NarrowItDownController)
        .controller('FoundController', FoundController)
        .service('MenuSearchService', MenuSearchService)
        .directive('foundItems', FoundItems)
        .filter('match', getMatched);



    // Controller NarrowDown
    NarrowItDownController.$inject = ['MenuSearchService'];
    function NarrowItDownController(service) {
        var narrow = this;
        narrow.items = [];
        narrow.error = service.Message;
        narrow.keyValue = '';
        service.fetchData().then(
            (res) => {
                narrow.items = res.data.menu_items;
                narrow.error = service.Message;
            }
        ).catch(
            (error) => narrow.error = error.message
        );
        narrow.search = () => {
            narrow.items = service.getMatchedMenuItems(narrow.keyValue);
            narrow.error = service.Message;
        }
    }


    // Filter Match
    function getMatched() {
        return (des, keyValue, id) => {
            keyValue = keyValue || '';
            keyValue = keyValue.toLowerCase();
            if (keyValue !== '')
                $('.description'+id).html(des.replace(keyValue, ('<span class=highlight>' + keyValue + '</span>')));
            else return des;
        }
    }



    // Directive for items Found
    function FoundItems() {
        var ddo = {
            templateUrl: 'foundedItems.html',
            scope: {
                items: '<',
                keyValue: '<',
                errorMsg: '<'
            },
            controller: FoundController,
            controllerAs: 'fitems',
            bindToController: true
        };
        return ddo;
    }



    // Directive Controller
    FoundController.$inject = ['MenuSearchService'];
    function FoundController(service) {
        var fitems = this;
        console.log(fitems.items);
        fitems.items = service.getMatchedMenuItems(fitems.keyValue);
        fitems.onRemove = (index) =>{
            var item = fitems.items.splice(index, 1);
        }
    }



    // Service
    MenuSearchService.$inject = ['$http'];
    function MenuSearchService($http) {
        var service = this;
        var items = [];
        service.Message = "Loading...";
        service.fetchData = () => {
            console.log("Entered into FetchData");
            var response = $http({
                method: 'GET',
                url: 'https://davids-restaurant.herokuapp.com/menu_items.json',
            });
            response.then(
                (res) => items = res.data.menu_items,
                (res) => service.message = "something Wents wrong !!!"
            )
            return response;
        }
        service.getMatchedMenuItems = function (keyValue) {
            var found = [];
            keyValue = keyValue || '';
            keyValue = keyValue.toLowerCase();
            if (items.length>0)
                items.forEach(function (value) {
                    var des = value.description;
                    if (des.toLowerCase().indexOf(keyValue) !== -1) found.push(value);
                });
            if (found.length <= 0) service.Message = "Element Not Found !!!";
            return found;
        }
    }
})();
