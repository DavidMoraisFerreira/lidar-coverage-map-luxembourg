const path = require('path');
const { CleanWebpackPlugin } = require('clean-webpack-plugin');
const HtmlWebpackPlugin = require("html-webpack-plugin");
const UglifyJsPlugin = require('uglifyjs-webpack-plugin');

const isDevelopment = process.env.NODE_ENV !== 'production'
const webpack = require('webpack');
const ASSET_PATH = process.env.ASSET_PATH || '/';

module.exports = {
  entry: './src/Index.ts',
  devtool: 'source-map',
  mode: isDevelopment ? 'development' : 'production',
  module: {
    rules: [
      {
        test: /\.js$/,
        enforce: "pre",
        loader: "source-map-loader"
      },
      {
        test: /\.(ts|tsx)$/,
        enforce: 'pre',
        use: [
          {
            loader: 'eslint-loader'
          },
        ],
        exclude: /node_modules/,
      },
      {
        test: [/\.(js|ts)$/],
        exclude: /(node_modules)/,
        use: {
          loader: 'babel-loader',
          options: {
            presets: [
              '@babel/preset-env',
              '@babel/typescript'
            ]
          }
        }
      },
      {
        test: /\.css$/,
        use: [
          'style-loader',
          'css-loader'
        ],
      },
      {
        test: /\.(png|svg|jpg|gif|ico)$/,
        use: [
          {
            loader: 'file-loader',
            options: {
              esModule: false,
            },
          },
        ],
      },
    ],
  },
  resolve: {
    extensions: ['.ts', '.tsx', '.js', '.jsx'],
  },
  output: {
    filename: 'bundle.js',
    path: path.resolve(__dirname, 'dist'),
	publicPath: ASSET_PATH,
  },
  devServer: {
    contentBase: path.join(__dirname, 'dist'),
    compress: true,
    port: 9000
  },
  plugins: [
    new CleanWebpackPlugin(),
    new HtmlWebpackPlugin({
      template: "./src/index.ejs",
      filename: "index.html",
      hash: true,
      inject: true
    }),
	new webpack.DefinePlugin({
      'process.env.ASSET_PATH': JSON.stringify(ASSET_PATH),
    })
  ],
  optimization: {
    //minimizer: [new UglifyJsPlugin({
    //  parallel: true,
    //  sourceMap: true
    //})],
  },
};