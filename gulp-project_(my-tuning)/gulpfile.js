const { src, dest, watch, parallel, series } = require('gulp')
const scss = require('gulp-sass')(require('sass'))
const concat = require('gulp-concat')
const browserSync = require('browser-sync').create()
const uglify = require('gulp-uglify-es').default
const autoprefixer = require('gulp-autoprefixer')
const imagemin = require('gulp-imagemin')
const del = require('del')
const htmlmin = require('gulp-htmlmin')

//Reload browser
function browsersync() {
	browserSync.init({
		server: {
			baseDir: 'app/',
		},
	})
}

// Optimize HTML
// function html() {
// 	return src('app/*.html') // указываем пути к файлам .html
// 		.pipe(htmlmin({
// 			collapseWhitespace: true, // удаляем все переносы
// 			removeComments: true // удаляем все комментарии
// 		}))
// 		.pipe(dest('dist')) // оптимизированные файлы .html переносим на продакшен
// 	}

//Delete folders & files
function cleanDist() {
	return del('dist')
}

//Optimize images
function images() {
	return src('app/images/**/*')
		.pipe(
			imagemin([
				imagemin.gifsicle({ interlaced: true }),
				imagemin.mozjpeg({ quality: 75, progressive: true }),
				imagemin.optipng({ optimizationLevel: 5 }),
				imagemin.svgo({
					plugins: [{ removeViewBox: true }, { cleanupIDs: false }],
				}),
			])
		)
		.pipe(dest('dist/images'))
}

//Optimize JS
function scripts() {
	return src(['node_modules/jquery/dist/jquery.js', 'app/js/main.js'])
		.pipe(concat('main.min.js'))
		.pipe(uglify())
		.pipe(dest('app/js'))
		.pipe(browserSync.stream())
}

//Comressed
function stylesMin() {
	return src('app/scss/style.scss')
		.pipe(scss({ outputStyle: 'compressed' }))
		.pipe(concat('style.min.css'))
		.pipe(
			autoprefixer({
				overrideBrowserslist: ['last 10 version'],
				grid: true,
			})
		)
		.pipe(dest('app/css'))
	//.pipe(browserSync.stream())
}

//Expanded
function styles() {
	return src('app/scss/style.scss')
		.pipe(scss({ outputStyle: 'expanded' }))
		.pipe(concat('style.css'))
		.pipe(
			autoprefixer({
				overrideBrowserslist: ['last 10 version'],
				grid: true,
			})
		)
		.pipe(dest('app/css'))
		.pipe(browserSync.stream())
}

//Build
function build() {
	return src(
		[
			'app/css/style.min.css',
			'app/fonts/**/*',
			'app/js/main.min.js',
			'app/*.html',
		],
		{ base: 'app' }
	).pipe(dest('dist'))
}

//Watching
function watching() {
	watch(['app/scss/**/*.scss'], styles)
	watch(['app/js/**/*.js', '!app/js/main.min.js'], scripts)
	watch(['app/*.html']).on('change', browserSync.reload)
}

exports.styles = styles
exports.styles = stylesMin
exports.watching = watching
exports.browsersync = browsersync
exports.scripts = scripts
exports.images = images
exports.cleanDist = cleanDist
//exports.html = html

exports.build = series(cleanDist, images, stylesMin, build)
exports.default = parallel(styles, scripts, browsersync, watching)
