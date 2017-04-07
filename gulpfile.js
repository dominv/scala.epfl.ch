var gulp        = require('gulp');
var browserSync = require('browser-sync');
var sass        = require('gulp-sass');
var prefix      = require('gulp-autoprefixer');
var cp          = require('child_process');
var gutil       = require('gulp-util');
var exec        = require('child_process').exec;
var connect     = require('gulp-connect');
var run         = require('gulp-run');
var runSequence = require('run-sequence');

var messages = {
    jekyllBuild: '<span style="color: grey">Running:</span> $ jekyll build'
};

/**
 * Build the Jekyll Site
 */
gulp.task('jekyll-build', function (done) {
    browserSync.notify(messages.jekyllBuild);
    return cp.spawn('jekyll', ['build'], {stdio: 'inherit'})
        .on('close', done);
});

/**
 * Rebuild Jekyll & do page reload
 */
gulp.task('jekyll-rebuild', ['jekyll-build'], function () {
    browserSync.reload();
});

/**
 * Wait for jekyll-build, then launch the Server
 */
gulp.task('browser-sync', ['sass', 'jekyll-build'], function() {
    browserSync({
        server: {
            baseDir: '_site'
        }
    });
});

/**
 * Compile files from _scss into both _site/css (for live injecting) and site (for future jekyll builds)
 */
gulp.task('sass', function () {
    return gulp.src('resources/css/sass/main.scss')
        .pipe(sass({
            includePaths: ['scss'],
            onError: browserSync.notify
        }))
        .pipe(prefix(['last 15 versions', '> 1%', 'ie 8', 'ie 7'], { cascade: true }))
        .pipe(gulp.dest('_site/css'))
        .pipe(browserSync.reload({stream:true}))
        .pipe(gulp.dest('css'));
});

/**
 * Watch scss files for changes & recompile
 * Watch html/md files, run jekyll & reload BrowserSync
 */
gulp.task('watch', function () {
    gulp.watch(['./*', '_layouts/*.html', '_includes/*.html', '_posts/*', 'resources/css/**/*.scss', '_data/*'], ['jekyll-rebuild', 'sass']);
});

/**
 * Default task, running just `gulp` will compile the sass,
 * compile the jekyll site, launch BrowserSync & watch files.
 */
gulp.task('default', ['browser-sync', 'watch']);

gulp.task('install:npm',  function() {
  return gulp.src('')
    .pipe(run('npm install bower'))
    .on('error', gutil.log);
});

gulp.task('install:bower', ['install:npm'],  function() {
  return gulp.src('')
    .pipe(run('bower install'))
    .on('error', gutil.log);
});

// Install bundler gem
gulp.task('install:bundler', ['install:bower'], function() {
  return gulp.src('')
     .pipe(run('gem install bundler'))
    .on('error', gutil.log);
});

// Updates Ruby gems
gulp.task('update:bundle', ['install:bundler'],  function() {
  return gulp.src('')
    .pipe(run('bundle install'))
    .on('error', gutil.log);
});

// Runs Jekyll build
gulp.task('build:jekyll', function() {
  var shellCommand = 'bundle exec jekyll build';
  return gulp.src('')
    .pipe(run(shellCommand))
    .on('error', gutil.log);
});

// Serve the generated _site folder
gulp.task('server', () => {
  connect.server({
    root: ['_site'],
    port: process.env.PORT || 5000,
  });
})

// Launch the needed tasks to deploy the app in heroku
gulp.task('heroku:production', ['update:bundle'], function() {
  runSequence('sass', 'build:jekyll');
})