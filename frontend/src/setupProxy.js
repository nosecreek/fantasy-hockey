const { createProxyMiddleware } = require('http-proxy-middleware')

module.exports = function (app) {
  app.use(
    '/api',
    createProxyMiddleware({
      target: 'https://localhost:3003',
      secure: false,
      changeOrigin: true
    })
  )

  app.use(
    '/auth',
    createProxyMiddleware({
      target: 'https://localhost:3003',
      secure: false,
      changeOrigin: true
    })
  )
}
