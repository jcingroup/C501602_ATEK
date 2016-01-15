/// <vs SolutionOpened='default' />
var gulp = require('gulp');
var gutil = require("gulp-util");
//var uglify = require('gulp-uglify');
//var concat = require('gulp-concat');
//var react = require('gulp-react');
//var strip = require('gulp-strip-comments'); //移除註解
//var browserify = require('gulp-browserify');
var webpack = require("webpack");
var path = require('path');
require('es6-promise').polyfill();
//var imagemin = require('gulp-imagemin');
//var rename = require('gulp-rename');
//var jshint = require('gulp-jshint');
//====================================================//

//後台共同引用的js打包處理
gulp.task('commHdl', function () {
    var jsfiles = [
        'Scripts/build/ts/dynScript/defData.js',
        'Scripts/app/moment/moment.min.js',
        'Scripts/app/moment/locale/zh-tw.js',
        'Scripts/jquery/jquery-2.1.4.min.js',
        'Scripts/react/react-with-addons.min.js',
        'Scripts/app/react-bootstrap.min.js',
        'Scripts/app/toastr.min.js',
        'Scripts/build/ts/commfunc.js',
        'Scripts/build/func/inc/c-Comm.js'
    ];

    return gulp.src(jsfiles)
        .pipe(strip({ safe: true }))
        .pipe(concat('comminc.js'))
        .pipe(gulp.dest('Scripts/build/'));
});
gulp.task('commHdlX', function () {
    var jsfiles = [
        'Scripts/build/ts/def/defData.js',
        'Scripts/app/moment/moment.min.js',
        'Scripts/app/moment/locale/zh-tw.js',
        'Scripts/jquery/jquery-2.1.4.min.js',
        'Scripts/react/react-with-addons.js',
        'Scripts/app/bootstrap.js',
        'Scripts/app/react-bootstrap.js',
        'Scripts/app/toastr.min.js',
        'Scripts/build/ts/commfunc.js',
        'Scripts/build/func/c-comm.js'
    ];

    return gulp.src(jsfiles)
        .pipe(strip({ safe: true }))
        .pipe(concat('commincx.js'))
        .pipe(gulp.dest('Scripts/build/'));
});
//react 處理
gulp.task('reactHdl', function () {
    var jsxfiles = ['Scripts/src/jsx/*.jsx'];

    return gulp.src(jsxfiles)
        .pipe(react())
        .pipe(uglify())
        .pipe(gulp.dest('Scripts/build/func/'));
});
gulp.task('reactIncHdl', function () {
    var jsxfiles = ['Scripts/src/jsx-inc/*.jsx'];

    return gulp.src(jsxfiles)
        .pipe(react())
        .pipe(uglify())
        .pipe(gulp.dest('Scripts/build/func/inc/'));
});
//typescript min化 處理
gulp.task('tsHdl', function () {
    var jsfiles = [
        'Scripts/ts-def/*.js',
        'Scripts/ts-def/d.ts/*.js',
        'Scripts/ts-def/def/*.js',
        'Scripts/ts-def/widegt/*.js'
    ];

    return gulp.src(jsfiles, { base: 'Scripts/ts-def' })
        .pipe(uglify())
        .pipe(gulp.dest('Scripts/build/ts/'));
});
//typescript tsx min化 處理
gulp.task('tsxHdl', function () {
    var jsfiles = [
        'Scripts/src/tsx/*.js'
    ];

    return gulp.src(jsfiles, { base: 'Scripts/src/tsx' })
        .pipe(uglify())
        .pipe(gulp.dest('Scripts/build/func/'));
});

gulp.task('mSalesComm', function () {
    var jsfiles = [
        'Scripts/build/ts/def/defData.js',
        'Scripts/app/toastr.min.js'
    ];

    return gulp.src(jsfiles)
        .pipe(strip({ safe: true }))
        .pipe(concat('commdef.js'))
        .pipe(uglify())
        .pipe(gulp.dest('Scripts/build/'));
});
gulp.task('mSalesHdl', function () {
    var jsfiles = [
        'Scripts/src/tsx/m-sales.js'
    ];

    return gulp.src(jsfiles)
        .pipe(browserify({
            insertGlobals: true,
            debug: gulp.env.production
        }))
        .pipe(uglify())
        .pipe(gulp.dest('Scripts/build'));
});

gulp.task("webpack", function (callback) {
    // run webpack
    webpack({
        entry: {
            m_menu: path.resolve(__dirname, 'Scripts/src/tsx/m-menu.js'),
            m_login: path.resolve(__dirname, 'Scripts/src/tsx/m-login.js'),
            m_sales: path.resolve(__dirname, 'Scripts/src/tsx/m-sales.js'),
            m_product: path.resolve(__dirname, 'Scripts/src/tsx/m-product.js'),
            m_purchase: path.resolve(__dirname, 'Scripts/src/tsx/m-purchase.js'),
            m_settle: path.resolve(__dirname, 'Scripts/src/tsx/m-settle.js'),
            m_news: path.resolve(__dirname, 'Scripts/src/tsx/m-news.js'),
            m_issue: path.resolve(__dirname, 'Scripts/src/tsx/m-issue.js'),
            vendors: ['jquery', 'react', 'react-bootstrap', 'moment']
        },
        output: {
            path: path.resolve(__dirname, 'Scripts/build/app'),
            filename: '[name].js'
        },
        module: {
            loaders: [
              { test: /\.jsx$/, loader: 'babel' },
              { test: /\.css$/, loader: "style-loader!css-loader" }
            ]
        },
        resolve: {
            alias: {
                //moment: "moment/moment.min.js",
                //react: "react/dist/react.min.js",
                //"react-dom": "react-dom/dist/react-dom.min.js",
                //"react-bootstrap": "react-dom/dist/react-bootstrap.min.js"
            },
            modulesDirectories: ["app_modules", "node_modules"],
            extensions: ['', '.js', 'jsx', '.json']
        },
        plugins: [
          new webpack.optimize.CommonsChunkPlugin('vendors', 'vendors.js'),
          new webpack.ContextReplacementPlugin(/moment[\/\\]locale$/, /zh-tw/),
          new webpack.optimize.UglifyJsPlugin({ compress: { warnings: false } })
        ]
    }, function (err, stats) {
        if (err) throw new gutil.PluginError("webpack", err);
        gutil.log("[webpack]", stats.toString({
            // output options
        }));
        callback();
    });
});


//default task
gulp.task('default', function () {
    //gulp.run('tsHdl', 'tsxHdl', 'reactHdl', 'reactIncHdl', 'commHdl', 'commHdlX');
    //監控react js 文件變化
    gulp.watch('Scripts/src/tsx/*.js', function () {
        //gulp.run('tsxHdl');
        //gulp.run('commHdlX
        gulp.run('webpack');
    });
});