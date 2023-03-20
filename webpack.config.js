var path = require("path");

module.exports = {
  mode: "production",
  entry: "./index.ts",
  target: "node",
  devtool: "inline-source-map",
  output: {
    path: path.resolve(__dirname, "build"),
    filename: "bundle.js",
    clean: true,
  },
  resolve: {
    extensions: [".ts", ".js"], //resolve all the modules other than index.ts
  },
  module: {
    rules: [
      {
        use: "ts-loader",
        test: /\.ts?$/,
      },
    ],
  },
};
