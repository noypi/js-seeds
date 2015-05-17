"use strict";

var browserSync = require('browser-sync');

module.exports = function(gulp) {
	
	gulp.task('browsersync', function(){
		browserSync({
			notify: false,
			server: {
				baseDir: ['www']
			},
			port: "8000"
		});	
		
	})
	
};