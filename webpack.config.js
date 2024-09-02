import HtmlWebpackPlugin from "html-webpack-plugin";
import path from "path";

export default {
  devtool: "eval-source-map",
  entry: "./src/main.ts",
  output: {
    path: path.resolve("./dist"),
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
    new HtmlWebpackPlugin({
      template: "./src/index.html",
    }),
  ],
  devServer: {
    compress: true,
    historyApiFallback: true,
    port: 9000,
  },
};
