module.exports = {
    mode: 'development',
    entry: './src/fetchai/ledger/index.js',
    node: {
        fs: 'empty',
    },
    module: {
        rules: [
            {
                test: /\.(js)$/,
                use: ['babel-loader']
            }
        ]
    },
    resolve: {
        extensions: ['*', '.js']
    },
    output: {
        path: __dirname + '/bundle',
        publicPath: '/',
        filename: 'bundle.js'
    },
    devServer: {
        contentBase: './bundle'
    }
}
