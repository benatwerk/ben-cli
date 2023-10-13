const path = require("path");
const HtmlWebpackPlugin = require("html-webpack-plugin");
module.exports = {
    mode: "development",
    entry: "./src/index.js",
    output: {
        filename: "bundle.js",
        path: path.resolve(__dirname, "dist"),
    },
    devServer: {
        static: [
            {
                directory: path.resolve(__dirname, "public"),
                publicPath: "/",
            },
            "./dist",
        ],
        open: true,
        hot: true,
        port: 3000,
    },
    module: {
        rules: [
            {
                test: /\.jsx?$/,
                exclude: /node_modules/,
                use: {
                    loader: "babel-loader",
                    options: {
                        presets: ["@babel/preset-react"],
                    },
                },
            },
        ],
    },
    resolve: {
        extensions: [".js"],
    },
    plugins: [new HtmlWebpackPlugin({ template: "./index.html" })],
};
