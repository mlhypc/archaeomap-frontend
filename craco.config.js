// CRACO Configuration for Cesium

const CopyWebpackPlugin = require('copy-webpack-plugin');
const path = require('path');
const webpack = require('webpack');

module.exports = {
  webpack: {
    configure: (webpackConfig) => {
      // Cesium configuration - Updated for Cesium 1.134+
      const cesiumSource = 'node_modules/cesium/Build/Cesium';

      // Define CESIUM_BASE_URL for asset loading
      webpackConfig.plugins.push(
        new webpack.DefinePlugin({
          CESIUM_BASE_URL: JSON.stringify('/')
        })
      );

      // Copy Cesium static assets to public directory
      webpackConfig.plugins.push(
        new CopyWebpackPlugin({
          patterns: [
            { from: path.join(cesiumSource, 'Workers'), to: 'Workers' },
            { from: path.join(cesiumSource, 'Assets'), to: 'Assets' },
            { from: path.join(cesiumSource, 'Widgets'), to: 'Widgets' },
            { from: path.join(cesiumSource, 'ThirdParty'), to: 'ThirdParty' }
          ]
        })
      );

      // Ignore Cesium source maps warnings
      webpackConfig.module = webpackConfig.module || {};
      webpackConfig.module.unknownContextCritical = false;
      webpackConfig.module.unknownContextRegExp = /^.\/.*$/;

      return webpackConfig;
    },
  },
};