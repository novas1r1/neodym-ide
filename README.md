# neodym IDE (alpha)

With the neodym IDE it is possible to easily create app projects using the [Ionic SDK](http://ionicframework.com). A lot of built in and automatically configured tools help to improve your code quality and speed up most of the manual steps coming along with developing an app.

The neodym IDE is developed using [NW.js](http://nwjs.io) and therefore working on Windows, Linux and Mac OS X. The whole source code is written in JavaScript using [AngularJS](https://angularjs.org/). Up to now there is only a Windows version available, but a Linux and Mac version will follow soon.

The idea of the neodym IDE is based on my (Verena Zaiser) master thesis written at [aaronprojects GmbH](http://www.aaronprojects.de) (Germany) dealing with the "design and implementation of an IDE for an improved development workflow for Ionic-based multi-platform apps". We really excited if this project will be accepted and pushed by the community, therefore we decided to start an open-source project based on this idea and current implemented version. We would love to welcome you in our hopefully growing community and appreciate every helping hand. Of course we are still working on the project as well! 

Please contact us if you have ANY! questions =)!

## Functionality

### Create a new app project including all configuration
A new app project can easily be created by entering a name and a target directory as well as selecting a predefined Ionic template. Afterwards a template including all setup and configuration files will be downloaded and all dependencies will automatically be installed.

### Switch between your app projects
In the project overview all app projects created with neodym are listed and can be opened to work on them.

### Edit your app settings
Editing your settings is now possible via interface.

### Manage your components easily via interface
Lots of components need to be created to implement the app logic within the source code. Building up a basic structure often needs a lot of time. Therefore the component manager will be introduced. It allows to create/edit and delete components as comfortable as possible. As neodym IDE tries to support you with testing, each created component also generates a matching test file. 

### Run often used tasks and create new tasks
A lot of tasks need to be run very often. This always needs manual command prompt input and also requires remembering the commands. With neodym this gets replaced by the task manager which comes with predefined basic tasks or allows to customize tasks yourself. Each task can be started (and stopped) via click.

### Check your code quality by running a code analysis powered by JSHint
To get some hints on syntax errors, possible bugs or violating some conventions the code analysis manager helps to run JSHint and displays the results. 

### Manage your libraries
Adding new libraries can easily be done by providing an URL of the JavaScript file or uploading a file from your hard disk. All used libraries will be listed in the library overview and automatically be referenced in the index.html file. It is also possible to remove the libraries completely from the project by clicking on a button.

### Search for plugins and manage them easily using the plugin manager
Maintaining plugins via the command prompt is really hard and time consuming. That's why I built a plugin manager which provides an overview about all installed plugins and tells you which plugin can be updated. Also searching for plugins and displaying the results as well as installing or uninstalling them via click is possible. 

### Run your tests and have a look at your code coverage
A testing environment using [Karma](http://karma-runner.github.io/) as the test runner and [Jasmine](http://jasmine.github.io/) as the testing framework is preinstalled and preconfigured by creating a new app project. Runnning tests is really easy by clicking on the "run" button in the test manager view. The results will be displayed using the [karma-htmlfile-reporter](https://www.npmjs.com/package/karma-htmlfile-reporter) as well as a code coverage using [istanbul](https://github.com/gotwarlost/istanbul). Hopefully this will motivate you to write and run some unit tests :)!

### Release your app easily

## Installation

The [Ionic SDK](http://ionicframework.com) has to be successfully installed and configured to use the neodym IDE. If you are not familiar with Ionic, please have a look at its [official documentation](http://ionicframework.com/docs/).

Afterwards you only need to download the .zip package and start the neodym-ide.exe to run the IDE. A packaged version will also be available soon after some issues will be fixed. At the moment it takes horribly long to start the packaged version.

## Dependencies

Code analysis is powered by [JSHint](http://jshint.com).
[Karma](http://karma-runner.github.io) is used as the test runner.
[Jasmine](http://jasmine.github.io) is used as the testing framework.
[Istanbul](https://github.com/gotwarlost/istanbul) is used to generate the code coverage.

## Upcoming features and changes
- Currently only available for Windows -> will be available for Linux and Mac OS X soon
- Import of existing Ionic projects
- Choosing between different code structures (currently: order by component type, additionally: order by function)

## Known issues
*Please let us know about your discovered issues!*

## Support us
### Join the open source community
Hopefully some people are interested in joining this project to built up a good working software. Please contact us (directly via GitHub or e-mail) if you are interested in helping me :)!

### Make a donation
*Coming soon*

## FAQ
*Coming soon*

## Authors
This project was designed, implemented and evaluated as part of a master thesis by [Verena Zaiser](http://verena-zaiser.de) working at [aaronprojects GmbH](http://www.aaronprojects.de) in Leonberg, Germany. 

## License
neodym IDE is licensed under the MIT Open Source license.
