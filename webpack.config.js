var webpack = require('webpack');
var path = require('path');
var loaders = require('./webpack.loaders');
var ExtractTextPlugin = require("extract-text-webpack-plugin");

module.exports = {
	entry: [
		'webpack-dev-server/client?http://0.0.0.0:8080', // WebpackDevServer host and port
		'webpack/hot/only-dev-server',
		'./app/main.jsx',
    './app/styles.css'
	],
  target: 'web',
	node: {
		Buffer: true
	},
	devtool: process.env.WEBPACK_DEVTOOL || 'source-map',
	output: {
		path: path.join(__dirname, 'public'),
		filename: 'app.js'
	},
  externals: ['fs', {'./jszip': 'jszip'} ],
	resolve: {
		extensions: ['', '.js', '.jsx', '.ts', '.tsx'],
    modulesDirectories: ['node_modules', 'lib/browserfs/src']
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
    new ExtractTextPlugin("styles.css"),
    new webpack.DefinePlugin({
      RELEASE: true
    })
  //   new webpack.ProvidePlugin({
  //     'fs': "window.fs",
  // })
	]
};
