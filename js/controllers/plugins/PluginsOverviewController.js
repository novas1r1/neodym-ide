/**
 * Copyright aaronprojects GmbH (www.aaronprojects.de), 2015
 * Distributed under the MIT License.
 * (See accompanying file LICENSE or copy at http://opensource.org/licenses/MIT)
 * Author: Verena Zaiser (verena.zaiser@aaronprojects.de)
 * Description: This controller includes all functionality to manage plugins.
 */
angular.module('neodym.controllers')
.controller('PluginsOverviewController', ['$scope', '$http', '$q', '$mdToast', 'ProjectService', 'FileService', 'TaskService', 
	function ($scope, $http, $q, $mdToast, ProjectService, FileService, TaskService) {

	var TAG = "PluginsOverviewController: ";

	//required modules 
	var gui = require('nw.gui');

	//all installed plugins
	$scope.installedPlugins = [];
	
	//all plugins matching search query
	$scope.searchResults = [];

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
	 * Get package.json for each plugin
	 * @param  {string} dir
	 * @return {object} json
	 */
	var getPluginInformation = function(dir) {
		console.log(TAG + "getPluginInformation");
		
		var deferred = $q.defer();

		FileService.readFile(localStorage.currentProjectPath + "/plugins/" + dir + "/package.json").then(function (result) {
        	var plugin = JSON.parse(result.success);

			checkForUpdates(plugin).then(function (result) {
				if(result.hasOwnProperty('update')) {
					if(!result.update) {
						plugin.update = false;
					} else {
						plugin.update = true;
					}
				}
        		$scope.installedPlugins.push(plugin);
			}, function (failure) {
				plugin.update = false;
			});

            deferred.resolve(plugin);
		}, function (failure) {
			deferred.reject({
				error:failure.error,
				msg:failure.msg
			});
		});

        return deferred.promise;
	};

	/**
	 * Get all installed plugins and their information
	 * @param  {string} path to the plugin
	 * @return {object} deferred
	 */
	var getAllPlugins = function(path) {
		console.log(TAG + "getAllPlugins");

		var deferred = $q.defer();

		FileService.readDirectory(path).then(function (result) {
			console.log(result);

			for(var i = 0; i < result.success.length; i++) {

				//check if plugin is a directory
				if(FileService.isDirectory(path + result.success[i])) {
					getPluginInformation(result.success[i]);
				}
			}

            deferred.resolve($scope.installedPlugins);
		}, function (failure) {
			deferred.reject({
				error:failure.error,
				msg:failure.msg
			});
		});

        return deferred.promise;
	};


	/**
	 * Get all installed plugins and their information
	 * @param  {string} path to the plugin
	 * @return {object} deferred
	 */
	var getAllAndroidPlugins = function() {
		console.log(TAG + "getAllAndroidPlugins");

		var deferred = $q.defer();

		FileService.readFile(localStorage.currentProjectPath + "/plugins/android.json").then(function (result) {
        	console.log(result);
        	var plugins = JSON.parse(result.success);
        	deferred.resolve(plugins);
			/*checkForUpdates(plugin).then(function (result) {
				if(result.hasOwnProperty('update')) {
					if(!result.update) {
						plugin.update = false;
					} else {
						plugin.update = true;
					}
				}
        		$scope.installedPlugins.push(plugin);
			}, function (failure) {
				plugin.update = false;
			});

            deferred.resolve(plugin);*/
		}, function (failure) {
			deferred.reject({
				error:failure.error,
				msg:failure.msg
			});
		});

        return deferred.promise;
	};

	/**
	 * Check if update for selected plugin is available
	 * @param  {object} pluginToUpdate 
	 * @return {boolean} update available or not
	 */
	var checkForUpdates = function(localPlugin) {
		console.log(TAG + "checkForUpdates");

		var deferred = $q.defer();

		$http.get("http://plugins.cordova.io/api/" + localPlugin.name)
        .success(function (data, status, headers, config) {
        	//get current plugin version
        	var localPluginVersion = localPlugin.version.split(".").join("");
        	var remotePluginVersion = data["dist-tags"].latest.split(".").join("");

        	//check if newer plugin version is available on remote
			if(localPluginVersion < remotePluginVersion) {
				console.log("Update available");
				deferred.resolve({
					update: true
				});
			} else {
				deferred.resolve({
					update: false
				});
			}
        })
        .error(function (data, status, headers, config) {
            deferred.reject(data);
        });

        return deferred.promise;
	};

	/**
	 * Check out all installed plugins and their version
	 */
	$scope.init = function () {
		console.log(TAG + "init");

		getAllPlugins(localStorage.currentProjectPath + "/plugins/").then(function (result) {
			$scope.installedPlugins = result;
		}, function (failure) {
			displayAlertBox("error", failure.msg);
		});
		/*
		getAllAndroidPlugins().then(function (result) {
			$scope.installedPlugins = result.installed_plugins;
		}, function (failure) {
			displayAlertBox("error", failure.msg);
		});*/
	};

	/**
	 * Search cordova plugins on their page and display results
	 * @param  {string} query
	 * @return {array} found plugins
	 */
	$scope.searchPlugins = function (query) {
		console.log(TAG + "searchPlugins");

		$scope.searchButton = true;

		$scope.searchStarted = true;

		$scope.searchResults = [];

		var searchRequest = "http://plugins.cordova.io/_list/search/search?startkey=%22" + query + "%22&endkey=%22" + query + "ZZZZZZZZZZZZZZ%22&limit=25";

		$http.get(searchRequest)
        .success(function (data, status, headers, config) {
			$scope.searchButton = false;

			if(data !== null) {
	        	//get number plugins matching search
	        	$scope.numberOfPluginsFound = data.rows.length;

	        	if($scope.numberOfPluginsFound < 1) {
					displayAlertBox("error", "No plugins matching your search '" + query + "' could be found.");
	        	}
					
	        	//add plugins to searchresult
	        	for (var i = 0; i < data.rows.length; i++) {
	        		$scope.searchResults.push(data.rows[i].value);
	        	}
			}            
        })
        .error(function (data, status, headers, config) {
			$scope.searchButton = false;
			
			displayAlertBox("error", "Something went wrong. Please try again or contact our support.");
        });
	};

	/**
	 * Install plugin via github link
	 * @param {string} pluginToInstallUrl
	 */
	$scope.addPluginFromUrl = function (pluginToInstallUrl) {
		console.log(TAG + "installPlugin");

		$scope.installButton = true;

		TaskService.executeTask("cordova plugin add " + pluginToInstallUrl, localStorage.currentProjectPath).then(function (result) {
			$scope.installButton = false;
			displayAlertBox("success", "Plugin " + pluginToInstallUrl + " successfully added.");
		}, function (failure) {
			$scope.installButton = false;
			displayAlertBox("error", "Error: Installing plugin " + pluginToInstallUrl + " failed." + failure.msg);
		});
	};

	/**
	 * Install selected plugin
	 * @param  {object} plugin to install
	 */
	$scope.installPlugin = function (pluginToInstall) {
		console.log(TAG + "installPlugin");

		$scope.installButton = true;

		TaskService.executeTask("cordova plugin add " + pluginToInstall.name, localStorage.currentProjectPath).then(function (result) {
			$scope.installButton = false;
			displayAlertBox("success", "Plugin " + pluginToInstall.name + " successfully added.");
			$scope.init();
		}, function (failure) {
			$scope.installButton = false;
			displayAlertBox("error", "Error: Installing plugin " + pluginToInstall.name + " failed." + failure.msg);
		});
	};

	/**
	 * Uninstall selected plugin
	 * @param  {object} plugin to uninstall
	 */
	$scope.uninstallPlugin = function (pluginToUninstall) {
		console.log(TAG + "uninstallPlugin");
		console.log(pluginToUninstall);

		$scope.uninstallButton = true;
		
		TaskService.executeTask("cordova plugin remove " + pluginToUninstall.name, localStorage.currentProjectPath).then(function (result) {
			$scope.installButton = false;
			displayAlertBox("success", "Plugin " + pluginToUninstall.name + " successfully added.");
		}, function (failure) {
			$scope.installButton = false;
			displayAlertBox("error", "Error: Installing plugin " + pluginToUninstall.name + " failed." + failure.msg);
		});
	};

	/**
	 * Uninstall selected plugin
	 * @param  {object} plugin to uninstall
	 */
	$scope.updatePlugin = function (pluginToUpdate) {
		console.log(TAG + "updatePlugin");
		console.log(pluginToUpdate);
		
		$scope.updateButton = true;

		TaskService.executeTask("cordova plugin add " + pluginToUpdate.name, localStorage.currentProjectPath).then(function (result) {
			$scope.updateButton = false;
			displayAlertBox("success", "Plugin " + pluginToUpdate.name + " successfully added.");
		}, function (failure) {
			$scope.updateButton = false;
			displayAlertBox("error", "Error: Installing plugin " + pluginToUpdate.name + " failed." + failure.msg);
		});
	};

	/**
	 * Visit plugin page (github etc.) to get more information
	 * @param  {object} pluginToVisit
	 */
	$scope.visitPluginPage = function (pluginToVisit) {
		console.log(TAG + "visitPluginPage");
		gui.Shell.openExternal("http://plugins.cordova.io/#/package/" + pluginToVisit.name);
	};

}]);