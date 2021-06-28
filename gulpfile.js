const { src, dest, parallel, series, watch } = require("gulp")

const del = require("del")
const browserSync = require("browser-sync")
const loadPlugins = require("gulp-load-plugins") // 自动加载所有gulp插件
const plugins = loadPlugins()
const bs = browserSync.create()

// const sass = require('gulp-sass')(require('sass'))
// const plugins.babel = require('gulp-babel')
// const plugins.swig = require('gulp-swig')
// const plugins.imagemin = require('gulp-imagemin')

const data = {
 menus: [
  {
   name: "Home",
   icon: "aperture",
   link: "index.html",
  },
  {
   name: "Features",
   link: "features.html",
  },
  {
   name: "About",
   link: "about.html",
  },
  {
   name: "Contact",
   link: "#",
   children: [
    {
     name: "Twitter",
     link: "https://twitter.com/w_zce",
    },
    {
     name: "About",
     link: "https://weibo.com/zceme",
    },
    {
     name: "divider",
    },
    {
     name: "About",
     link: "https://github.com/zce",
    },
   ],
  },
 ],
 pkg: require("./package.json"),
 date: new Date(),
}

const clean = () => {
 return del(["dist"])
}

const style = () => {
 // { base: 'src'} 保留原有目录结构
 console.log(require("gulp-sass"))
 console.log(plugins.sass)
 return (
  src("src/assets/styles/*.scss", { base: "src" })
   // .pipe(sass({ outputStyle: 'expanded' }))
   .pipe(plugins.sass(require("sass"))({ outputStyle: "expanded" }))
   .pipe(dest("dist"))
   .pipe(bs.reload({ stream: true }))
 )
}

const script = () => {
 return src("src/assets/scripts/*.js", { base: "src" })
  .pipe(
   plugins.babel({
    presets: ["@babel/preset-env"],
   })
  )
  .pipe(dest("dist"))
  .pipe(bs.reload({ stream: true }))
}

const page = () => {
 return src("src/*.html", { base: "src" })
  .pipe(plugins.swig({ data, defaults: { cache: false } })) // 防止模板缓存导致页面不能及时更新
  .pipe(dest("dist"))
  .pipe(bs.reload({ stream: true }))
}

const image = () => {
 return src("src/assets/images/**", { base: "src" })
  .pipe(plugins.imagemin())
  .pipe(dest("dist"))
}

const font = () => {
 return src("src/assets/fonts/**", { base: "src" })
  .pipe(plugins.imagemin())
  .pipe(dest("dist"))
}

const extra = () => {
 return src("public/**", { base: "public" }).pipe(dest("dist"))
}

const serve = () => {
 watch("src/assets/styles/*.scss", style)
 watch("src/assets/scripts/*.js", script)
 watch("src/*.html", page)
 // watch('src/assets/images/**', image)
 // watch('src/assets/fonts/**', font)
 // watch('public/**', extra)
 watch(["src/assets/images/**", "src/assets/fonts/**", "public/**"], bs.reload)

 bs.init({
  notify: false, // 关闭开启浏览器页面 browser-sync连接提示
  port: 2090,
  // open: false, // 自动打开浏览器
  // files: 'dist/**', // dist下文件修改浏览器自动变化
  /**
   * routes 配置优先于baseDir,会先去寻找routes中是否有配置，然后再去baseDir
   */
  server: {
   baseDir: ["temp", "src", "public"],
   routes: {
    "/node_modules": "node_modules",
   },
  },
 })
}

const useref = () => {
 return (
  src("temp/*.html", { base: "temp" })
   .pipe(plugins.useref({ searchPath: ["dist", "."] }))
   // html js css
   .pipe(plugins.if(/\.js$/, plugins.uglify()))
   .pipe(plugins.if(/\.css$/, plugins.cleanCss()))
   // 压缩空格符
   .pipe(
    plugins.if(
     /\.html$/,
     plugins.htmlmin({
      collapseWhitespace: true,
      minifyCSS: true,
      minifyJS: true,
     })
    )
   )
   .pipe(dest("dist"))
 )
}

const compile = parallel(style, script, page)

// 上线之前执行的任务
const build = series(
 clean,
 parallel(series(compile, useref), image, font, extra)
)

const develop = series(compile, serve)

module.exports = {
 clean,
 build,
 develop
}
