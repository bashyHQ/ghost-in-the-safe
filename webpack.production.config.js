var webpack = require('webpack');
var path = require('path');
var loaders = require('./webpack.loaders');
var ExtractTextPlugin = require("extract-text-webpack-plugin");

module.exports = {
	entry: [
		'./app/main.jsx',
    './app/styles.css'
	],
  target: 'web',
	node: {
		Buffer: true
	},
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
plugins: [
  new webpack.NoErrorsPlugin(),
  new ExtractTextPlugin("styles.css"),
  new webpack.DefinePlugin({
    RELEASE: true
  })
]
};
