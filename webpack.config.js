var webpack = require('webpack');
var path = require('path');
var loaders = require('./webpack.loaders');

module.exports = {
	entry: [
		'webpack-dev-server/client?http://0.0.0.0:8080', // WebpackDevServer host and port
		'webpack/hot/only-dev-server',
		'./app/main.jsx' // Your appʼs entry point
	],
	devtool: process.env.WEBPACK_DEVTOOL || 'source-map',
	output: {
		path: path.join(__dirname, 'public'),
		filename: 'app.js'
	},
  externals : ['fs'],
  // "browser": {
  //   "fs": "window.require('fs')"
  // },
  // "node": {
  //   "fs": "empty"
  // },
	resolve: {
		extensions: ['', '.js', '.jsx'],
    modulesDirectories: ['node_modules']
	},
	module: {
		loaders: loaders
	},
	devServer: {
		contentBase: "./public",
			noInfo: true, //  --no-info option
			hot: true,
			inline: true
		},
	plugins: [
		new webpack.NoErrorsPlugin(),
  //   new webpack.ProvidePlugin({
  //     'fs': "window.fs",
  // })
	]
};
