const { src, dest, watch, parallel, series } = require('gulp');
const scss = require('gulp-sass');
const concat = require('gulp-concat');
const rename = require('gulp-rename');
const autoprefixer = require('gulp-autoprefixer');
const uglify = require('gulp-uglify');
const imagemin = require('gulp-imagemin');
const nunjucksRender = require('gulp-nunjucks-render');
const del = require('del');
const browserSync = require('browser-sync').create();


const nunjucks = () => {
    return src('app/*.njk')
        .pipe(nunjucksRender())
        .pipe(dest('app'))
        .pipe(browserSync.stream())
}

const browsersync = () => {
    browserSync.init({
        server: {
            baseDir: 'app/'
        }
    })
}

const styles = () => {
    return src('app/scss/*.scss')
        .pipe(scss({ outputStyle: 'compressed' }))
        .pipe(autoprefixer({
            overrideBrowserslist: ['last 10 versions'],
            grid: true
        }))
        // .pipe(concat(''))
        .pipe(rename({
            suffix: '.min'
        }))
        .pipe(dest('app/css'))
        .pipe(browserSync.stream())
};

const scripts = () => {
    return src([
            'node_modules/jquery/dist/jquery.js',
            'node_modules/slick-carousel/slick/slick.js',
            'node_modules/@fancyapps/fancybox/dist/jquery.fancybox.js',
            'node_modules/rateyo/src/jquery.rateyo.js',
            'node_modules/ion-rangeslider/js/ion.rangeSlider.js',
            'node_modules/jquery-form-styler/dist/jquery.formstyler.js',
            'app/js/main.js'
        ])
        .pipe(concat('main.min.js'))
        .pipe(uglify())
        .pipe(dest('app/js'))
        .pipe(browserSync.stream())

}

const images = () => {
    return src('app/images/**/*.*')
        .pipe(imagemin())
        .pipe(dest('dist/images'))
}

const build = () => {
    return src([
            'app/**/*.html',
            'app/css/style.min.css',
            'app/js/main.min.js'
        ], { base: 'app' })
        .pipe(dest('dist'))
}

const cleanDist = () => {
    return del('dist')
}

const watching = () => {
    watch(['app/scss/**/*.scss'], styles);
    watch(['app/*.njk'], nunjucks);
    watch(['app/js/**/*.js', '!app/js/main.min.js'], scripts);
    watch(['app/**/*.html']).on('change', browserSync.reload);
}

exports.nunjucks = nunjucks;
exports.styles = styles;
exports.scripts = scripts;
exports.browsersync = browsersync;
exports.images = images;
exports.watching = watching;
exports.cleanDist = cleanDist;
exports.build = series(cleanDist, images, build);

exports.default = parallel(nunjucks, styles, scripts, browsersync, watching);