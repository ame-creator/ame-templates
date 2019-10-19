const VueSSRServerPlugin = require('vue-server-renderer/server-plugin')
const VueSSRClientPlugin = require('vue-server-renderer/client-plugin')
const nodeExternals = require('webpack-node-externals')
const merge = require('lodash.merge')
const TerserPlugin = require('terser-webpack-plugin')
const path = require('path')
const AmePlugin = require('./plugin/index')

const TARGET_NODE = process.env.WEBPACK_TARGET === 'node'

const clientConfig = {
  entry: {
    app: `./src/entry-client.ts`
  },
  target: 'web',
  node: false,
  plugins: [new VueSSRClientPlugin(), new AmePlugin()],
  optimization: {
    splitChunks: undefined
    // minimize: false
  }
}

const serverConfig = {
  entry: {
    app: `./src/entry-server.ts`
  },
  target: 'node',
  plugins: [
    new VueSSRServerPlugin()
  ],
  externals: [
    nodeExternals({
      whitelist: /\.css|scss$/
    })
  ],
  output: {
    libraryTarget: 'commonjs2'
  },
  optimization: {
    splitChunks: false
  }
}

module.exports = {
  css: {
    extract: process.env.NODE_ENV === 'production'
  },
  configureWebpack: (config) => {
    if (!TARGET_NODE) {
      config.optimization.minimizer = [
        new TerserPlugin({
          chunkFilter: (chunk) => {
            if (chunk.name === 'app') {
              return false
            }

            return true
          }
        })
      ]
    }
    return TARGET_NODE ? serverConfig : clientConfig
  },
  chainWebpack: config => {
    config.module
      .rule('vue')
      .use('vue-loader')
      .tap(options =>
        merge(options, {
          optimizeSSR: false
        })
      )

    config.module
      .rule('ts')
      .use('ame')
      .loader(path.join(__dirname, './loader/index.js'))
      .before('babel-loader')
  },
  productionSourceMap: false
}
