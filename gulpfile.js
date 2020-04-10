const gulp=require('gulp'),// v3.9
//const { series, src, dest, watch } = require('gulp'),// v4.0
    postcss=require('gulp-postcss'),
    // autoprefixer=require('autoprefixer'),//浏览器前缀插件postcss中使用
    autoprefixer=require('gulp-autoprefixer'),//浏览器前缀插件sass中使用
    cssnext =require('cssnext'),
    precss=require('precss'),
    connect=require('gulp-connect'),//自动刷新
    sass = require('gulp-sass'),
    cssmin=require('gulp-clean-css'),//css压缩
    rename=require('gulp-rename'),//重命名
    sourcemaps=require('gulp-sourcemaps'),//生成映射文件
    concat=require('gulp-concat'),//合并文件
    clean=require('gulp-clean'),//文件清除
    uglify=require('gulp-uglify'),//js压缩
    imagemin=require('gulp-imagemin'),//图片压缩
    htmlmin = require('gulp-htmlmin'),//html压缩
    babel=require('gulp-babel'),
    rev = require('gulp-rev'),//更改版本名
    revCollector = require('gulp-rev-collector');//gulp-rev的插件，用于html文件更改引用路径

    const app = {
      //开发环境
      src: {
        html: './src',
        js: './src/js',
        scss: './src/scss',
        css: './src/css',
        img: './src/images',
        font:'./src/font',
        lib:'./src/lib'//外部引用
      },
      //测试环境
      test:{
        html: './build',
        js: './build/js',
        scss: './build/scss',
        css: './build/css',
        img: './build/images',
        font:'./build/font',
        lib: './build/lib'
      },
      //生产发布环境
      dist: {
        html: './dist',
        js: './dist/js',
        scss: './dist/scss',
        css: './dist/css',
        img: './dist/images',
        font:'./dist/font',
        lib: './dist/lib'
      } 
    }

//postcss处理css
gulp.task('css',function () {
    var processors=[
      autoprefixer,//package.json中设置browserslist
        // autoprefixer({overrideBrowserslist:[
        // "Android 4.1",
        // "iOS 7.1",
        // "Chrome > 31",
        // "Firefox > 20",
        // "ie >= 8",
        // "last 2 versions"
        // ]}),
        cssnext,
        precss
    ];
    return gulp.src(app.src.css+'/*.css')//src()方法获取到想要处理的文件流
    .pipe(postcss(processors))//文件流通过pipe()方法导入到gulp的插件中autoprefixer、cssnext、cssnext
    .pipe(concat('all.css'))//将编译后的多个css文件合并成all.css 
    .pipe(gulp.dest(app.test.css))//经过插件处理后的流在通过pipe方法导入到gulp.dest(),gulp.desk()方法则把流中的内容写入到文件中
    .pipe(cssmin())//css再进行压缩
    .pipe(rename({
			suffix: '.min'
    }))//重命名 可以用函数自定义新名字
    .pipe(rev())//生成MD5字符串加到文件名
    .pipe(gulp.dest(app.dist.css))
    //.pipe(rev.manifest())
    .pipe(rev.manifest('rev-css-manifest.json'))//生成一个rev-manifest.json
	  .pipe(gulp.dest('rev'))//生成manifest.json文件，并保存在rev文件夹下
    .pipe(connect.reload());//修改后及时更新浏览器
});

//sass编译
gulp.task('sass',function () {
    // return gulp.src('./src/css/*.scss')
    return gulp.src(app.src.scss+'/*.scss')
    .pipe(sourcemaps.init())//标记 map 记录始发点
    // .pipe(sass().on('error', sass.logError))
    .pipe(sass())
    .pipe(autoprefixer())
    .pipe(concat('sass.all.css'))//将编译后的多个css文件合并成all.css 
    .pipe(sourcemaps.write())//输出 .map 文件
    // .pipe(gulp.dest('./dist/css'))//保留一份原文件
    .pipe(gulp.dest(app.test.css))//保留一份原文件
    .pipe(cssmin())//css再进行压缩
    .pipe(rename({
			suffix: '.min'
    }))//重命名 可以用函数自定义新名字
    .pipe(rev())//生成MD5字符串加到文件名
    // .pipe(gulp.dest('./dist/css'))
    .pipe(gulp.dest(app.dist.css))
    //.pipe(rev.manifest())
    .pipe(rev.manifest('rev-sasscss-manifest.json'))//生成一个rev-manifest.json
	  .pipe(gulp.dest('rev'))//生成manifest.json文件，并保存在rev文件夹下
    .pipe(connect.reload());//修改后及时更新浏览器
});

// //定义html任务
// gulp.task('html',function () {
//     gulp.src('./src/*.html')//指定被刷新的html路径
//     // .pipe(gulp.dest('./dist'))
//     .pipe(gulp.dest('./src'))
//     .pipe(connect.reload());
// });
//定义html任务,压缩html
gulp.task('html',function () {
  const options = {
    collapseWhitespace:true,//压缩HTML
    collapseBooleanAttributes:true,//省略布尔属性的值 <input checked="true"/> ==> <input />
    removeComments:true,//清除HTML注释
    removeEmptyAttributes:true, //删除所有空属性值 <input id="" /> ==> <input />
    removeScriptTypeAttributes:true,//删除<script>的type="text/javascript"
    removeStyleLinkTypeAttributes:true,//删除<style>和<link>的type="text/css"
    minifyJS:true,//压缩html中的javascript代码。
    minifyCSS:true //压缩html中的css代码。
  };
  //return gulp.src('./src/*.html')//指定被刷新的html路径
  //return gulp.src(app.src.html+'/*.html')//指定被刷新的html路径
  return gulp.src(['rev/*json',app.src.html+'/*.html'])//把index.html引用到的文件进行替换
  .pipe(revCollector({replaceReved:true }))//rev/*.json是路径替换的键值对文件,设置参数为true否侧不会替换上一次的值
  .pipe(gulp.dest(app.test.html))//保留一份原文件
  .pipe(htmlmin(options))
  // .pipe(gulp.dest('./dist'))
  .pipe(gulp.dest(app.dist.html))//压缩后文件
  // .pipe(gulp.dest('./src'))
  .pipe(connect.reload());//修改后及时更新浏览器
});

//压缩转换js
gulp.task('js',()=>{
  // return gulp.src('./src/js/*.js')
  return gulp.src(app.src.js+'/*.js')
  .pipe(sourcemaps.init())//标记 map 记录始发点
  // babel编译
  // .pipe(babel({
  //   presets:['@babel/env']
  // }))
  //.pipe(babel())//babel调用babel.config.js配置---报错
  .pipe(babel({
    presets: ['@babel/preset-env'],
    plugins: ['@babel/plugin-transform-runtime']
  }))//babel调用babel.config.js配置
  .pipe(concat('all.js'))// concat会作合并，合并为1个js 
  //.pipe(gulp.dest('./dist/js/'))//保留一份原文件
  .pipe(gulp.dest(app.test.js))//保留一份原文件
  .pipe(uglify())
  .pipe(sourcemaps.write())//输出 .map 文件
  .pipe(rename({
    suffix: '.min'
  }))//重命名
  .pipe(rev())//生成MD5字符串加到文件名
  // .pipe(gulp.dest('./dist/js/'))
  .pipe(gulp.dest(app.dist.js))//压缩后文件
  .pipe(rev.manifest('rev-js-manifest.json'))//生成一个rev-manifest.json
	.pipe(gulp.dest('rev'))//生成manifest.json文件，并保存在rev文件夹下
  .pipe(connect.reload());//修改后及时更新浏览器
});


// 压缩images
gulp.task('images', ()=>{
  //return gulp.src(['./src/images/*.jpg', './src/images/*.gif', './src/images/*.png'])
  //return gulp.src('src/images/*')
  return gulp.src(app.src.img+'/*')
  //.pipe(imagemin())
  // .pipe(imagemin([
  //   imagemin.gifsicle({interlaced: true}),//默认：false 隔行扫描gif进行渲染
  //   imagemin.mozjpeg({propressive: true}),//默认：false 无损压缩jpg图片
  //   imagemin.optipng({optimizationLevel: 5}),// 默认：3  取值范围：0-7优化等级
  //   imagemin.svgo({
  //     plugins: [
  //       {removeViewBox: true},//移除svg的viewbox属性
  //       {cleanupIDs: false}
  //     ]
  //   })
  // ]))//自定义插件选项
  //.pipe(gulp.dest('./dist/images/'))
  .pipe(gulp.dest(app.test.img))
  .pipe(gulp.dest(app.dist.img));
});

//任务清空了dist目录
gulp.task('clean', function() {
    return gulp.src(['dist','build'],{read:false})//{read: false}直接进行删除，不需要读取文件
    .pipe(clean());
    //.pipe(clean({force: true}));//{force: true}强制删除
}); 

//启动服务器，定义livereload任务
gulp.task('connect',function (cb) {
    connect.server({
        root:'src',
        // root:'dist',
        // root:_root,
        livereload:true,//实现自动刷新
        directoryListing:false//默认false,显示的是工程目录中index.html,为true时,显示的是文档目录
    });
    cb(); //执行回调，表示这个异步任务已经完成，起通作用,这样会执行下个任务
});
//开发环境服务器
gulp.task('connectDev', function (cb) {
    connect.server({
      name: 'Dev App',
      root: 'build',
      port: 8000,
      livereload: true
    });
    cb(); //执行回调，表示这个异步任务已经完成，起通作用,这样会执行下个任务
  });
//生产环境服务器
  gulp.task('connectDist', function (cb) {
    connect.server({
      name: 'Dist App',
      root: 'dist',
      port: 8001,
      livereload: true
    });
    cb(); //执行回调，表示这个异步任务已经完成，起通作用,这样会执行下个任务
  });

//定义监听任务
gulp.task('watch',function () {
    gulp.watch(app.src.html+'/*.html',gulp.series('html'));//监听src目录下所有文件,先执行html任务
    gulp.watch(app.src.css+'/*.css',gulp.series('css'));//css有修改时监听
    gulp.watch(app.src.scss+'/*.scss', gulp.series('sass'));//scss有修改时监听
    gulp.watch(app.src.js+'/*.js',gulp.series('js'));//js有修改时监听
});


//gulp.task('default',gulp.parallel('js','sass','css','images','html'));//并行执行
gulp.task('default',gulp.series('js','sass','css','images','html'));//按顺序执行

//初始化、生成打包文件
gulp.task('init', gulp.series('clean', 'default'));

//启动任务connect服务，并监控src变化
//gulp.task('dev', gulp.series('init', 'connect', 'watch'));//修改文件后刷新页面
gulp.task('dev', gulp.series( 'connect','init', 'watch'));
 
// 生成无压缩打包文件、启动任务connect服务
//gulp.task('build', gulp.series('init', 'connectDev', 'watch'));//自动更新无效
gulp.task('build', gulp.series('connectDev', 'init', 'watch'));

//启动任务connectDist服务，生成打包文件后，监控src其变化,并及时更新dist目录
gulp.task('server', gulp.series('connectDist', 'init', 'watch'));
