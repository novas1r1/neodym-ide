/**
 * Copyright aaronprojects GmbH (www.aaronprojects.de), 2015
 * Distributed under the MIT License.
 * (See accompanying file LICENSE or copy at http://opensource.org/licenses/MIT)
 * Author: Verena Zaiser (verena.zaiser@aaronprojects.de)
 * Description: The taskservice provides all functionality to manage executable tasks
 */
angular.module('neodym.services')
	.factory('TaskService', ['$q', function ($q) {
			var TAG = "TaskService: ";
			var exec = require('child_process').exec;
			var child_process = require('child_process');

			/**
			 * Executes one task at defined location
			 * @param  {string} task
			 * @param  {location} location
			 * @return {deferred}
			 */
			var executeTask = function(task, location) {
				var deferred = $q.defer();

				exec(task, {cwd:location},function (error, stdout, stderr) {

					if(error !== null) {
						console.log(error);

						deferred.reject({
							error: error, 
							msg: error.message
						});
					} else if(stderr !== null && stderr.length > 0) {
						console.log(stderr);

						deferred.reject({
							error: error, 
							msg: stderr
						});
					} else {
						console.log(stdout);

						deferred.resolve({
							success: stdout,
							msg: "Task " + task + " successfully executed."
						});
					}
				});

				return deferred.promise;
			};

			/**
			 * Executes one task at defined location
			 * @param  {string} task
			 * @param  {location} location
			 * @return {deferred}
			 */
			var spawnTask = function(task) {
				var deferred = $q.defer();

				var child = child_process.spawn(task);

				/*child.on(task, function () {
					console.log("TEST");
					deferred.resolve("haha");
				});*/

				return deferred.promise;
			};

			return {
				executeTask: function(task, location) {
					console.log(TAG + "executeTask");
					console.log(task);
					console.log(location);
					return executeTask(task, location);
				},
				spawnTask: function(task) {
					console.log(TAG + "spawnTask");
					console.log(task);
					return spawnTask(task);
				}
			};
		}
	]);