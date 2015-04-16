/**
 * Copyright aaronprojects GmbH (www.aaronprojects.de), 2015
 * Distributed under the MIT License.
 * (See accompanying file LICENSE or copy at http://opensource.org/licenses/MIT)
 * Author: Verena Zaiser (verena.zaiser@aaronprojects.de)
 * Description: The repositoryservice provides all functionality to manage cloning repositories
 */
angular.module('neodym.services')
	.factory('RepositoryService', ['$q', function ($q) {
			var TAG = "RepositoryService: ";

			var exec = require('child_process').exec;
			var child_process = require('child_process');

			/**
			 * Clone repository
			 * @param  {string} task
			 * @param  {location} location
			 * @return {deferred}
			 */
			var cloneRepository = function(url, destination) {
				var deferred = $q.defer();

				exec("git clone " + url + " " + destination, function (error, stdout, stderr) {

					if(error !== null) {
						console.log(error);

						deferred.reject({
							error: error, 
							msg: error.message
						});
					} else {
						console.log(stderr);

						/*deferred.reject({
							error: error, 
							msg: stderr
						});*/
						deferred.resolve({
							success: stdout,
							msg: "Repository " + url + " successfully cloned."
						});
					} 
				});

				return deferred.promise;
			};

			
			return {
				cloneRepository: function(url, destination) {
					console.log(TAG + "cloneRepository");
					console.log(url);
					console.log(destination);
					return cloneRepository(url, destination);
				}
			};
		}
	]);