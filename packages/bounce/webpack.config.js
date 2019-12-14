const path = require("path");

module.exports = {
  entry: './index.js',
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: 'index.min.js'
  },
  mode: "development",
  devtool: "source-map",
  externals: {
    "2d-engine": "TwoDeeEngine",
    "jquery": "jQuery"
  },
  module: {
    rules: [
      {
        test: /\.m?js$/,
        exclude: /(node_modules|bower_components)/,
        use: {
          loader: 'babel-loader',
          options: {
            presets: ['@babel/preset-env']
          }
        }
      }
    ]
  }
};
