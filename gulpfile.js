var gulp        = require('gulp');

var $           = require('gulp-load-plugins')();
var del         = require('del');
var source      = require('vinyl-source-stream');
var browserify  = require('browserify');
var runSequence = require('run-sequence');
var watchify = require('watchify');
var gutil = require('gulp-util');
var browserSync = require('browser-sync');
var reload = browserSync.reload;
var modRewrite = require('connect-modrewrite');

var env = 'dev';

var handleError;

global.isWatching = false;

handleError = function(err) {
  console.error(err.toString());
  return this.emit('end');
};

gulp.task('clean:dev', function() {
  return del(['.tmp']);
});

gulp.task('clean:dist', function() {
  return del(['dist']);
});

gulp.task('webpack', function () {
  webpack(config, function(err, stats) {
    if (err) {
      throw new gutil.PluginError("execWebpack", err);
    }
    return gutil.log("[execWebpack]", stats.toString({
      colors: true
    }));
  });
});

gulp.task('scripts', function(end) {
  var bundle, bundler;
  bundler = browserify('./app/scripts/app.js', {
    extensions: ['.jsx', '.js'],
    debug: env === 'dev',
    cache: {},
    packageCache: {},
    fullPaths: true,
    paths: [
      __dirname + '/node_modules',
      __dirname + '/bower_components',
      __dirname + '/app/scripts'
    ]
  }).transform('babelify');
  bundle = function(ids) {
    if (ids != null) {
      console.log(ids);
    }
    return bundler.bundle()
      .on('error', handleError)
      .pipe(source('bundle.js'))
      .pipe(gulp.dest('.tmp/scripts/'))
      .on('end', function() {
        return console.log('Bundle complete');
      });
  };
  if (global.isWatching) {
    bundler = watchify(bundler);
    bundler.on('update', bundle);
  }
  return bundle();
});

gulp.task('imagemin', function() {
  return gulp.src('app/images/*')
    .pipe($.imagemin({
            progressive: true,
            svgoPlugins: [{removeViewBox: false}]
    }))
    .pipe(gulp.dest('dist/images'));
});

gulp.task('copy', function() {
  return gulp.src(['app/*.txt', 'app/*.ico'])
    .pipe(gulp.dest('dist'));
})

gulp.task('bundle', ['scripts'], function () {
  var assets = $.useref.assets({searchPath: '{.tmp,app}'});
  var jsFilter = $.filter(['**/*.js']);
  var cssFilter = $.filter(['**/*.css']);
  var htmlFilter = $.filter(['*.html']);

  return gulp.src('app/*.html')
    .pipe(assets)
    .pipe(assets.restore())
    .pipe($.useref())
    .pipe(jsFilter)
    .pipe($.uglify({mangle: false}))
    .pipe(jsFilter.restore())
    .pipe(cssFilter)
    .pipe($.autoprefixer({
      browsers: ['last 5 versions']
    }))
    .pipe($.minifyCss())
    .pipe(cssFilter.restore())
    .pipe(htmlFilter)
    .pipe($.htmlmin({collapseWhitespace: true}))
    .pipe(htmlFilter.restore())
    .pipe($.revAll({ ignore: [/^\/favicon.ico$/g, '.html'] }))
    .pipe($.revReplace())
    .pipe(gulp.dest('dist'))
    .pipe($.size());
});

gulp.task('webserver', function() {
  return gulp.src(['.tmp', 'app'])
    .pipe($.webserver({
      host: 'localhost', //change to 'localhost' to disable outside connections
      livereload: true,
      open: true
    }));
});

gulp.task('browser-sync', function () {
  browserSync({
    port: 8000,
    open: false,
    minify: false,
    host: "127.0.0.1",
    server: {
      baseDir: [".tmp", "app"],
      middleware: [
        modRewrite([
          '^[^\\.]*$ /index.html [L]'
        ])
      ]
    }
  });

// ---
// generated by coffee-script 1.9.0
});

gulp.task('setWatch', function () {
  global.isWatching = true;
})

gulp.task('watch', ['setWatch'], function () {
  gulp.watch('app/*.html', reload);
  gulp.watch('app/styles/**/**/*.css', reload);
  gulp.watch('.tmp/scripts/**/*.js', reload);
});

gulp.task('serve', ['clean:dev', 'watch', 'scripts', 'browser-sync']);

gulp.task('build', ['clean:dev', 'clean:dist', 'scripts', 'imagemin', 'copy', 'bundle']);
