"use strict";

var uglify = require('gulp-uglify');
var browserify = require('browserify');
var concat = require('gulp-concat');
var fs = require('fs');

module.exports = function(gulp) {
	var tmpjs = '__tmp.js';
	var tmpfile = buildConfig.appjsdir+'/'+tmpjs;
	
	gulp.task('uglify', ['uglify:browserify']);
	
	gulp.task('uglify:browserify', function(){
		return browserify(buildConfig.bundle)
				.bundle()
				.on('error', function (err) { console.error(err); })
				.pipe(fs.createWriteStream(tmpfile));
				
	}).on('task_stop', function(s){
		//:TODO: try to use vinyl-source-stream
		if (s.task=='uglify:browserify') {
			gulp.start.apply(gulp, ['uglify:output']);
		}
	});
	
	gulp.task('uglify:output', function() {
		return gulp.src(tmpfile)
				.pipe(uglify())
				.pipe(gulp.dest(buildConfig.wwwdir));
				
	}).on('task_stop', function(s){
		if (s.task=='uglify:output') {
			rm(tmpfile);
			mv('-f', buildConfig.wwwdir+'/'+tmpjs, buildConfig.minjs);
		}
	});
	
	
};