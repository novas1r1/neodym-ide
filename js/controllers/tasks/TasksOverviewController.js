/**
 * Copyright aaronprojects GmbH (www.aaronprojects.de), 2015
 * Distributed under the MIT License.
 * (See accompanying file LICENSE or copy at http://opensource.org/licenses/MIT)
 * Author: Verena Zaiser (verena.zaiser@aaronprojects.de)
 * Description: This controller helps to manage all tasks which can be run by the user.
 */
angular.module('neodym.controllers')
.controller('TasksOverviewController', ['$scope', '$q', '$mdDialog', '$mdToast','FileService', 'TaskService', 
	function ($scope, $q, $mdDialog, $mdToast, FileService, TaskService) {

	// logging
	var TAG = "TasksOverviewController: ";

	var taskConfigPath = './configs/tasks.config.json';

	var userTasksConfigPath = './configs/usertasks.config.json';
	var systemTasksConfigPath = './configs/systemtasks.config.json';

	var systemTasksList = [];
	var userTasksList = [];

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
	 * Get all tasks from config file
	 * @return {object} config data if available
	 */
	var getAllTasks = function () {		
		console.log(TAG + 'getAllTasks');
		
		var deferred = $q.defer();



		//get all system tasks
		FileService.readFile(systemTasksConfigPath).then(function (result) {
			systemTasksList = JSON.parse(result.success);

			//get all user tasks
			FileService.readFile(userTasksConfigPath).then(function (result) {
				userTasksList = JSON.parse(result.success);

				//combine both task lists
				deferred.resolve(systemTasksList.concat(userTasksList));
			}, function (failure) {
				deferred.reject(failure.msg);
			});

		}, function (failure) {
			deferred.reject(failure.msg);
		});

		return deferred.promise;
	};

 	/**
 	 * Save data to configfile if tasks were added/edited/deleted 
 	 * @param  {[type]} path [description]
 	 * @param  {[type]} data [description]
 	 * @return {[type]}      [description]
 	 */
 	var saveConfig = function(path, data) {
 		console.log(TAG + "saveConfig");

 		var deferred = $q.defer();

 		FileService.writeFile(path, JSON.stringify(data, null, 4)).then(function (result) {
 			deferred.resolve(result.msg);
 		}, function (failure) {
 			deferred.reject(failure.msg);
 		});

 		return deferred.promise;
 	};

 	/**
 	 * Adds a task created by the user to the tasklist
 	 * @param {task} task
 	 */
 	 var addTask = function (task) {
 		console.log(TAG + "addTask");
 		console.log(task);

		userTasksList.push(
		{
			id: $scope.taskList.length+1,
			platform: task.platform,
			name: task.name,
			description: task.description,
			systemtask: false,
			command: task.command
		});

		saveConfig(userTasksConfigPath, userTasksList).then(function (result) {
			//refresh view if new task was added
			$scope.init();
		}, function(failure) {
			console.log(TAG + failure);
		});
 	};

	/**
	 * Init view and get all tasks from config
	 */
	$scope.init = function () {
 		console.log(TAG + "init");

		getAllTasks().then(function (result) {
			if(!result.hasOwnProperty('empty')) {
				console.log(result);
				$scope.taskList = result;
			} else {
				$scope.taskListEmpty = true;
			}
		}, function (failure) {
			console.log(TAG + failure);
		});
	};

 	/**
 	 * Show dialog for adding components
 	 * @param  {event} ev
 	 */
 	$scope.showAddTaskDialog = function(ev) {
 		console.log($scope.taskList);
 		$mdDialog.show({
 			controller: DialogController,
 			templateUrl: 'views/tasks/addTask_dialog.html',
 			targetEvent: ev,
 		})
 		.then(function (answer) {
 			console.log($scope.taskList);
 			addTask(answer);
 		}, function() {
 			console.log(TAG + "cancelled");
 		});
 	};
 
 	/**
 	 * Runs the selected task with the given command and parameters
 	 * @param  {task} task 
 	 */
 	$scope.runTask = function (taskToRun) {
 		console.log(TAG + "runTask");
 		console.log(taskToRun);

		$scope.runButton = true;

		TaskService.executeTask(taskToRun.command, localStorage.currentProjectPath).then(function (result) {
			$scope.runButton = false;
			displayAlertBox("success", result.msg);
		}, function (failure) {
			$scope.runButton = false;
			displayAlertBox("error", failure.msg);
		});
 	};

 	/**
 	 * Edit the selected task
 	 * @param  {task} task 
 	 */
 	$scope.editTask = function (taskToEdit) {
 		console.log(TAG + "editTask");
 		//TODO open modal with current information
 	};

 	/**
 	 * Delete selected task from list and config
 	 * @param  {object} taskToDelete
 	 */
 	$scope.deleteTask = function (taskToDelete) {
 		console.log(TAG + "deleteTask");
 		console.log(taskToDelete);

 		var stopIt = false;

 		for (var i = 0; i < $scope.taskList.length && !stopIt; i++) {
 			if(taskToDelete.id == $scope.taskList[i].id) {
 				var stopIt = true;
 				$scope.taskList.splice(i, 1);

 				saveConfig(taskConfigPath, $scope.taskList).then(function (result) {
 					console.log(result);
					$scope.successMessage = "Task '" + taskToDelete.name + "' deleted.";
					$("#successBox").show();
 				}, function (failure) {
 					console.log(TAG + failure);
 					$scope.errorMessage = failure;
 					$scope.$apply();
 					$("#errorBox").show();
 				});
 			}
 		};
 	};
}])
function DialogController($scope, $mdDialog) {

	//make sure that one radiobutton is always selected
/*	$scope.task = {
		platform: 'webview'
	};*/

	$scope.hide = function() {
		$mdDialog.hide();
	};
	$scope.cancel = function() {
		$mdDialog.cancel();
	};
	$scope.answer = function(answer) {
		$mdDialog.hide(answer);
  };
};