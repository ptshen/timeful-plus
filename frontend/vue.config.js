const { defineConfig } = require("@vue/cli-service")
module.exports = defineConfig({
  transpileDependencies: ["vuetify"],
  // publicPath: "/dist",
  devServer: {
    host: '0.0.0.0',
    port: 8080,
    proxy: {
      '/api': {
        target: 'http://backend:3002',
        changeOrigin: true
      },
      '/sockets': {
        target: 'http://backend:3002',
        ws: true,
        changeOrigin: true
      }
    }
  },
  // pluginOptions: {
  //   webpackBundleAnalyzer: {
  //     openAnalyzer: false,
  //   },
  // },
})
