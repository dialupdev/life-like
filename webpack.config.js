const path = require("path");
const WasmPackPlugin = require("@wasm-tool/wasm-pack-plugin");
const HtmlWebpackPlugin = require("html-webpack-plugin");

module.exports = {
  devtool: "eval-source-map",
  entry: "./src/main.ts",
  output: {
    path: path.resolve(__dirname, "./dist"),
    publicPath: "/",
  },
  resolve: {
    extensions: [".ts", ".js"],
  },
  module: {
    rules: [
      { test: /\.ts$/, loader: "ts-loader" },
      {
        test: /\.css$/,
        use: ["style-loader", "css-loader"],
      },
    ],
  },
  plugins: [
    new WasmPackPlugin({
      crateDirectory: path.resolve(__dirname, "core"),
      args: "--log-level warn",
      extraArgs: "--no-pack",
    }),
    new HtmlWebpackPlugin({
      template: "./src/index.html",
    }),
  ],
  experiments: {
    asyncWebAssembly: true,
  },
  devServer: {
    compress: true,
    historyApiFallback: true,
    port: 9000,
  },
};
