const path = require("path");

module.exports = {
  entry: './index.js',
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: 'index.min.js',
    libraryTarget: 'umd'
  },
  mode: "production",
  devtool: "source-map",
  externals: [
    {
      "2d-engine": {
        root: "TwoDeeEngine",
        commonjs: "2d-engine",
        commonjs2: "2d-engine",
        amd: "2d-engine"
      }
    }
  ],
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
