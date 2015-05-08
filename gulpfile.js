(function (){
	var gulp = require('gulp'),
	concat = require('gulp-concat'),
	sass = require('gulp-ruby-sass'),
	rename = require('gulp-rename')

	// this is the default task and it runs the list of tasks
	gulp.task('default', ['scripts', 'sass','watch']);

	gulp.task('scripts', function(){
		return gulp.src(['app/main/js/*.js','app/*/*/*.js'])
			.pipe(concat('main.js'))
			.pipe(gulp.dest('build/js'));		
	});
	gulp.task('sass', function(){
		return sass('styles/sass/main.scss', {style: 'compressed'})
			.pipe(rename({suffix: '.min'}))
			.pipe(gulp.dest('build/css'));
	});
	gulp.task('watch', function(){
		// watch the sass files
		gulp.watch('styles/sass/main.scss',['sass']);
		//watch the js files
		gulp.watch(['app/main/js/*.js', 'app/*/*/*.js'], ['scripts']);
	})
}());