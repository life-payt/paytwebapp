/*
Author: University of Aveiro
Co-funded by the EU LIFE Programme with the reference LIFE15 ENV/PT/609
*/


var webpack = require('webpack');
var path = require('path');

var BUILD_DIR = path.resolve(__dirname, 'src/client/public');
var APP_DIR = path.resolve(__dirname, 'src/client/app');

var config = {
    //devtool: "source-map",
    entry: APP_DIR + '/index.jsx',
    output: {
        path: BUILD_DIR,
        filename: 'bundle.js'
    },
    module: {
        loaders: [{
            test: /\.jsx?/,
            include: APP_DIR,
            loader: 'babel-loader',
            exclude: /node_modules/
        }]
    },
};

module.exports = config;
