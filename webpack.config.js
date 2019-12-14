const HtmlWebpackPlugin = require('html-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
// To clean the dist folder on build
const { CleanWebpackPlugin } = require('clean-webpack-plugin');

const mode = process.argv.indexOf('--prod') === -1 ? 'development' : 'production';
module.exports = {
  mode,
  module: {
    rules: [
      {
        test: /\.css$/i,
        // Extract the CSS files as another resource (except for dev where we use hot reload)
        use: [ mode === 'production' ? {
          loader: MiniCssExtractPlugin.loader
        } : 'style-loader', 'css-loader'],
      },
      {
        test: /\.(png|jpg|jpeg)$/i,
        // Load these files as raw (put them in the bundle)
        use: [{
          loader: 'file-loader',
        }],
      },
      {
        test: /\.html$/i,
        use: [{
          // The extract loader will be called implicitely by the HTML plugin for images' file paths
          loader: 'html-loader',
        }],
      }
    ],
  },
  stats: mode === 'production' ? 'normal' : 'errors-warnings',
  plugins: [
    new CleanWebpackPlugin(),
    new HtmlWebpackPlugin({
      template: "src/index.html",
      hash: true,
      // With v4 of the webpack html plugin, this can be removed
      minify: mode === 'production' ? {
        collapseWhitespace: true,
        removeComments: true,
        removeRedundantAttributes: true,
        removeScriptTypeAttributes: true,
        removeStyleLinkTypeAttributes: true,
        useShortDoctype: true
      } : false,
    }),
    new MiniCssExtractPlugin(),
  ],
};
