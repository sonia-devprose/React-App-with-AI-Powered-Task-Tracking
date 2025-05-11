const webpack = require('webpack');

module.exports = {
  webpack: {
    configure: (webpackConfig) => {
      webpackConfig.resolve = {
        ...webpackConfig.resolve,
        fallback: {
          "buffer": require.resolve("buffer/"),
          "crypto": require.resolve("crypto-browserify"),
          "http": require.resolve("stream-http"),
          "https": require.resolve("https-browserify"),
          "net": require.resolve("net-browserify"),
          "os": require.resolve("os-browserify/browser"),
          "path": require.resolve("path-browserify"),
          "stream": require.resolve("stream-browserify"),
          "url": require.resolve("url/"),
          "util": require.resolve("util/"),
          "zlib": require.resolve("browserify-zlib"),
          "fs": false, // You might not need a browser polyfill for 'fs'
          "tls": false,
          "dns": false,
          "http2": false,
          "child_process": false,
        },
      };
      webpackConfig.plugins = [
        ...webpackConfig.plugins,
        new webpack.ProvidePlugin({
          process: 'process/browser',
          Buffer: ['buffer', 'Buffer'],
        }),
      ];
      return webpackConfig;
    },
  },
  // Optional: Explicit ESLint configuration if the warning persists
  eslint: {
    enable: true,
    mode: 'extends',
    configure: {},
  },
};