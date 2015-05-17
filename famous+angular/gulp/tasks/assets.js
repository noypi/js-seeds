"use strict";

var path = require('path');
var fs = require('fs');

module.exports = function(gulp) {
			
	gulp.task('assets', ['assets:copyIndexHtml']);
		
	gulp.task('assets:copyIndexHtml', function(){
		cp('-f', buildConfig.appIndexHtml, buildConfig.wwwdir);
	});
	
};