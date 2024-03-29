const path = require('path');
const merge = require('webpack-merge');
const common = require('./webpack.common.js');
const { CleanWebpackPlugin } = require('clean-webpack-plugin');
const CopyWebpackPlugin = require('copy-webpack-plugin');

module.exports = merge(common, {
	mode: 'development',
	devtool: 'eval-source-map',
	devServer: {
		port: 9000,
		hot: true,
		compress: true,
		publicPath: '/',
		contentBase: path.join(__dirname, '../dist'),
		historyApiFallback: true,
		writeToDisk: false,
		proxy: {
			'/api': {
				target: process.env.BACKEND_URL,
				secure: false,
				changeOrigin: true,
				logLevel: 'debug',
			},
		},
	},
	plugins: [
		new CleanWebpackPlugin({
			cleanOnceBeforeBuildPatterns: [path.join(__dirname, '../dist')],
		}),
		new CopyWebpackPlugin([
			{
				from: path.resolve(__dirname, '../src/assets/'),
				to: path.resolve(__dirname, '../dist/assets/'),
			},
		]),
	],
});
