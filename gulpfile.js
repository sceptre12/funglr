(function (){
	var gulp = require('gulp'),
	concat = require('gulp-concat'),
	sass = require('gulp-ruby-sass'),
	rename = require('gulp-rename'),
	livereload = require('gulp-livereload');

	// this is the default task and it runs the list of tasks
	gulp.task('default', ['scripts', 'sass','watch']);

	gulp.task('scripts', function(){
		return gulp.src(['app/main/js/mainConfig.js','app/main/js/*.js','app/*/*/*.js'])
			.pipe(concat('main.js'))
			.pipe(gulp.dest('build/js'));		
	});
	gulp.task('sass', function(){
		return sass('styles/sass/main.scss', {style: 'compressed'})
			.pipe(rename({suffix: '.min'}))
			.pipe(gulp.dest('build/css'))
			.pipe(livereload({start: true}));
	});
	gulp.task('watch', function(){
		
		// watch the sass files
		gulp.watch('styles/sass/**/*.scss',['sass']);
		//watch the js files
		gulp.watch(['app/main/js/mainConfig.js','app/main/js/*.js', 'app/*/*/*.js'], ['scripts']);
		// Create a live Reload Server
		livereload.listen();

		// watch an files in Folders
		gulp.watch(['app/**','styles/sass/**']).on('change', livereload.changed);
	})
}());