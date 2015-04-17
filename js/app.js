/**
 * Copyright aaronprojects GmbH (www.aaronprojects.de), 2015
 * Distributed under the MIT License.
 * (See accompanying file LICENSE or copy at http://opensource.org/licenses/MIT)
 * Author: Verena Zaiser (verena.zaiser@aaronprojects.de)
 */
neodym = 

angular.module('neodym', ['ngResource', 'ngRoute', 'ngAnimate', 'ngMaterial', 'angular-ladda', 'neodym.controllers', 'neodym.services', 'neodym.directives', 'neodym.filters'])

.config(function ($routeProvider, laddaProvider, $mdThemingProvider) {
    laddaProvider.setOption({ 
        style: 'zoom-in'
    });
    $mdThemingProvider
        .theme('default')
        .primaryPalette('blue-grey')
        .accentPalette('teal');
    
    $routeProvider
        .when('/home', {
            templateUrl: 'views/home/home_overview.html',
            controller: 'HomeOverviewController'
        })
        .when('/project', {
            templateUrl: 'views/project/project_overview.html',
            controller: 'ProjectOverviewController'
        })
        .when('/settings', {
            templateUrl: 'views/settings/settings_overview.html',
            controller: 'SettingsOverviewController'
        })
        .when('/components', {
            templateUrl: 'views/components/components_overview.html',
            controller: 'ComponentsOverviewController'
        })
        .when('/tasks', {
            templateUrl: 'views/tasks/tasks_overview.html',
            controller: 'TasksOverviewController'
        })
        .when('/plugins', {
            templateUrl: 'views/plugins/plugins_overview.html',
            controller: 'PluginsOverviewController'
        })
        .when('/libraries', {
            templateUrl: 'views/libraries/libraries_overview.html',
            controller: 'LibrariesOverviewController'
        })        
        .when('/testing', {
            templateUrl: 'views/testing/testing_overview.html',
            controller: 'TestingOverviewController'
        })
        .when('/codeanalysis', {
            templateUrl: 'views/codeanalysis/codeanalysis_overview.html',
            controller: 'CodeanalysisOverviewController'
        })   
        .when('/release', {
            templateUrl: 'views/release/release_overview.html',
            controller: 'ReleaseOverviewController'
        })
        .otherwise({
            redirectTo: '/home'
        });
});