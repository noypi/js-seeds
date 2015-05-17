"use strict";

module.exports = function(gulp) {
	
	gulp.task('watch',function(){
		gulp.watch([
			process.cwd()+'/app/**/*.js',
		], ['build']);
		
		gulp.watch([
			process.cwd()+'/app/**/*.scss'	
		], ['sass']);
		
		gulp.watch([
			buildConfig.appIndexHtml,
			process.cwd()+'/app/images/**/*',	
		], ['assets']);
		
		// www
		gulp.watch([
			process.cwd()+'/www/css/styles.css',
			process.cwd()+'/www/**/*.js',
			buildConfig.wwwjs,
			buildConfig.wwwIndexHtml
		], ['reload']);	
	})
	
}