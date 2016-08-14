module.exports = [
	{
		test: /(app\/raw\/.*|\.yaml$)/,
		loader: 'raw-loader'
	},
	{
		test: /\.jsx?$/,
		exclude: /(node_modules|bower_components|lib)/,
		loaders: ['react-hot', 'babel'],
	},
	{
		test: /\.js?$/,
		exclude: /(node_modules|lib)/,
		loader: 'imports-loader',
	},
  {  // all files with a `.ts` or `.tsx` extension are typescript
    test: /\.tsx?$/,
    loader: 'awesome-typescript-loader'
  },
	{
		test: /\.json$/,
		loader: 'json-loader'
	},
	{
		test: /\.zip$/,
		loader: 'binary-loader'
	},
	{
		test: /\.css$/,
		loader: 'style-loader!css-loader'
	},
	{
		test: /\.eot(\?.*)?$/,
		loader: "file"
	},
	{
		test: /\.(woff|woff2)(\?.*)?$/,
		loader: "url?prefix=font/&limit=5000"
	},
	{
		test: /\.ttf(\?.*)?$/,
		loader: "url?limit=10000&mimetype=application/octet-stream"
	},
	{
		test: /\.svg(\?.*)?$/,
		loader: "url?limit=10000&mimetype=image/svg+xml"
	},
	{
		test: /\.gif/,
		loader: "url-loader?limit=10000&mimetype=image/gif"
	},
	{
		test: /\.jpg/,
		loader: "url-loader?limit=10000&mimetype=image/jpg"
	},
	{
		test: /\.png/,
		loader: "url-loader?limit=10000&mimetype=image/png"
	}
];
