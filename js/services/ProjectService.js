/**
 * Copyright aaronprojects GmbH (www.aaronprojects.de), 2015
 * Distributed under the MIT License.
 * (See accompanying file LICENSE or copy at http://opensource.org/licenses/MIT)
 * Author: Verena Zaiser (verena.zaiser@aaronprojects.de)
 * Description: The projectservice provides all functionality to manage the project config file
 */
angular.module('neodym.services')
    .factory('ProjectService', ['$q', '$location',
        function ($q, $location) {
            var TAG = "ProjectService: ";

            var projects = [];
            var fs = require('fs');
            var projectsConfigPath = './configs/projects.config.json';

        	var getAllProjects = function() {
        		var deferred = $q.defer();

        		fs.readFile(projectsConfigPath, function read(err, data) {
                    if (err) {
                        deferred.reject(err);
                        throw err;
                    }
                    if(data) {
                        projects = JSON.parse(data);
                        deferred.resolve(projects);
                    }
                });

        		return deferred.promise;
        	};

            /**
             * Saves all existing projects to the config file
             */
            var saveAllProjects = function(projects) {
                var deferred = $q.defer();

                fs.writeFile(projectsConfigPath, JSON.stringify(projects, null, 4) , function(err) {
                    if(err) {
                        deferred.reject(err);
                    } else {
                        deferred.resolve("The file was saved!");                
                    }
                }); 

                return deferred.promise;
            };

            /**
             * Add new project to the project config
             * @param {object} project
             */
            var addProject = function(project) {
                var deferred = $q.defer();

                getAllProjects().then(function (result) {
                    result.push(project);

                    console.log(result);

                    saveAllProjects(result).then(function (result) {
                        console.log("All projects have been saved");
                    });
                });
                projects.push(project);
                deferred.resolve(projects);

                return deferred.promise;
            };

            /**
             * Get current selected project
             * @return {object} current project id
             */
            var getActiveProject = function () {
                var deferred = $q.defer();

                for(var i = 0; i < projects.length;i++) {
                    if(projects[i].active) {
                        deferred.resolve(projects[i]);
                    }
                }
                return deferred.promise;
            };

            /**
             * Get current selected project
             * @return {object} current project id
             */
            var setActiveProject = function () {
                var deferred = $q.defer();

                //TODO
                return deferred.promise;
            };

        	return {
        	    getAllProjects: function () {
        	        return getAllProjects();
        	    },
        	    getProject: function (projectID) {
        	        return getProject(projectID);
        	    },
        	    addProject: function (project) {
        	        return addProject(project);
        	    },
        	    removeProject: function (projectID) {
        	        return removeProject(projectID);
        	    },
        	    editProject: function(projectID){
        	        return editProject(projectID);
        	    },
                getActiveProject: function() {
                    console.log(TAG + "getActiveProject");
                    return getActiveProject();
                }
        	};
		}
	]);