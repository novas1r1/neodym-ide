describe('TestingOverviewController Testsuite', function () {
	var $scope, $q, controller;

	beforeEach(module('neodym'));

	// contact controller tests
	beforeEach(inject(function ($rootScope, $controller, _$q_) {
		$scope = $rootScope.$new();

		controller = $controller('TestingOverviewController', {
			'$scope': $scope
		});

		$q = _$q_;

	}));


	it('Should exist on startup', function () {
		expect(controller).toBeDefined();
		expect($scope).toBeDefined();
	});

});
