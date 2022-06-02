const path = require('path');

module.exports = {
  mode: "development",
  // target: "node",
  // devtool: "inline-source-map",
  devtool: false,
  entry: {
    main: "./src/main.ts",
  },
  output: {
    path: path.resolve(__dirname, './build'),
    filename: "bundle.js",
    library: "c0vm_ts",
    libraryTarget: "window",
    libraryExport: "default"
  },
  resolve: {
    extensions: [".ts", ".tsx", ".js"],
  },
  module: {
    rules: [
      { 
        test: /\.tsx?$/,
        loader: "ts-loader"
      }
    ]
  }
};
