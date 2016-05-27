var webpack = require('webpack');
var path = require('path');
var loaders = require('./webpack.loaders');

module.exports = {
	entry: [
		'./app/main.jsx' // Your appʼs entry point
	],
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
  new webpack.DefinePlugin({
    RELEASE: true
  })
]
};
