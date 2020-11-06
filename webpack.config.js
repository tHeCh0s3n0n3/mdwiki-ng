const path = require('path');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const OptimizeCssAssetPlugin = require('optimize-css-assets-webpack-plugin');
const MinifyPlugin = require('babel-minify-webpack-plugin');
const TerserPlugin = require('terser-webpack-plugin');
const HtmlPlugin = require('html-webpack-plugin');
const InlineChunkHtmlPlugin = require('inline-chunk-html-plugin');
const HTMLInlineCSSWebpackPlugin = require('html-inline-css-webpack-plugin').default; // Require the plugin
const FaviconsWebpackPlugin = require('favicons-webpack-plugin');

const PATHS = {
  src: path.join(__dirname, 'src'),
  img: path.join(__dirname, 'src/img'),
  styles: path.join(__dirname, 'src/css'),
  build: path.join(__dirname, 'build'),
  dist: path.join(__dirname, 'dist'),
};

module.exports = {
  entry: path.join(PATHS.src, 'js', 'app.js'),
  mode: 'production',
  output: {
    publicPath: PATHS.dist,
    path: PATHS.build,
    filename: 'bundle.js',
  },
  plugins: [
    new MiniCssExtractPlugin(),
    new MinifyPlugin(),
    new HtmlPlugin(
      {
        inject: true,
        title: "Halfmoon Test Site!",
        template: path.join(PATHS.src, 'index.tt.html'),
        filename: path.join(PATHS.dist, 'index.html'),
        minify: {
          collapseWhitespace: true,
          keepClosingSlash: true,
          removeComments: true,
        },
      }),
    new InlineChunkHtmlPlugin(HtmlPlugin, [/.*/]),
    new HTMLInlineCSSWebpackPlugin(),
  ],
  module: {
    rules: [
      {
        test: /\.js$/,
        exclude: /(node_modules|bower_components)/,
        use: {
          loader: 'babel-loader',
          options: {
            presets: ['@babel/preset-env'],
          },
        },
      },
      {
        test: /\.css$/,
        use: [
          MiniCssExtractPlugin.loader,
          //'style-loader',
          'css-loader',
        ],
      },
      {
        test: /\.(jpe?g|svg|gif|png|eot|woff2?|otf|ttf)$/,
        use: [
          'url-loader'
        ],
      },
      /*{        
        test: /favicon\.png$/,
        use: [
          'file-loader',
        ]
      },*/
    ],
  },
  optimization: {
    minimize: true,
    minimizer: [
      new TerserPlugin ({
        extractComments: false,
      }),
      new OptimizeCssAssetPlugin(),
    ],
  },
};