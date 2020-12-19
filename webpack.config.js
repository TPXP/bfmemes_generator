const HtmlWebpackPlugin = require('html-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
// To clean the dist folder on build
const { CleanWebpackPlugin } = require('clean-webpack-plugin');

const mode = process.argv.indexOf('--prod') === -1 ? 'development' : 'production';
let publicPath = mode === "production" ? "https://generator.bfmemes.com/" : "";
if(process.env['VERCEL_URL'])
  publicPath = `https://${process.env['VERCEL_URL']}/`
process.argv.forEach(v => {
  if(v.startsWith('--url='))
    publicPath = v.substr(6);
});
if(!publicPath.endsWith('/'))
  publicPath += '/';

module.exports = {
  mode,
  output:{
    publicPath,
    filename: '[hash].js',
  },
  module: {
    rules: [
      {
        test: /\.css$/i,
        // Extract the CSS files as another resource - don't put them in JS (except for dev where we use hot reload)
        use: [ mode === 'production' ? {
          loader: MiniCssExtractPlugin.loader
        } : 'style-loader', 'css-loader'],
      },
      {
        test: /\.(png|jpe?g|webp)$/i,
        // Load these files as raw (put them in the bundle)
        use: [{
          loader: 'responsive-loader',
          options: {
            adapter: require('responsive-loader/sharp')
          }
        }]
      }
    ],
  },
  stats: mode === 'production' ? 'normal' : 'errors-warnings',
  plugins: [
    // Clear the dist directory when building a new bundle
    new CleanWebpackPlugin(),
    new HtmlWebpackPlugin({
      template: "src/index.ejs",
      hash: true,
    }),
    // Put the CSS files aside the JS bundle
    new MiniCssExtractPlugin({
      filename: '[hash].css',
    }),
  ],
};
