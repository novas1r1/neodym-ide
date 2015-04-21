describe('HomeOverviewController', function(){
    var scope;

    // load the controller's module
    beforeEach(module('neodym.controllers'));

    beforeEach(inject(function($rootScope, $controller) {
        scope = $rootScope.$new();
        $controller('HomeOverviewController', {$scope: scope});
    }));

    // tests start here
    it('should have enabled friends to be true', function(){
        expect(scope.settings.enableFriends).toEqual(true);
    });
});