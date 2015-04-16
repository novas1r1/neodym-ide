/**
 * Copyright aaronprojects GmbH (www.aaronprojects.de), 2015
 * Distributed under the MIT License.
 * (See accompanying file LICENSE or copy at http://opensource.org/licenses/MIT)
 * Author: Verena Zaiser (verena.zaiser@aaronprojects.de)
 * Description: This controller helps to easily create resources and a release-build for your app store entry.
 */
angular.module('neodym.controllers')
.controller('ReleaseOverviewController', ['$scope', '$q', '$mdToast', 'TaskService', 'FileService', 
	function ($scope, $q, $mdToast, TaskService, FileService) {

	// logging
	var TAG = 'ReleaseOverviewController: ';

	$scope.aliasName = "";
	$scope.apkName = "";

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
	 * Init view
	 */
	$scope.init = function() {
		console.log(TAG + "init");	
	};

	/**
	 * Set the directory path on changing it
	 * @param {[type]} value [description]
	 */
	$scope.setSplashResource = function(value) {
		console.log(TAG + 'setSourcePath');

		$scope.splashPath = value.files[0].path;
	};

	/**
	 * Set the directory path on changing it
	 * @param {[type]} value [description]
	 */
	$scope.setIconResource = function(value) {
		console.log(TAG + 'setSourcePath');

		$scope.iconPath = value.files[0].path;
	};

	/**
	 * Upload resource
	 * //TODO check if file already exists, clear folder?
	 * @param  {[string]} type 
	 */
	$scope.uploadResources = function (type) {
		console.log(TAG + "uploadResources: " + type);

		var sourceFileName;
		var target;
		var renamedTarget;
		var sourcePath;

		if(type == "icon") {
			sourcePath = $scope.iconPath;

			sourceFileName = $scope.iconPath.split("\\").pop();
			target = localStorage.currentProjectPath +"/resources/" + sourceFileName;
			//TODO check file ending
			renamedTarget = localStorage.currentProjectPath +"/resources/icon.png";
		} else {
			sourcePath = $scope.splashPath;

			sourceFileName = $scope.splashPath.split("\\").pop();
			target = localStorage.currentProjectPath +"/resources/" + sourceFileName;
			renamedTarget = localStorage.currentProjectPath +"/resources/splash.png";
		}

		//copy file from one source to target directory
		FileService.copyFile(sourcePath, target).then(function (result) {
			
			//rename to icon.x or splash.x
			FileService.renameFile(target, renamedTarget).then(function (result) {
				displayAlertBox("success", result.msg);
			}, function (failure) {
				displayAlertBox("error", failure);
			});

		}, function (failure) {
			displayAlertBox("error", failure);
		});
	};


	/**
	 * Generate icons and splash screens
	 * Android and iOS icons are the same
	 */
	$scope.generateResources = function () {
		console.log(TAG + "generateResources");
		$scope.generateButton = true;
		
		TaskService.executeTask("ionic resources", localStorage.currentProjectPath).then(function (result) {
			$scope.generateButton = false; 
			displayAlertBox("success", result.msg);
		}, function (failure) {
			$scope.generateButton = false; 
			displayAlertBox("error", failure.msg);
		});
	};

	/**
	 * Generate icons and splash screens
	 * Android and iOS icons are the same
	 */
	$scope.generateReleaseBuild = function () {
		console.log(TAG + "generateReleaseBuild");
		$scope.generateBuildButton = true;
		
		// remove console plugin
		TaskService.executeTask("cordova plugin rm org.apache.cordova.console", localStorage.currentProjectPath).then(function (result) {
			TaskService.executeTask("cordova build --release android", localStorage.currentProjectPath).then(function (result) {

				// if no private key available
				if(true) {
					TaskService.executeTask("keytool -genkey -v -keystore my-release-key.keystore -alias " + $scope.aliasName + " -keyalg RSA -keysize 2048 -validity 10000", localStorage.currentProjectPath).then(function (result) {
						// sign app with key
						TaskService.executeTask("jarsigner -verbose -sigalg SHA1withRSA -digestalg SHA1 -keystore my-release-key.keystore "+ $scope.apkName + "-release-unsigned.apk " + $scope.aliasName, localStorage.currentProjectPath).then(function (result) {
							
							// minimize apk
							TaskService.executeTask("zipalign -v 4 "+ $scope.apkName +"-release-unsigned.apk " + $scope.apkName +".apk", localStorage.currentProjectPath).then(function (result) {
								$scope.generateBuildButton = false; 
								displayAlertBox("success", result.msg);
							}, function (failure) {
								$scope.generateBuildButton = false; 
								displayAlertBox("error", failure.msg);
							});
						}, function (failure) {
							$scope.generateBuildButton = false; 
							displayAlertBox("error", failure.msg);
						});
					}, function (failure) {
						$scope.generateBuildButton = false; 
						displayAlertBox("error", failure.msg);
					});
				// private key available
				} else {
					// sign app with key
					TaskService.executeTask("jarsigner -verbose -sigalg SHA1withRSA -digestalg SHA1 -keystore my-release-key.keystore "+ $scope.apkName + "-release-unsigned.apk " + $scope.aliasName, localStorage.currentProjectPath).then(function (result) {
						
						// minimize apk
						TaskService.executeTask("zipalign -v 4 "+ $scope.apkName +"-release-unsigned.apk " + $scope.apkName +".apk", localStorage.currentProjectPath).then(function (result) {
							$scope.generateBuildButton = false; 
							displayAlertBox("success", result.msg);
						}, function (failure) {
							$scope.generateBuildButton = false; 
							displayAlertBox("error", failure.msg);
						});
					}, function (failure) {
						$scope.generateBuildButton = false; 
						displayAlertBox("error", failure.msg);
					});
				}
			}, function (failure) {
				$scope.generateBuildButton = false; 
				displayAlertBox("error", failure.msg);
			});
		}, function (failure) {
			$scope.generateBuildButton = false; 
			displayAlertBox("error", failure.msg);
		});
	};

	/**
	 * Save current description to project config
	 */
	$scope.saveDescription = function() {
		$scope.successMessage = "Project description was successfully saved!";
		$scope.$apply();

		displayAlertBox("success", "Description successfully saved.");
	};

}]);