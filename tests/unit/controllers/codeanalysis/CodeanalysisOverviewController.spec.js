describe('CodeanalysisOverview.spec.js', function() {

	var $scope,
	$q,
	$httpBackend;

	beforeEach(module('controllers'));

	beforeEach(inject(function($controller, $rootScope, _$q_, _$httpBackend_) {

		$scope = $rootScope.$new();
		$httpBackend = _$httpBackend_;

		controller = $controller('CodeanalysisOverviewController', {
			'$scope': $scope,
			'$httpBackend': $httpBackend
		});

		$q = _$q_;
	}));

	it('should be defined', function() {
		expect($scope).toBeDefined();
	});
});
