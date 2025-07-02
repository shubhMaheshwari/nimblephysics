const path = require("path");
const HtmlWebpackPlugin = require("html-webpack-plugin");
const CopyWebpackPlugin = require('copy-webpack-plugin');

module.exports = {
  mode: 'development',
  entry: {
    live: "./src/live.ts",
    NimbleStandaloneReact: "./src/NimbleStandaloneReact.ts",
    NimbleStandalone: "./src/NimbleStandalone.ts",
    NimbleRemote: "./src/NimbleRemote.ts"
  },
  module: {
    rules: [
      {
        test: /\.(js|ts)$/,
        exclude: /node_modules/,
        use: ["babel-loader"],
      },
      {
        test: /\.s[ac]ss$/i,
        use: [
          "style-loader",
          "css-loader",
          "sass-loader",
        ],
      },
      {
        test: /\.txt$/i,
        use: "raw-loader",
      },
      {
        test: /\.(png|jpg|gif|mp4)$/i,
        use: [
          {
            loader: 'file-loader',
            options: {
              name: '[name].[hash].[ext]',
              outputPath: 'data',
              publicPath: 'data',
            },
          },
        ],
      },
    ],
  },
  resolve: {
    extensions: ["*", ".ts", ".js"],
  },
  output: {
    path: path.join(__dirname, "dist"),
    publicPath: "/",
    filename: "[name].js"
  },
  plugins: [
    new HtmlWebpackPlugin({
      template: path.join(__dirname, "src", "index.html"),
    }),
    new CopyWebpackPlugin({
      patterns: [
        { from: 'src/data/img', to: 'images' },
        { from: '*.mp4', to: 'data', context: 'src/data/' },
      ]
    })
  ],
  devServer: {
    static: path.join(__dirname, "dist"),
    compress: true,
    port: 19001
  }
};