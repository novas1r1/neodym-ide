/**
 * Copyright aaronprojects GmbH (www.aaronprojects.de), 2015
 * Distributed under the MIT License.
 * (See accompanying file LICENSE or copy at http://opensource.org/licenses/MIT)
 * Author: Verena Zaiser (verena.zaiser@aaronprojects.de)
 * Description: This controller helps to easily add and link new libraries via url or file upload. 
 */
angular.module('neodym.controllers')
.controller('LibrariesOverviewController', ['$scope', '$q', '$mdDialog', '$mdToast', 'FileService', 
	function ($scope, $q, $mdDialog, $mdToast, FileService) {

	var TAG = "LibrariesOverviewController: ";

	//index file path which gets parsed
	var indexPath = localStorage.currentProjectPath + "/www/index.html";

    $scope.data = {
    	id: '',
    	name: '',
    	description: '',
    	directory: '',
    	version: '0.0.1'
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
     * Parse index.html from project and extract all existing components
     * @param  {string} componentType (controller, service, directive, filter)
     * @return {array} all components matching the given componenttype
     */
    var getAllLibraries = function () {
    	console.log(TAG + 'getAllLibraries');

    	var libraryRegionRegex = /<!-- BEGIN LIBRARIES -->([\w\W]*)<!-- END LIBRARIES -->/i;
		var libraryNameRegex = /\<script type="text\/javascript" src="lib\/(.*)"\>\<\/script\>/i;
		var allLibraryLines;
		var libraryArray = [];

    	var deferred = $q.defer();

    	FileService.readFile(indexPath).then(function (result) {
    		var libraryList = [];
    			
			//get content between regex
			allLibraryLines = result.success.match(libraryRegionRegex);
			console.log(allLibraryLines);

			if(allLibraryLines !== null) {
				//parse result into array
				libraryArray = allLibraryLines[1].split("\n");

				//run through array and extract component names
				for (var i = 0; i < libraryArray.length; i++) {
					if(libraryArray[i].length > 0) {
						var libraryName = libraryArray[i].match(libraryNameRegex);
						if(libraryName != null) {
							libraryList.push({
								name: libraryName[1]
							});
						}
					}
				};
				deferred.resolve(libraryList);
			} else {
				deferred.reject("No libraries available");
			}
    	}, function (failure) {
    		deferred.reject(failure.msg);
    	});

    	return deferred.promise;
    };

    var addLibraryReference = function (libraryName, target) {
    	var deferred = $q.defer();

    	//1. get all libraries
		getAllLibraries().then(function (result) {
			console.log(result);

			//2. add new component to list
			result.push({
				name:libraryName
			});

			//3. sort list
			//TODO
			
			//4. make complete line out of each element in list
			var linesToAdd = '\n<!-- please dont remove this line -->\n';
			for (var i = 0; i < result.length; i++) {
				linesToAdd += '<script type="text/javascript" src="lib/' + result[i].name + '"></script>' + '\n';
			};

			//5. get everything between area
			FileService.readFile(indexPath).then(function (result) {

				var dataToReplace = result.success.match(/(?:<!-- BEGIN LIBRARIES -->)([\w\W]*)(?:<!-- END LIBRARIES -->)/i);
				
				if(dataToReplace !== null) {
					//6. replace everything between BEGIN and END with new string
					var content = result.success.replace(dataToReplace[1], linesToAdd);

					//7. write new content to file
					FileService.writeFile(indexPath, content).then(function (result) {
						//copy file from one source to target directory
						FileService.copyFile($scope.librarySource, target).then(function (result) {
							deferred.resolve(result);
						}, function (failure) {
							deferred.reject(failure);
						});
					}, function (failure) {
						deferred.reject(failure);
					});
				} else {
					deferred.reject("Something is wrong with your index.html. Please make sure to reset its infrastructure.");
				}
			}, function (failure) {
				deferred.reject(failure);
			});
		}, function (failure) {
			deferred.reject(failure);
		});

    	return deferred.promise;

    };

    /**
     * Inits libraries
     */
    $scope.init = function () {
    	console.log(TAG + "init");

    	getAllLibraries().then(function (result) {
    		console.log(result);
    		$scope.libraryList = result;
    	}, function (failure) {
    		console.error(TAG + "ERROR getting libraries " + failure);
    	});
    };

	/**
	 * Add library from url/git repository
	 * Add to index.html and add file to lib/ folder
	 * @param  {string} url
	 */
	$scope.addLibraryFromUrl = function(url) {
		console.log(TAG + "addLibrary: " + url);

		var destination = "";
		destination = localStorage.currentProjectPath +"/www/lib/";

	 	var libraryName = url.split(/[\/]+/).pop();

    	FileService.downloadFile(url, destination, libraryName).then(function (result) {
    		addLibraryReference(libraryName).then(function (result) {
				displayAlertBox("success", result.msg);
    		}, function (failure) {
    			displayAlertBox("error", failure);
    		});
    	}, function (failure) {
			displayAlertBox("error", failure);
    	});
	};

	/**
	 * Add a local library
	 * e.g. C:\Development\webAppMasterthesis\code\js\lib\bootstrap.min.js
	 */
	$scope.addLocalLibrary = function () {
		console.log(TAG + "addLocalLibrary: " + $scope.librarySource);

		var libraryName = "";
		libraryName = $scope.librarySource.split("\\").pop(); 
		var target = "";
		target = localStorage.currentProjectPath +"/www/lib/" + libraryName;

		addLibraryReference(libraryName, target).then(function (result) {
			displayAlertBox("success", result.msg);
		}, function (failure) {
			displayAlertBox("error", failure.msg);
		});

	};

	/**
	 * Set the directory path on changing it
	 * @param {[type]} value [description]
	 */
	$scope.setDirectoryPath = function(value) {
		console.log(TAG + 'setLibrarySource');
		$scope.librarySource = value.files[0].path;
	};

	/**
	 * Delete selected component
	 * @param  {srting} componentType
	 * @param  {string} componentName
	 */
	$scope.deleteLibrary = function(libraryName) {
		console.log(TAG + "deleteLibrary " + libraryName);

		//read file and delete library line
		findAndReplaceLibrary(libraryName).then(function (result) {
				var filePath = localStorage.currentProjectPath + "/www/lib/" + libraryName;
				console.log(filePath);

				//delete line in index.html
				FileService.writeFile(indexPath, result).then(function (result) {
					//delete file
					FileService.deleteFile(filePath).then(function (result) {
						displayAlertBox("success", result.msg);
					}, function (failed) {
						displayAlertBox("error", failed.msg);
					});
				}, function (failure) {
					displayAlertBox("error", failure.msg);
				});
		}, function (failure) {
			displayAlertBox("error", failure.msg);
		});
	};

	/**
	 * Add controller to the list
	 */
	var findAndReplaceLibrary = function(libraryName) {
		console.log(TAG + "deleteLibrary " + libraryName);

		var deferred = $q.defer();

		var libraryLine = '<script type="text/javascript" src="lib/' + libraryName + '.js"></script>' + '\n';

		//5. get complete index file
		FileService.readFile(indexPath).then(function (result) {
			var regex = new RegExp('\<script type="text\/javascript" src="lib\/' + libraryName + '"\>\<\/script\>' + '\n', 'i');

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
 
}]);
