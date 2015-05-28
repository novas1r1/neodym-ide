/**
 * Copyright aaronprojects GmbH (www.aaronprojects.de), 2015
 * Distributed under the MIT License.
 * (See accompanying file LICENSE or copy at http://opensource.org/licenses/MIT)
 * Author: Verena Zaiser (verena.zaiser@aaronprojects.de)
 * Description: This controller includes all navigation points and some main functionality which 
 * needs to be displayed in the navigation.
 */
angular.module('neodym.controllers')
	.controller('HeaderController', ['$scope', '$location', 'TaskService', 
	function ($scope, $location, TaskService) {

	// logging variable
	var TAG = "HeaderController: ";

	// required for opening the explorer
	var open = require('open');

	// the current project directory path
	$scope.currentProject = localStorage.currentProjectPath;

	// all navigation items
	$scope.items = [
	{
		name: "Home",
		icon: "home",
		active: "active",
		view: "/home"
	},
	{
		name: "Project",
		icon: "info_outline",
		active: "",
		view: "/project"
	},
	{
		name: "Settings",
		icon: "settings",
		active: "",
		view: "/settings"
	},
	{
		name: "Components",
		icon: "list",
		active: "",
		view: "/components"
	},
	{
		name: "Tasks",
		icon: "play_circle_outline",
		active: "",
		view: "/tasks"
	},
	{
		name: "Code Analysis",
		icon: "trending_up",
		active: "",
		view: "/codeanalysis"
	},
	{
		name: "Libraries",
		icon: "folder_shared",
		active: "",
		view: "/libraries"
	},
	{
		name: "Plugins",
		icon: "file_upload",
		active: "",
		view: "/plugins"
	},
	{
		name: "Testing",
		icon: "check_circle",
		active: "",
		view: "/testing"
	},
	{
		name: "Release",
		icon: "file_upload",
		active: "",
		view: "/release"
	}
	];

	/**
	 * set navigation active on click
	 * @param {item} item
	 */
	$scope.setActive = function(item) {
		console.log(TAG + "setActive: " + item.name);

		for (var i = 0; i < $scope.items.length; i++) {
			if($scope.items[i].name == item.name) {
				item.active = "active";
				$location.path(item.view);
			} else {
				$scope.items[i].active = "";
			}
		}
	};

	/**
	 * Opens a new command prompt for entering manual commands
	 * TODO: different for linux, mac os x
	 */
	$scope.openShell = function () {
		console.log(TAG + "openShell");

		TaskService.executeTask("C:/Windows/System32/cmd.exe", localStorage.currentProjectPath).then(function (result) {
			console.log('worked');
		}, function (failure) {
			console.log('error');
		});
	};

	/**
	 * Open folder in explorer
	 */
	$scope.openFolder = function () {
		console.log(TAG + "openFolder");

		open(localStorage.currentProjectPath, function (err) {
		  if (err) throw err;
		});
	};
}]);