const HtmlWebpackPlugin = require('html-webpack-plugin')
const MiniCssExtractPlugin = require('mini-css-extract-plugin')
const config = require('./package.json')
const template = 'index.html'

module.exports = {
  mode: "development",
  entry: './src/index.ts',
  resolve: {
    extensions: ['.ts', '.js']
  },
  module: {
    rules: [
      {
        test: /\.ts$/,
        use: 'ts-loader',
        exclude: /node_modules/
      },
      {
        test: /\.css$/,
        use: [
          MiniCssExtractPlugin.loader,
          'css-loader'
        ],
      },
      {
        test: /\.(png|jpe?g|gif|svg|eot|ttf|woff|woff2)$/i,
        loader: 'url-loader',
        options: {
          limit: 8192,
        },
      },
    ]
  },
  plugins: [
    new HtmlWebpackPlugin(Object.assign(config.app, { template })),
    new MiniCssExtractPlugin({ filename: 'main.css' })
  ]
}
