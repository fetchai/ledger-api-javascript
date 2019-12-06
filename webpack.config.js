module.exports = [
    {
        mode: 'development',
        entry: './src/fetchai/ledger/index.js',
        node: {
            fs: 'empty',
        },
        module: {
            rules: [
                {
                    test: /\.(js)$/,
                    exclude: /node_modules/,
                    use: ['babel-loader']
                }
            ]
        },
        resolve: {
            extensions: ['*', '.js']
        },
        output: {
            path: __dirname,
            publicPath: '/',
            filename: 'index.js',
            library: 'fetchai',
            libraryTarget: 'umd',
            globalObject: 'this'
        },
        devServer: {
            contentBase: '.'
        }
    },
    {
        mode: 'development',
        entry: './src/fetchai/ledger/index.js',
        node: {
            fs: 'empty',
        },
        module: {
            rules: [
                {
                    test: /\.(js)$/,
                    exclude: /node_modules/,
                    use: ['babel-loader']
                }
            ]
        },
        resolve: {
            extensions: ['*', '.js']
        },
        output: {
            path: __dirname + '/bundle',
            publicPath: '/bundle/',
            filename: 'fetchai-ledger-api.js',
            library: 'fetchai',
            libraryTarget: 'var'
        },
        devServer: {
            contentBase: './bundle'
        }
    },
    {
        mode: 'production',
        entry: './src/fetchai/ledger/index.js',
        node: {
            fs: 'empty',
        },
        module: {
            rules: [
                {
                    test: /\.(js)$/,
                    exclude: /node_modules/,
                    use: ['babel-loader']
                }
            ]
        },
        resolve: {
            extensions: ['*', '.js']
        },
        output: {
            path: __dirname + '/bundle',
            publicPath: '/bundle/',
            filename: 'fetchai-ledger-api.min.js',
            library: 'fetchai',
            libraryTarget: 'var'
        },
        devServer: {
            contentBase: './bundle'
        }
    }
]
