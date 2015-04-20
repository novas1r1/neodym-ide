/**
 * Copyright aaronprojects GmbH (www.aaronprojects.de), 2015
 * Distributed under the MIT License.
 * (See accompanying file LICENSE or copy at http://opensource.org/licenses/MIT)
 * Author: Verena Zaiser (verena.zaiser@aaronprojects.de)
 * Description: This controller handles all functionalities for running a code analysis.
 */
angular.module('neodym.controllers')
.controller('CodeanalysisOverviewController', ['$scope', '$mdToast', 'TaskService', function ($scope, $mdToast, TaskService) {

	// logging
	var TAG = 'CodeanalysisOverviewController: ';

	/**
	 * Display alert or success box
	 * @param  {string} type error or success
	 * @param  {string} msg  
	 */
	var displayAlertBox = function(type, msg) {

	    toast = $mdToast.show({
	    	// template: '<md-toast class="toast-'+ type +'">'+ msg +'<md-button ng-click="close()">Close</md-button></md-toast>',
	    	template: '<md-toast class="toast-'+ type +'">'+ msg + '</md-toast>',
	    	hideDelay: 6000,
	    	position: 'bottom right'
	    });
	};

 	/**
 	 * Get jshint report
 	 */
 	 $scope.init = function() {
 	 	console.log(TAG + 'init');
		$scope.resultSource = localStorage.currentProjectPath + '/www/misc/jshint/jshint-report.html';
 	 };

 	/**
 	 * Start the analysing and create output
 	 */
 	 $scope.startAnalysing = function () {
 	 	console.log(TAG + 'runAnalysing');
		$scope.refreshButton = true;
		

		TaskService.executeTask("grunt analyze", localStorage.currentProjectPath).then(function (result) {
			$scope.refreshButton = false;
			displayAlertBox("success", result.msg);
		}, function (failure) {
			$scope.refreshButton = false;
			displayAlertBox("error", failure.msg);
		});
 	 };
 }]);