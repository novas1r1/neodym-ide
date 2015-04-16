/**
 * Copyright aaronprojects GmbH (www.aaronprojects.de), 2015
 * Distributed under the MIT License.
 * (See accompanying file LICENSE or copy at http://opensource.org/licenses/MIT)
 * Author: Verena Zaiser (verena.zaiser@aaronprojects.de)
 * Description: The fileservice contains all functionalty which has to do with the fileservice. Including creating, deleting, moving, writing and reading files.
 */
angular.module('neodym.services')
	.factory('FileService', ['$q',function ($q) {

		// loggiing
		var TAG = "FileService: ";

		var fs = require('fs.extra');
		var ncp = require('ncp').ncp;
		var mkdirp = require('mkdirp');
		var rmdir = require('rimraf');
    	var http = require('http');

		/**
		 * Read selected file and return content
		 * @param  {string} path
		 * @return {deferred} data or error
		 */
		var readFile = function(path) {
			var deferred = $q.defer();

			fs.readFile(path, 'utf8', function read(err, data) {
				if (err) {
					deferred.reject({
						error:err,
						msg:"Error reading file " + path
					});
				} else if(data) {
					deferred.resolve({
						success:data,
						msg:"File " + path + " successfully loaded."
					});
				}
			});
			return deferred.promise;
		};

		/**
		 * Create empty file at path
		 * @param  {string} path 
		 * @return {deferred} worked or failed
		 */
		var createFile = function(path) {
			var deferred = $q.defer();

			fs.open(path, 'w', function (err, fd) {
				
				if(err) {
					deferred.reject({
						error:err,
						msg:"Error reading file " + path
					});
				} else {
					deferred.resolve({
						success:fd,
						msg:"File " + path + " successfully created."
					});
				}
			});

			return deferred.promise;
		};

		/**
		 * Write to file
		 * @param  {string} path
		 * @param  {object} content
		 * @return {deferred} worked or fail
		 */
		var writeFile = function(path, content) {
			var deferred = $q.defer();

			fs.writeFile(path, content , function(err) {
				if(err) {
					deferred.reject({
						error:err,
						msg:"Error writing file " + path
					});
				} else {
					deferred.resolve({
						success:content,
						msg:"File " + path + " successfully written."
					});
				}
			});

			return deferred.promise;
		};

		/**
		 * Delete file
		 * @param  {string} path
		 * @param  {object} content
		 * @return {deferred} worked or failed
		 */
		var deleteFile = function(path) {
			var deferred = $q.defer();

			fs.unlink(path, function (err) {
				if (err) {
					deferred.reject({
						error:err,
						msg:"Error deleting file " + path + ". Maybe it does not exist?"
					});
				} else {
					deferred.resolve({
						success:true,
						msg:"File " + path + " successfully deleted."
					});
				}
			});

			return deferred.promise;
		};


		/**
		 * Create project by cloning the template folder into the given destination
		 * @param  {string} source
		 * @param  {string} destination
		 * @return {deferred} worked or failed
		 */
		var cloneFolderAndContent = function(source, destination) {
			var deferred = $q.defer();

			ncp.limit = 16;
			ncp(source, destination, function (err) {
				if (err) {
					deferred.reject({
						error:err,
						msg:"Error creating project at " + destination + ". Maybe it already exists?"
					});
				} else {
					deferred.resolve({
						success:true,
						msg:"Project " + destination + " successfully created."
					});
				}
			});
			
			return deferred.promise;
		};

		/**
		 * Read directory and get all directories
		 * @param  {string} path 
		 * @return {deferred} worked or failed
		 */
		var readDirectory = function(path) {
			var deferred = $q.defer();

			fs.readdir(path, function (err, pluginDirs) {
				if (err) {
					deferred.reject({
						error:err,
						msg:"Error reading directory at " + path + "."
					});
				} else {
					deferred.resolve({
						success:pluginDirs,
						msg:"Successfully read all plugin directories at " + path
					});
				}
			});
			
			return deferred.promise;
		};

		/**
		 * Check if object is a directory
		 * @param  {string}  path 
		 * @return {Boolean} true or false
		 */
		var isDirectory = function (path) {
			return fs.lstatSync(path).isDirectory()
		};

		/**
		 * Create directory structure
		 * @param  {string} folderPath 
		 * @return {object} deferred
		 */
		var createFolders = function (folderPath) {
			console.log(TAG + "createFolders");

			var deferred = $q.defer();
			
			mkdirp(folderPath, function(err) { 
				if(err) {
					deferred.reject({
						error:err,
						msg:"Error creating directory structure at " + folderPath + "."
					});
				} else {
					deferred.resolve({
						success:true,
						msg:"Successfully created directory structure at " + folderPath
					});
				}

			});

			return deferred.promise;
		};
		
		/**
		 * Delete directory and content
		 * @param  {string} folderPath 
		 * @return {object} deferred
		 */
		var deleteFolderAndContent = function (folderPath) {
			var deferred = $q.defer();
			
			rmdir(folderPath, function (err) {
				if(err) {
					deferred.reject({
						error:err,
						msg:"Error deleting directory and content: " + folderPath + "."
					});
				} else {
					deferred.resolve({
						success:true,
						msg:"Successfully deleted directory " + folderPath
					});
				}
			});

			return deferred.promise;
		};

		/**
		 * Copy existing file from one directory to another
		 * @param  {[type]}   source [description]
		 * @param  {[type]}   target [description]
		 * @param  {Function} cb     [description]
		 * @return {[type]}          [description]
		 */
		 var copyFile = function (source, target) {
			var deferred = $q.defer();

			fs.copy(source, target, { replace: false }, function (err) {
			  if (err) {
			    deferred.reject({
			    	error:err,
			    	msg:"Error copying file " + source + " to " + target
			    });
			  } else {
			  	deferred.resolve({
			  		success:true,
			  		msg:"Successfully copied file " + source + " to " + target
			  	});
			  }
			 
			});

			return deferred.promise;
		 };

		/**
		 * Rename a selected file
		 * @param  {string} source to rename
		 * @param  {string} target 
		 * @return {object} deferred
		 */
		var renameFile = function (source, target) {
		 	var deferred = $q.defer();

 			fs.rename(source, target, function(err) {
 				if (err) {
 				  deferred.reject({
 				  	error:err,
 				  	msg:"Error renaming file " + source + " to " + target
 				  });
 				} else {
 					deferred.resolve({
 						success:true,
 						msg:"Successfully renamed file from " + source + " to " + target
 					});
 				}
		 	});

		 	return deferred.promise;
		  };

		/**
		 * Download a file from a given URL and save it to a given destination
		 * @param  {string} url 
		 * @param  {string} destination 
		 * @return {object} success or error object
		 */
		var downloadFile = function (url, destination, libraryName) {
		 	var deferred = $q.defer();
		  	var file = fs.createWriteStream(destination + libraryName);

		  	createFolders("testlibrary").then(function (result) {
			  	var request = http.get(url, function(response) {
			  	  	response.pipe(file);

			  	  	file.on('finish', function() {
			  	  		file.close();

	  	  				deferred.resolve({
	  	  					success:true,
	  	  					msg:"Successfully renamed file from " + url + " to " + destination
	  	  				});
					}).on('error', function(err) { 
						fs.unlink(dest); // Delete the file async. (But we don't check the result)
						deferred.resolve({
							success:true,
							msg:"Successfully renamed file from " + url + " to " + destination
						});
					});
				});
		  	}, function (failure) {
		  		deferred.resolve({
		  			success:true,
		  			msg:"Successfully renamed file from " + url + " to " + destination
		  		});
		  	});

		 	return deferred.promise;
		};
		 
		return {
			readFile: function(path) {
				console.log(TAG + "readFile");
				return readFile(path);
			},
			createFile: function(path) {
				console.log(TAG + "createFile");
				console.log(path);
				return createFile(path);
			},
			writeFile: function(path, content) {
				console.log(TAG + "writeFile");
				console.log(path);
				return writeFile(path, content);
			},
			deleteFile: function(path) {
				console.log(TAG + "deleteFile");
				console.log(path);
				return deleteFile(path);
			},
			cloneFolderAndContent: function(source, destination) {
				console.log(TAG + "cloneFolderAndContent");
				return cloneFolderAndContent(source, destination);
			},
			readDirectory: function(path) {
				console.log(TAG + "readDirectory");
				console.log(path);
				return readDirectory(path);
			},
			isDirectory: function(path) {
				return isDirectory(path);
			},
			createFolders: function(folderPath) {
				console.log(TAG + "createFolders");
				console.log(folderPath);
				return createFolders(folderPath);
			},
			deleteFolderAndContent: function(folderPath) {
				console.log(TAG + "deleteFolderAndContent");
				console.log(folderPath);
				return deleteFolderAndContent(folderPath);
			},
			copyFile: function(source, target) {
				console.log(TAG + "copyFile");
				console.log(source + ":" + target);
				return copyFile(source, target);
			},
			renameFile: function(source, target) {
				console.log(TAG + "renameFile");
				console.log(source + ":" + target);
				return renameFile(source, target);
			},
			downloadFile: function(url, destination, libraryName) {
				console.log(TAG + "downloadFile");
				console.log(url + ":" + destination);
				return downloadFile(url, destination, libraryName);
			}
		};
	}
]);