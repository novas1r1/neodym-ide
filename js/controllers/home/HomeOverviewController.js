/**
 * Copyright aaronprojects GmbH (www.aaronprojects.de), 2015
 * Distributed under the MIT License.
 * (See accompanying file LICENSE or copy at http://opensource.org/licenses/MIT)
 * Author: Verena Zaiser (verena.zaiser@aaronprojects.de)
 * Description: This controller handles all functionality coming along with creating new projects, listing and opening them.
 */
angular.module('neodym.controllers')
.controller('HomeOverviewController', ['$scope', '$q', '$mdToast','ProjectService', 'FileService', 'TaskService', 'RepositoryService', '$location', 
	function($scope, $q, $mdToast, ProjectService, FileService, TaskService, RepositoryService, $location) {
	
	// logging
	var TAG = "HomeOverviewController: ";
	
	// required for retrieving the project path
	var path = require('path');
	var applicationDirectory = path.dirname( process.execPath );

	// project
	$scope.project = {
		title: '',
		description: '',
		template: 'blank',
		path: '',
		version: '0.0.1',
		ios: false,
		android: false
	};

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
	* Load all existing projects
	*/
	$scope.init = function() {
		console.log(TAG + 'init');

		// get all existing projects
		ProjectService.getAllProjects().then(function (result) {
			$scope.projects = result;
		}, function (failure) {
			console.error(TAG + "ERROR" + failure);
			displayAlertBox('error', 'Failed to load existing projects');
		});
	};

	/**
	 * Check if project is currently active or not
	 * @param  {object} projectToCheck 
	 * @return {boolean} true if active, false if not
	 */
	$scope.checkIfActive = function(projectToCheck) {
		console.log(TAG + 'checkIfActive');

		if(projectToCheck.path == localStorage.currentProjectPath) {
			return true;
		}
		return false;
	};

	/**
	 * Set the directory path on changing it
	 * @param {[type]} value [description]
	 */
	$scope.setDirectoryPath = function(value) {
		console.log(TAG + 'setDirectoryPath');

		$scope.project.path = value.files[0].path + "/";
	};

	/**
	 * Create new project
	 * Copy predefined project to selected path
	 * Check if ionic needs to be updated
	 */
	$scope.createProject = function() {
		console.log(TAG + 'createProject');

		//show loading spinner
		$scope.createButton = true;

		//get template repository from git
		var repositoryURL = "https://github.com/aaronprojects/neodym-apptemplate-"+ $scope.project.template + ".git";
		var destination = $scope.project.path + $scope.project.title;

		//create folder for new project
		RepositoryService.cloneRepository(repositoryURL, destination).then(function (result) {

			//remove git folder from project
			var gitFolderPath = destination + "/.git"; 

			FileService.deleteFolderAndContent(gitFolderPath).then(function (result) {
				var newProject = {
					id: $scope.projects.length + 1,
					title: $scope.project.title,
					description: $scope.project.description,
					path: $scope.project.path + $scope.project.title,
					timestamp: new Date(),
					version: "0.0.1",
					android: $scope.project.android,
					ios: $scope.project.ios
				};

				ProjectService.addProject(newProject).then(function (result) {
					console.log(TAG + "project successfully added");
					$scope.createButton = false;
					
					displayAlertBox("success", "Project " + $scope.project.title + " successfully created!");
					localStorage.currentProjectPath = newProject.path;

					//clear form input
					$scope.project.title = "";
					$scope.project.description = "";
					$scope.project.android = false;
					$scope.project.ios = false;

					$location.path("/project");

				}, function(failed) {
					$scope.createButton = false;
					displayAlertBox("error", "Error creating project " + $scope.project.title);
				});
			}, function (failure) {
				$scope.createButton = false;
			});
		}, function (failure) {
			$scope.createButton = false;
			displayAlertBox("error", failure.msg);
		});
	};

	/**
	 * Set selected project to work with
	 * @param  {object} projectToOpen
	 */
	$scope.openProject = function (projectToOpen) {
		console.log(projectToOpen);
		
		localStorage.currentProjectPath = projectToOpen.path;

		//open project view
		$location.path('project');
	};
	
}]);