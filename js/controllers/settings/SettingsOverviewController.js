/**
 * Copyright aaronprojects GmbH (www.aaronprojects.de), 2015
 * Distributed under the MIT License.
 * (See accompanying file LICENSE or copy at http://opensource.org/licenses/MIT)
 * Author: Verena Zaiser (verena.zaiser@aaronprojects.de)
 * Description: This controller helps to manage all project settings.
 */
angular.module('neodym.controllers')
.controller('SettingsOverviewController', ['$scope', '$q', '$mdToast', 'ProjectService', 'FileService', 
	function ($scope, $q, $mdToast, ProjectService, FileService) {
 	
 	// logging
 	var TAG = "SettingsOverviewController: ";

	var androidManifestPath = localStorage.currentProjectPath + "/platforms/android/AndroidManifest.xml";
	var configXMLPath = localStorage.currentProjectPath + "/config.xml";

	var androidManifestData;
	var configXMLData;

	//needed to translate from json <-> xml
	var x2js = new X2JS();
	var pd = require('pretty-data').pd;

	// android settings
	$scope.android = {
		debuggable: false,
		currentMinSDK: 10,
		currentTargetSDK: 12
	};

	$scope.accessList = [
		{name: "*"},
		{name: "* an"},
		{name: "* liste"},
		{name: "* test"},
		{name: "* alles"}
	];

	$scope.sdkList = [
		{name: 10}, 
		{name: 11}, 
		{name: 12}, 
		{name: 13}, 
		{name: 14}, 
		{name: 15}, 
		{name: 16}, 
		{name: 17}
	]; 

	$scope.configuration = {
		name: '',
		curren: 'development'
	};

	$scope.configurationList = [
		{name: 'development'}, 
		{name: 'integration'}, 
		{name: 'staging'}, 
		{name: 'production'} 
	]; 
	
	$scope.configXML = {
		currentAppVersion: "1.1.0",
		currentAppId: "com.test.app",
		currentOrientation: "landscape"
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
	 * Save the edited manifest file to the project directory
	 * @param  {path} path 
	 * @param  {object} data 
	 * @return {object} deferred
	 */
	var saveFile = function (path, data) {
 		console.log(TAG + "saveFile");
 		console.log(path);
 		console.log(data);

		var fileAsJson = x2js.json2xml_str(data);

		var deferred = $q.defer();

		var fileAsXml = pd.xml(fileAsJson);
		console.log(fileAsXml);

		FileService.writeFile(path, fileAsXml).then(function (result) {
			displayAlertBox("success", result.msg);
		}, function (failure) {
			displayAlertBox("error", failure.msg);
		});

		return deferred.promise;
	};

	/**
	 * Parse the android manifest located in platforms/android/
	 * @return {[type]} [description]
	 */
	var parseAndroidManifest = function() {
		console.log(TAG + "parseAndroidManifest");

		var deferred = $q.defer();

		FileService.readFile(androidManifestPath).then(function (result) {
			deferred.resolve(x2js.xml_str2json(result.success));
		}, function (failure) {
			deferred.reject(failure.msg);
		});

		return deferred.promise;
	};

	/**
	 * Parse the android manifest located in platforms/android/
	 * @return {[type]} [description]
	 */
	var parseConfigXML = function() {
		console.log(TAG + "parseConfigXML");

		var deferred = $q.defer();

		FileService.readFile(configXMLPath).then(function (result) {
			console.log(result);
			deferred.resolve(x2js.xml_str2json(result.success));
		}, function (failure) {
			deferred.reject(failure.msg);
		});

		return deferred.promise;
	};

	/**
	 * Init all existing settings for android, ios and general stuff
	 */
 	$scope.init = function () {
 		console.log(TAG + "init");

 		parseAndroidManifest().then(function (result) {
 			console.log(result);
 			androidManifestData = result;
 			$scope.android.debuggable = result["manifest"]["application"]["_android:debuggable"];
 			$scope.android.currentMinSDK = result["manifest"]["uses-sdk"]["_android:minSdkVersion"];
 			$scope.android.currentTargetSDK = result["manifest"]["uses-sdk"]["_android:targetSdkVersion"];
 		}, function(failure) {
 			console.log(TAG + failure);
 		});

 		parseConfigXML().then(function (result) {
 			var orientationExists = false;

 			console.log(result);
 			configXMLData = result;

 			$scope.configXML.currentAppVersion = configXMLData["widget"]["_version"];
 			$scope.configXML.currentAppId = configXMLData["widget"]["_id"];
 			$scope.configXML.currentAppName = configXMLData["widget"]["name"];

 			$scope.configXML.currentAuthorName = configXMLData["widget"]["author"]["__text"];
 			$scope.configXML.currentAuthorLink = configXMLData["widget"]["author"]["_href"];
 			$scope.configXML.currentAuthorEmail = configXMLData["widget"]["author"]["_email"];

 			$scope.configXML.currentAccesses = configXMLData["widget"]["access"]["_origin"];

 			$scope.configXML.orientation = function() {
 				for(var i = 0; i < configXMLData["widget"]["preference"].length; i++) {
 					if(configXMLData["widget"]["preference"][i]["_name"] == "Orientation") {
 						console.log("Found orientation");
 						orientationExists = true;
 					}
 				}

 				if(!orientationExists) {
 					configXMLData["widget"]["preference"].push({
 						"_name":"Orientation",
 						"_value":"portrait"
 					});

 					saveFile(configXMLPath, configXMLData).then(function (result) {
 						console.log(TAG + result);
 					}, function (failure) {
 						console.log(TAG + failure);
 					});
 				}

 			};

 			$scope.configXML.orientation();

 		}, function(failure) {
 			displayAlertBox("error", failure.msg);
 		});
	};

	/**
	 * Change the app version in the manifest file
	 * @param  {object} newVersion object containing new major, minor, patch and build number
	 */
	$scope.changeAppVersion = function(newVersion) {
		console.log(TAG + "changeAppVersion");
		console.log(newVersion);

		if(typeof(newVersion.major) == "undefined") {
			newVersion.major = 0;
		}

		if(typeof(newVersion.minor) == "undefined") {
			newVersion.minor = 0;
		}

		if(typeof(newVersion.patch) == "undefined") {
			newVersion.patch = 0;
		}

		if(typeof(newVersion.build) == "undefined") {
			newVersion.build = 0;
		}

		configXMLData["widget"]["_version"] = newVersion.major + "." + newVersion.minor + "." + newVersion.patch;

		//save android manifest
		saveFile(androidManifestPath, androidManifestData).then(function (result) {
			console.log(TAG + result);
		}, function (failure) {
			console.log(TAG + failure);
		});

		//save config xml
		saveFile(configXMLPath, configXMLData).then(function (result) {
			console.log(TAG + result);
		}, function (failure) {
			console.log(TAG + failure);
		});
	};

	/**
	 * Change debuggable state
	 * @param  {boolean} state 
	 */
	$scope.changeAndroidDebuggable = function(state) {
		console.log(TAG + "changeAndroidDebuggable");

		androidManifestData["manifest"]["application"]["_android:debuggable"] = state;

		saveFile(androidManifestPath, androidManifestData).then(function (result) {
			console.log(result);
		}, function (failure) {
			console.log(failure);
		});
	};

	/**
	 * Save all changes made
	 * @param  {object} configXMLData
	 */
	$scope.saveChanges = function (configXMLData) {
		// body...
	};

}]);