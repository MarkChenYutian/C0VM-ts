const path = require('path');


var config = {
  mode: "development",
  watch: true,
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

var htmlConfig = Object.assign({}, config, {
  devtool: false,
  entry: {
    main: "./src/web_main.ts",
  },
  optimization: {
    // concatenateModules: true,
    // minimize: true
  },
  output: {
    path: path.resolve(__dirname, './public'),
    filename: "bundle.js",
    library: "c0vm_ts",
    libraryTarget: "window",
    libraryExport: "default"
  }
});

var consoleConfig = Object.assign({}, config, {
  devtool: "inline-source-map",
  target: "node",
  entry: {
    main: "./src/console_main.ts",
  },
  output: {
    path: path.resolve(__dirname, './public'),
    filename: "console_test.js"
  }
});

module.exports = [htmlConfig, consoleConfig];
