/**
 * Copyright aaronprojects GmbH (www.aaronprojects.de), 2015
 * Distributed under the MIT License.
 * (See accompanying file LICENSE or copy at http://opensource.org/licenses/MIT)
 * Author: Verena Zaiser (verena.zaiser@aaronprojects.de)
 * Description: This controller helps to run tests and display test coverage
 */
angular.module('neodym.controllers')
.controller('TestingOverviewController', ['$scope', '$mdToast','TaskService', 
	function ($scope, $mdToast, TaskService) {

	// logging
	var TAG = 'TestingOverviewController: ';
	var gui = require('nw.gui');

	$scope.testResults = localStorage.currentProjectPath +"/www/tests/results.html";
	$scope.testCoverage = localStorage.currentProjectPath +"/www/tests/coverage/html/index.html";

	/**
	 * Display alert or success box
	 * @param  {string} type error or success
	 * @param  {string} msg  
	 */
	var displayAlertBox = function(type, msg) {

	    toast = $mdToast.show({
	    	template: '<md-toast class="toast-'+ type +'">'+ msg + '</md-toast>',
	    	hideDelay: 6000,
	    	position: 'bottom right'
	    });
	};
	
	/**
	 * Start tests and display result
	 * @return {[type]} [description]
	 */
	$scope.runTests = function () {
		console.log(TAG + 'runTests');
		$scope.runButton = true;

		TaskService.executeTask("grunt test", localStorage.currentProjectPath).then(function (result) {
			$scope.runButton = false;
			displayAlertBox("success", result.msg);
			$scope.init();
		}, function (failure) {
			$scope.runButton = false;
			displayAlertBox("error", failure.msg);
		});
	};

}]);