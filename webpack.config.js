module.exports = [
    {
        mode: 'development',
        entry: './src/fetchai/ledger/index.ts',
        node: {
            fs: 'empty',
        },
        module: {
            rules: [
                {
                    test: /\.(ts)$/,
                    exclude: /node_modules/,
                    use: ['awesome-typescript-loader']
                }
            ]
        },
        resolve: {
            extensions: ['*', '.js', '.ts']
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
        entry: './src/fetchai/ledger/index.ts',
        node: {
            fs: 'empty',
        },
        module: {
            rules: [
                {
                    test: /\.(ts)$/,
                    exclude: /node_modules/,
                    use: ['awesome-typescript-loader']
                }
            ]
        },
        resolve: {
            extensions: ['*', '.js', '.ts']
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
        entry: './src/fetchai/ledger/index.ts',
        node: {
            fs: 'empty',
        },
        module: {
            rules: [
                {
                    test: /\.(ts)$/,
                    exclude: /node_modules/,
                    use: ['awesome-typescript-loader']
                }
            ]
        },
        resolve: {
            extensions: ['*', '.js', '.ts']
        },
        output: {
            path: __dirname + '/bundle',
            publicPath: '/bundle/',
            filename: 'fetchai-ledger-api.min.js',
            library: 'fetchai',
            libraryTarget: 'var',
            sourceMapFilename: 'fetchai-ledger-api.min.js.map'
        },
        devtool: 'source-map',
        devServer: {
            contentBase: './bundle'
        }
    }
]
