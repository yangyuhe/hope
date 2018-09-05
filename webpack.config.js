const path = require("path")
const Clean = require("clean-webpack-plugin")


module.exports = {
    entry: {
        future:"./src/future.ts"
    },
    resolve: {
        extensions: ['.ts', '.js']
    },
    devtool: 'source-map',
    target:"node",
    output: {
        filename: "[name].js",
        path: path.resolve(__dirname, "dist"),
        libraryTarget:"umd",
        globalObject:"this"
    },
    module: {
        rules: [{
            test: /\.ts$/,
            use: [
                "ts-loader"
            ]
        }]
    },
    plugins: [
        new Clean(["./dist"])
    ]
}