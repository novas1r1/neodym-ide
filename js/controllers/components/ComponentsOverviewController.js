/**
 * Copyright aaronprojects GmbH (www.aaronprojects.de), 2015
 * Distributed under the MIT License.
 * (See accompanying file LICENSE or copy at http://opensource.org/licenses/MIT)
 * Author: Verena Zaiser (verena.zaiser@aaronprojects.de)
 * Description: This controller lists all existing components and provides the functionality to add new ones.
 */
angular.module('neodym.controllers')
.controller('ComponentsOverviewController', ['$scope', '$q', '$mdDialog', '$mdToast', '$animate','FileService', 
	function ($scope, $q, $mdDialog, $mdToast, $animate, FileService) {

	// logging
	var TAG = 'ComponentsOverviewController: ';

	//lists of all components
	$scope.controllerList = [];
	$scope.serviceList = [];
	$scope.directiveList = [];
	$scope.filterList = [];

	var toast;
	
	//index file path which gets parsed
	var indexPath = localStorage.currentProjectPath + "/www/index.html";

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
	 * Get all controllers, services, directives, filters from index.html
	 */
	$scope.init = function() {
		console.log(TAG + "init");

		// get all controllers registered in index.html
		getAllComponents("controllers").then(function (result) {
			if(!result.hasOwnProperty('empty')) {
				$scope.controllerList = result;
				console.log("CONTROLLERS");
				console.log($scope.controllerList);
			} else {
				$scope.controllerListEmpty = true;
			}
			getAllComponents("services").then(function (result) {
				if(!result.hasOwnProperty('empty')) {
					$scope.serviceList = result;
				} else {
					$scope.serviceListEmpty = true;
				}
				getAllComponents("directives").then(function (result) {
					if(!result.hasOwnProperty('empty')) {
						$scope.directiveList = result;
					} else {
						$scope.directiveListEmpty = true;
					}
					getAllComponents("filters").then(function (result) {
						if(!result.hasOwnProperty('empty')) {
							$scope.filterList = result;
						} else {
							$scope.filterListEmpty = true;
						}
					}, function (failure) {
						console.log(TAG + failure);
					});
				}, function (failure) {
					console.log(TAG + failure);				
				});
			}, function (failure) {
				console.log(TAG + failure);
			});
		}, function (failure) {
			console.log(TAG + failure);
		});
	};

	/**
	 * Parse index.html from project and extract all existing components
	 * @param  {string} componentType (controller, service, directive, filter)
	 * @return {array} all components matching the given componenttype
	 */
	var getAllComponents = function(componentType) {
		console.log(TAG + 'getAllComponents of type ' + componentType);

		// get content between <!-- BEGIN [COMPONENT] --> and <!-- END [COMPONENT] --> in index.html
		var componentRegionRegex;

		// extract name of each component
		var componentNameRegex;

		// content between first regex
		var allComponentLines;

		// all components found matching componenttype collected in one array
		var componentArray = [];

		var deferred = $q.defer();

		switch(componentType) {
			case "controllers":
				componentRegionRegex = /<!-- BEGIN CONTROLLERS -->([\w\W]*)<!-- END CONTROLLERS -->/i;
				componentNameRegex = /\<script type="text\/javascript" src="js\/controllers\/(.*)\.js"\>\<\/script\>/i;
				break;
			case "services":
				componentRegionRegex = /<!-- BEGIN SERVICES -->([\w\W]*)<!-- END SERVICES -->/i;
				componentNameRegex = /\<script type="text\/javascript" src="js\/services\/(.*)\.js"\>\<\/script\>/i;
				break;
			case "directives":
				componentRegionRegex = /<!-- BEGIN DIRECTIVES -->([\w\W]*)<!-- END DIRECTIVES -->/i;
				componentNameRegex = /\<script type="text\/javascript" src="js\/directives\/(.*)\.js"\>\<\/script\>/i;
				break;
			case "filters":
				componentRegionRegex = /<!-- BEGIN FILTERS -->([\w\W]*)<!-- END FILTERS -->/i;
				componentNameRegex = /\<script type="text\/javascript" src="js\/filters\/(.*)\.js"\>\<\/script\>/i;
				break;
			default:
				componentRegionRegex = null;
				componentNameRegex = null;
				console.error(TAG + "ERROR: no valid component");
				break;
		}

		if(componentRegionRegex !== null && componentNameRegex !== null) {

			FileService.readFile(indexPath).then(function (result) {
				// displayAlertBox("success", result.msg);

				var componentList = [];
				
				//get content between regex
				allComponentLines = result.success.match(componentRegionRegex);

				if(typeof(allComponentLines[1]) !== "undefined") {
					//parse result into array
					componentArray = allComponentLines[1].split("\n");

					//run through array and extract component names
					for (var i = 0; i < componentArray.length; i++) {
						if(componentArray[i].length > 0) {
							var componentName = componentArray[i].match(componentNameRegex);
							if(componentName != null) {
								componentList.push({
									name: componentName[1]
								});
							}
						}
					};
					deferred.resolve(componentList);
				} else {
					//TODO check if this still can happen
					deferred.reject({
						msg:"List is empty"
					});
				}
			}, function (failure) {
				displayAlertBox("error", failure.msg);
			});
		}
		return deferred.promise;
	};

	/**
	 * If component is listed in index.html but doesnt exist in filesystem, tell user to create one
	 */
	$scope.markMissingFiles = function() {
		//TODO check if file exists
		//TODO add button "add file"
	};

	/**
	 * Show dialog for adding components
	 * @param  {event} ev
	 */
	$scope.showAddComponentDialog = function(ev) {
		$mdDialog.show({
			controller: DialogController,
			templateUrl: 'views/components/addComponent_dialog.html',
			targetEvent: ev,
		})
		.then(function (answer) {
			console.log(answer);
			addComponent(answer.type, answer.name);
		}, function() {
			console.log(TAG + "cancelled");
		});
	};

	/**
	 * Add component
	 * Therefore make new component file and add path to the index.html 
	 * @param  {string} componentType (controller, service, directive, filter)
	 * @return {array} all components matching the given componenttype
	 */
	var addComponent = function(componentType, componentName) {
		console.log(TAG + "addComponent type: " + componentType + " name: " + componentName);

		//1. get all components
		getAllComponents(componentType).then(function (result) {
			console.log(result);

			var filePath = localStorage.currentProjectPath + "/www/js/" + componentType + "/" + componentName + ".js";
			var testFilePath = localStorage.currentProjectPath + "/www/tests/unit/" + componentType + "/" + componentName + ".spec.js";

			//2. add new component to list
			result.push({
				name:componentName
			});

			//3. sort list
			//TODO
			
			//4. make complete line out of each element in list
			var linesToAdd = '\n' + '<script type="text/javascript" src="js/'+ componentType + '.js"></script>' + '\n';
			for (var i = 0; i < result.length; i++) {
				linesToAdd += '<script type="text/javascript" src="js/' + componentType + '/' + result[i].name + '.js"></script>' + '\n';
			};

			//5. get everything between area
			FileService.readFile(indexPath).then(function (result) {
				console.log(result);

				switch(componentType) {
					case "controllers":
						var dataToReplace = result.success.match(/(?:<!-- BEGIN CONTROLLERS -->)([\w\W]*)(?:<!-- END CONTROLLERS -->)/i);
						break;
					case "services":
						var dataToReplace = result.success.match(/(?:<!-- BEGIN SERVICES -->)([\w\W]*)(?:<!-- END SERVICES -->)/i);
						break;
					case "directives":
						var dataToReplace = result.success.match(/(?:<!-- BEGIN DIRECTIVES -->)([\w\W]*)(?:<!-- END DIRECTIVES -->)/i);
						break;
					case "filters":
						var dataToReplace = result.success.match(/(?:<!-- BEGIN FILTERS -->)([\w\W]*)(?:<!-- END FILTERS -->)/i);
						break;
					default:
						var dataToReplace = null;
					break;
				}
				
				
				if(dataToReplace !== null) {
					//6. replace everything between BEGIN and END with new string
					var content = result.success.replace(dataToReplace[1], linesToAdd);

					//7. write new content to file
					FileService.writeFile(indexPath, content).then(function (result) {
						//remove last item from name, this will be the file
						var folders = componentName.split("/");
						folders.pop();

						//merge the items back together
						var foldersWithoutFile = "";
						for (var i = 0; i < folders.length; i++) {
							foldersWithoutFile += folders[i] + "/";
						};

						//8. check if folders need to be created
						if(componentName.indexOf("/") > -1) {
							console.log(TAG + "Start creating folders...");
							FileService.createFolders(localStorage.currentProjectPath + "/www/js/" + componentType +"/" + foldersWithoutFile).then(function (result) {
								//create file after folders were created
								FileService.createFile(filePath).then(function (result) {
									//create same folder structure and file in test directory
									FileService.createFolders(localStorage.currentProjectPath + "/www/tests/unit/" + componentType +"/" + foldersWithoutFile).then(function (result) {
										//create test file after folders were created
										var filePath = localStorage.currentProjectPath + "/www/tests/unit/" + componentType + "/" + componentName + ".spec.js";
										FileService.createFile(testFilePath).then(function (result) {
											displayAlertBox("success", result.msg);
											$scope.init();
										}, function (failure) {
											displayAlertBox("error", failure.msg);
										});
									}, function (failure) {
										deferred.reject("Test directories could not be created.");
									});
								}, function (failure) {
									displayAlertBox("error", failure.msg);
								});
							}, function (failure) {
								displayAlertBox("error", failure.msg);
							});
						} else {
							//8. create empty file
							console.log(filePath);
							FileService.createFile(filePath).then(function (result) {
								FileService.createFile(testFilePath).then(function (result) {
									displayAlertBox("success", result.msg);
								}, function (failure) {
									displayAlertBox("error", failure.msg);
								});
							}, function (failure) {
								displayAlertBox("error", failure.msg);
							});
						}
					}, function (failure) {
				    	displayAlertBox("error", failure.msg);
					});
				} else {
					displayAlertBox("error", "Something is wrong with your index.html. Please make sure to reset its infrastructure.");
				}
			}, function (failure) {
				displayAlertBox("error", failure.msg);
			});
		}, function (failure) {
			alert(failure);
		});
	};

	/**
	 * Delete selected component
	 * @param  {srting} componentType
	 * @param  {string} componentName
	 */
	$scope.deleteComponent = function(componentType, componentName) {
		console.log(TAG + "deleteComponent type: " + componentType + " name: " + componentName);

		//read file and delete component line
		findAndReplaceComponent(componentType, componentName).then(function (result) {
				//remove line from index.html
				FileService.writeFile(indexPath, result).then(function (result) {
					//remove file
					var filePath = localStorage.currentProjectPath + "/www/js/" + componentType + "/" + componentName + ".js";
					FileService.deleteFile(filePath).then(function (result) {
						//remove test file
						var testFilePath = localStorage.currentProjectPath + "/www/tests/unit/" + componentType + "/" + componentName + ".spec.js";
						FileService.deleteFile(testFilePath).then(function (result) {
							displayAlertBox("success", result.msg);
						}, function (failed) {
							displayAlertBox("error", failed.msg);
						});
					}, function (failed) {
						displayAlertBox("error", failed.msg);
					});
				}, function (failure) {
			    	displayAlertBox("error", failure.msg);
				});
		}, function (failure) {
			console.error(TAG + failure);
		});
	};

	/**
	 * Add controller to the list
	 */
	var findAndReplaceComponent = function(componentType, componentName) {
		console.log(TAG + "deleteComponent with type " + componentType);
		console.log(componentName);

		var deferred = $q.defer();

		var componentLine;

		switch(componentType) {
			case "controllers":
				componentLine = '<script type="text/javascript" src="js/controllers/' + componentName + '.js"></script>';
				break;
			case "services":
				componentLine = '<script type="text/javascript" src="js/services/' + componentName + '.js"></script>';
				break;
			case "directives":
				componentLine = '<script type="text/javascript" src="js/directives/' + componentName + '.js"></script>';
				break;
			case "filters":
				componentLine = '<script type="text/javascript" src="js/filters/' + componentName + '.js"></script>';
				break;
			default:
				console.log(TAG + "Chosen component does not exist");
				break;
		}

		//5. get complete index file
		FileService.readFile(indexPath).then(function (result) {
			var regex = new RegExp('\<script type="text\/javascript" src="js\/' + componentType + '\/' + componentName + '\.js"\>\<\/script\>', 'i');

			//check if controller exists
			if(result.success.search(regex) > -1) {
				//TODO ask if controller should be really deleted
				//TODO remove newline
				var finalData = result.success.replace(regex, "");
				
				deferred.resolve(finalData);
			}
		}, function (failure) {
			deferred.reject({
				error:failure.error,
				msg:failure.msg
			});
		});

		return deferred.promise;
	};

}])

function DialogController($scope, $mdDialog) {

	//make sure that one radiobutton is always selected
	$scope.component.type = 'controllers';

	//dialogs
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
