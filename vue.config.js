const path = require('path')

let settings = {
  outputDir: path.resolve(__dirname, './dist'),
}

if (process.env.NODE_ENV === "production") {
  settings = {
    ...settings,

    publicPath: './',
    productionSourceMap: false,

    filenameHashing: false,

    // удаление плагинов webpack связанных с HTML
    chainWebpack: config => {
      // config.plugins.delete('html')
      config.plugins.delete('preload')
      config.plugins.delete('prefetch')
      config.optimization.delete('splitChunks')
    }
  }
}

if (process.env.NODE_ENV === "development") {
  settings = {
    ...settings,

    publicPath: '/',

    devServer: {
      overlay: true
    },
  }
}

module.exports = settings
