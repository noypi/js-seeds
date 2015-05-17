"use strict";

var gulp = require('gulp');
global['buildConfig'] = require('./config'); 
require('shelljs/global');

var tasks = [
	'browserify',
	'uglify',
	'assets',
	'watch',
	'browsersync',
	'open',
	'reload'
];

var taskmap = {
	'build': ['assets', 'browserify'],
	'release': ['assets', 'uglify'],
	'serve': ['build', 'browsersync', 'watch'],
	'default': ['build', 'watch', 'serve', 'open']
};

tasks.forEach(function(name){
	require('./tasks/'+name)(gulp);
});

for(var k in taskmap) {
	gulp.task(k, taskmap[k]);	
}
