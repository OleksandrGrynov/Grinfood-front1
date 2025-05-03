const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const Dotenv = require('dotenv-webpack');
const detect = require('detect-port').default;

module.exports = async () => {
    const defaultPort = 3000;
    const port = await detect(defaultPort);
    console.log(`✅ Webpack Dev Server буде запущений на порту: ${port}`);

    return {
        entry: './src/index.js',
        output: {
            path: path.resolve(__dirname, 'dist'),
            filename: 'bundle.js',
            publicPath: '/',
            clean: true,
        },
        mode: 'development',
        devServer: {
            static: path.resolve(__dirname, 'public'),
            port,
            open: true,
            hot: true,
            historyApiFallback: true,
        },
        resolve: {
            fallback: {
                buffer: false,
                crypto: false,
                stream: false,
                os: false,
            },
        },
        module: {
            rules: [
                {
                    test: /\.js$/,
                    exclude: /node_modules/,
                    use: 'babel-loader',
                },
                {
                    test: /\.css$/i,
                    use: ['style-loader', 'css-loader'],
                },
                // ✅ CSS Modules для *.module.scss
                {
                    test: /\.module\.scss$/,
                    use: [
                        'style-loader',
                        {
                            loader: 'css-loader',
                            options: {
                                modules: true,
                            },
                        },
                        'sass-loader',
                    ],
                },
                // Звичайні SCSS файли
                {
                    test: /\.scss$/,
                    exclude: /\.module\.scss$/,
                    use: ['style-loader', 'css-loader', 'sass-loader'],
                },
                {
                    test: /\.(png|jpe?g|gif|svg)$/i,
                    type: 'asset/resource',
                },
            ],
        },
        plugins: [
            new HtmlWebpackPlugin({
                template: './public/index.html',
            }),
            new Dotenv(),
        ],
    };
};
