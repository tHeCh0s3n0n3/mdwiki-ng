const path = require('path');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const TerserPlugin = require('terser-webpack-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const HTMLInlineCSSWebpackPlugin = require('html-inline-css-webpack-plugin').default; // Require the plugin
const HTMLInlineJSWebpackPlugin = require('html-inline-script-webpack-plugin');

const PATHS = {
  src: path.join(__dirname, 'src'),
  img: path.join(__dirname, 'src/img'),
  styles: path.join(__dirname, 'src/css'),
  build: path.join(__dirname, 'build'),
  dist: path.join(__dirname, 'dist'),
};

module.exports = {
  entry: path.join(PATHS.src, 'js', 'app.js'),
  //mode: 'development',
  mode: 'production',
  output: {
    publicPath: PATHS.dist,
    path: PATHS.build,
    filename: 'bundle.js',
  },
  plugins: [
    new MiniCssExtractPlugin(),
    new HtmlWebpackPlugin(
      {
        inject: true,
        title: "MDWiki-ng",
        template: path.join(PATHS.src, 'index.tt.html'),
        filename: path.join(PATHS.dist, 'index.html'),
        minify: {
          collapseWhitespace: true,
          keepClosingSlash: true,
          removeComments: true,
        },
      }),
    new HTMLInlineCSSWebpackPlugin(),
    new HTMLInlineJSWebpackPlugin([
      /^bundle\.js$/
    ]),
  ],
  module: {
    rules: [
      {
        test: /\.js$/,
        exclude: /(node_modules|bower_components)/,
      },
      {
        test: /\.css$/,
        use: [
          MiniCssExtractPlugin.loader,
          //'style-loader',
          {
            loader: 'css-loader',
            options: {
              importLoaders: 2,
              sourceMap: true,
            }
          }
        ],
      },
      {
        test: /\.(jpe?g|svg|gif|png|eot|woff2?|otf|ttf)$/,
        use: [
          {
            loader: 'file-loader',
            options: {
              outputPath: PATHS.dist
            }
          },
        ],
      },
    ],
  },
  optimization: {
    minimize: true,
    minimizer: [
      new TerserPlugin ({
        extractComments: false,
        parallel: true,
      }),
    ],
  },
};