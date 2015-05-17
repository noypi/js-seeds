"use strict";

var browserSync = require('browser-sync');
var reload = browserSync.reload;

module.exports = function(gulp) {
	gulp.task('reload', reload);
};