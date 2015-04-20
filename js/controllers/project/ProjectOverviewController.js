/**
 * Copyright aaronprojects GmbH (www.aaronprojects.de), 2015
 * Distributed under the MIT License.
 * (See accompanying file LICENSE or copy at http://opensource.org/licenses/MIT)
 * Author: Verena Zaiser (verena.zaiser@aaronprojects.de)
 * Description: This controller checks for all necessary dependencies and is able to run npm install on click.
 */
angular.module('neodym.controllers')
.controller('ProjectOverviewController', ['$scope', '$q', '$mdToast', 'ProjectService', 'TaskService', 
	function ($scope, $q, $mdToast, ProjectService, TaskService) {
	
	// logging
	var TAG = "ProjectOverviewController: ";

	// needed dependencies
	$scope.dependencies = [
		{name:"node", installed: false, description:"Has to be installed globally"},
		{name:"grunt", installed: false, description:"Will be installed by running 'npm install'"},
		{name:"ionic", installed: false, description:"Has to be installed globally"},
		{name:"cordova", installed: false, description:"Has to be installed globally"},
		{name:"karma", installed: false, description:"Will be installed by running 'npm install'"},
		{name:"android", installed: false, description:"Will be installed if selected in setup"},
		{name:"ios", installed: false, description:"Will be installed if selected in setup"}
	];

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
	 * Get current project information
	 */
	$scope.init = function() {
		console.log(TAG + 'init');

		//get current project data
		ProjectService.getAllProjects().then(function (result) {
			
			for (var i = 0; i < result.length; i++) {
				// get current project object
				if(result[i].path == localStorage.currentProjectPath) {
					$scope.currentProject = result[i];
					console.log("android: " + $scope.currentProject.android);
					console.log("ios: " + $scope.currentProject.ios);
				}
			};

			$scope.checkIfInstalled();

		}, function (failure) {
			console.error(TAG + "ERROR" + failure);
		});
	};

	/**
	 * Check if dev dependencie modules are installed
	 * They are important for using this software.
	 */
	$scope.checkIfInstalled = function () {
		$scope.install = true;

		//check if node is installed
		TaskService.executeTask("node -v", localStorage.currentProjectPath).then(function (result) {
			$scope.dependencies[0].installed = true;
			// grunt
			TaskService.executeTask("npm list grunt --depth=0", localStorage.currentProjectPath).then(function (result) {
				$scope.dependencies[1].installed = true;
			}, function (failure) {
				displayAlertBox("error", "Grunt needs to be installed, please run npm install");
				console.error(failure.msg);
			});
			//ionic
			TaskService.executeTask("npm list -g ionic --depth=0", localStorage.currentProjectPath).then(function (result) {
				$scope.dependencies[2].installed = true;
			}, function (failure) {
				displayAlertBox("error", "Ionic needs to be installed, please run npm install");
				console.error(failure.msg);
			});
			//cordova
			TaskService.executeTask("npm list -g cordova --depth=0", localStorage.currentProjectPath).then(function (result) {
				$scope.dependencies[3].installed = true;
			}, function (failure) {
				displayAlertBox("error", "Cordova needs to be installed, please run npm install");
				console.error(failure.msg);
			});
			//karma
			TaskService.executeTask("npm list karma --depth=0", localStorage.currentProjectPath).then(function (result) {
				$scope.dependencies[4].installed = true;
			}, function (failure) {
				displayAlertBox("error", "Karma needs to be installed, please run npm install");
				console.error(failure.msg);
			});
			
		}, function (failure) {
			$scope.install = false;
			displayAlertBox("error", failure.msg);
		});

		// add android if android was selected
		if($scope.currentProject.android == true) {

			TaskService.executeTask("cordova platform add android", localStorage.currentProjectPath).then(function (result) {
				$scope.dependencies[5].installed = true;
			}, function (failure) {
				console.log(failure.msg);
				/* TODO doesnt work yet
				var msg = "Platform android already added";

				if(msg.indexOf(failure.msg) > -1) {
					$scope.dependencies[5].installed = true;
				} else {
					displayAlertBox("error", "Failed to add android platform");
					console.error(failure.msg);
				}*/
			});
		}

		// add ios if ios was selected
		if($scope.currentProject.ios == true) {
			TaskService.executeTask("cordova platform add ios", localStorage.currentProjectPath).then(function (result) {
				$scope.dependencies[6].installed = true;
			}, function (failure) {
				displayAlertBox("error", "Failed to add ios platform");
				console.error(failure.msg);
			});
		}
	};

	/**
	 * Run npm install to download and install all dependencies
	 */
	$scope.executeNpmInstall = function() {
		console.log(TAG + 'executeNpmInstall');

		$scope.installButton = true;

		TaskService.executeTask("npm install", localStorage.currentProjectPath).then(function (result) {
			$scope.installButton = false;
			$scope.init();
			displayAlertBox("success", result.msg);
		}, function (failure) {
			$scope.installButton = false;
			displayAlertBox("error", failure.msg);
		});
	};
}]);