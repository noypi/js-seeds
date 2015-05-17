"use strict";

var browserify = require('browserify');
var fs = require('fs');

module.exports = function(gulp) {

	gulp.task('browserify', function(){
		return browserify(buildConfig.bundle, {detectGlobals:false})
				.bundle()
				.on('error', function (err) { console.error(err); })
				.pipe(fs.createWriteStream(buildConfig.wwwjs));
	});

}