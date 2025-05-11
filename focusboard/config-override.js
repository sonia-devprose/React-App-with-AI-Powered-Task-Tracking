const webpack = require('webpack');

module.exports = function override(config) {
  config.resolve.fallback = {
    ...config.resolve.fallback,
    "util": require.resolve("util/"),
    "stream": require.resolve("stream-browserify"),
    "buffer": require.resolve("buffer/"),
    "process": require.resolve("process/browser"),
    "querystring": require.resolve("querystring-es3"),
    "url": require.resolve("url/"),
    "crypto": require.resolve("crypto-browserify"),
    "https": require.resolve("https-browserify"),
    "http": require.resolve("stream-http"),
    "assert": require.resolve("assert/"),
    "os": require.resolve("os-browserify/browser"),
    "zlib": require.resolve("browserify-zlib"),
    "path": require.resolve("path-browserify"),
    "net": false,
    "tls": false,
    "dns": false,
    "http2": false,
    "fs": false,
    "child_process": false,
  };
  config.plugins.push(
    new webpack.ProvidePlugin({
      process: 'process/browser',
      Buffer: ['buffer', 'Buffer'],
    })
  );

  return config;
};