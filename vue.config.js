const { defineConfig } = require('@vue/cli-service')
module.exports = defineConfig({
  transpileDependencies: true,
  devServer: {
    port: 8081,  // 修改前端端口，避免与后端8080冲突
    proxy: {
      '/api': {
        target: 'http://localhost:8080',  // Spring Boot 后端地址
        changeOrigin: true,
        pathRewrite: {
          '^/api': '/api'
        }
      }
    }
  }
})
