var gulp = require('gulp');

// ---------------------------------------------------------------
// Plugins:
// ---------------------------------------------------------------
var sass                = require('gulp-sass');             // css - scss preprocessor
var cleanCSS            = require('gulp-clean-css');        // css - minifier
var autoprefixer        = require('gulp-autoprefixer');     // css - prefixing
var uglify              = require('gulp-uglify');           // js - minify
var del                 = require('del');                   // files - deleting files and folders
var fs                  = require('fs');                    // files - renaming files
var watch               = require('gulp-watch');            // files - watch changes
var plumber             = require('gulp-plumber');          // gulp - used to avoid pipe errors
var cache               = require('gulp-cache');            // gulp - clearing cache
var gulpSequence        = require('gulp-sequence');         // gulp - task sequencing
var jshint              = require('gulp-jshint');           // js - lint errors
var rev                 = require('gulp-rev');              // files - hash file names
//var browserSync         = require('browser-sync');          // browser - auto refresh
//var revReplace          = require('gulp-rev-replace');      // files - alternative to PHP file naming
//var concat              = require('gulp-concat');           // files - joining
//var changed             = require('gulp-changed');          // files - watch changes


// ---------------------------------------------------------------
// Watch for updates
// ---------------------------------------------------------------
gulp.task('default',  function() {
    gulp.watch("src/common/_scss/**/*.scss", ['css']);
    gulp.watch("src/app/_js/**/*.js", ['js']);
    console.log('Watching js/scss files for changes...');
});


// ---------------------------------------------------------------
// Run sequence plugin
//
// Example:
// gulp.task('sequence-1', gulpSequence(['a', 'b'], 'c', ['d', 'e'], 'f'));
//
// 1. run 'a', 'b' in parallel;
// 2. run 'c' after 'a' and 'b';
// 3. run 'd', 'e' in parallel after 'c';
// 4. run 'f' after 'd' and 'e'.
// ---------------------------------------------------------------
gulp.task('build', gulpSequence('delete_dist', ['css','js'], 'copy'));


// ---------------------------------------------------------------
// Copy files
//
// nodir: true              => don't copy empty folders
// '!**/_*/**'              => ignore folders starting with _
// '!src/app/js/**'         => ignore maximized js files
// ---------------------------------------------------------------
gulp.task( 'copy',function () {
    return gulp.src( ['src/**/*', '!**/_*/**', '!src/app/js/**'], {nodir: true})
        .pipe(gulp.dest('dist'));
} );


// ---------------------------------------------------------------
// Remove old dist folder:
// ---------------------------------------------------------------
gulp.task('delete_dist', function() {
    return del(['dist']);
});


// ---------------------------------------------------------------
// Remove old JS min rev folder:
// ---------------------------------------------------------------
gulp.task('delete_old_js', function() {
    return del(['src/app/js-min']);
});

// ---------------------------------------------------------------
// Minify js:
// ---------------------------------------------------------------
gulp.task('js', ['delete_old_js'], function() {
    return gulp.src(['src/app/_js/*.js'])
        .pipe(plumber(plumber({
            errorHandler: function (err) {
                console.log(err);
                this.emit('end');
            }
        })))
        .pipe(uglify())
        .pipe(rev())
        .pipe(gulp.dest('src/app/js-min')) // create hashed / minified files
        .pipe(rev.manifest('src/common/php/rev-manifest.json', {merge: true}))  // outputs new file name to .json
        .pipe(gulp.dest('')); // create manifest
});


// ---------------------------------------------------------------
// Remove old CSS rev folder:
// ---------------------------------------------------------------
gulp.task('delete_old_css', function() {
    return del(['src/common/css']);
});

// ---------------------------------------------------------------
// SCSS to CSS, autoprefix, minify:
// ---------------------------------------------------------------
gulp.task('css', ['delete_old_css'], function() {
    return gulp.src('src/common/_scss/*.scss') // {base} argument can be specified for rev()
        .pipe(plumber(plumber({
            errorHandler: function (err) {
                console.log(err);
                this.emit('end');
            }
        })))
        .pipe(sass({outputStyle: 'compressed'}))
        .pipe(autoprefixer())
        .pipe(cleanCSS({compatibility: 'ie8',
            removeDuplicateRules: true}))
        .pipe(rev())
        .pipe(gulp.dest('src/common/css')) // create hashed / minified files
        .pipe(rev.manifest('src/common/php/rev-manifest.json', {merge: true}))  // outputs new file name to .json
        .pipe(gulp.dest('')); // create manifest
});


// ---------------------------------------------------------------OTHER TOOLS ---------------------------------------------------------------
// ------------------------------------------------------------------------------------------------------------------------------------------
// ------------------------------------------------------------------------------------------------------------------------------------------

// ---------------------------------------------------------------
// Clean gulp cache:
// ---------------------------------------------------------------
gulp.task('cache', function () {
    cache.clearAll();
});


// ---------------------------------------------------------------
// Lint JS errors:
// ---------------------------------------------------------------
gulp.task('lint', function() {
    return gulp.src('src/app/_js/lbs-bab.js')
        .pipe(plumber())
        .pipe(jshint())
        .pipe(jshint.reporter('default'));
});

// ---------------------------------------------------------------
// Joining js files
// ---------------------------------------------------------------
gulp.task('concat', function(){
    return gulp.src('app/js/*.js')
        .pipe(concat('all.js'))
        .pipe(gulp.dest('app/js_combined'))
});


// ---------------------------------------------------------------
// Rename target files:
// ---------------------------------------------------------------
gulp.task('rename', function() {
    return fs.rename('SOURCE', 'DESTINATION', function (err) {
        if (err) throw err;
    });
});

