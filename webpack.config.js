/* jshint esversion: 6 */
const path = require('path');
/* 
html-webpack-plugin包有两个作用：
1.根据提供的模板，在内存根目录中托管一个html页面
2.将打包好的bundle.js文件，追加到</body>标签前面
*/
const htmlWebpackPlugin = require('html-webpack-plugin');
// 打包前清除上次打包的文件夹 ---clean-webpack-plugin插件，webpack4以后需要使用结构赋值的方式声明，如const { CleanWebpackPlugin }
const { CleanWebpackPlugin } = require('clean-webpack-plugin');
const UglifyJsPlugin = require('uglifyjs-webpack-plugin');
module.exports = {
    // resolve()方法把多个片段从右往左解析成绝对路径，如果拼接后还不是绝对路径，将自动叠加上当前目录
    // 绝对路径以 /开头
    entry: {
        app: './src/main.js',
        vendors1: ['jquery']
    },
    output: {
        // 输出当前dirname,当前时根目录，根目录下的的dist路径
        path: path.resolve(__dirname, 'dist'),
        filename: '[name].[hash:8].js'
    },
    plugins: [
        // new CleanWebpackPlugin(['dist']),
        // 新版本webpack已经不能传一个数组了，参数必须是对象，而且声明时，需要使用结构赋值的方式 const {CleanWebpackPlugin}
        new CleanWebpackPlugin(),
        new htmlWebpackPlugin({
            // 如果从右往左组织的路径片段，不是绝对路径(/开头)，会自动叠加上本地目录
            // 使用path.join(__dirname,'./src/index.html')也可以
            template: './src/index.html',
            filename: 'index.html'
        })
    ],
    optimization: {//bundle.js中只存放自己的包，把main.js中引入的第三方包抽离出来
        splitChunks: {
            // chunks 值为async：表示抽取异步模块 值为initial表示抽取同步模块 all:表示对所有模块生效
            // chunks: 'all',
            // 使用缓存组
            cacheGroups: {
                vendors: {//抽离第三方插件
                    test: /[\\/]node_modules[\\/]/,
                    chunks: 'initial',
                    name: 'vendors1',
                    priority: 10,
                    enforce: true

                }
            }
        },
        //     // 没有下面代码：每次运行npm run pub,hash值就会发生变化
        runtimeChunk: {//为webpack创建代码运行单独的chunk
            // 作用：单独分离出webpack的一些运行文件，方便浏览器缓存，提升加载速度
            name: 'manifest'
        },
        minimizer: [
            new UglifyJsPlugin({
                cache: true,
                parallel: true, //并行压缩
                sourceMap: true //源码映射
            })
        ]
    },
    module: {
        rules: [
            { test: /\.css$/, use: ['style-loader', 'css-loader'] },
            { test: /\.scss$/, use: ['style-loader', 'css-loader', 'sass-loader'] },
            { test: /\.less$/, use: ['style-loader', 'css-loader', 'less-loader'] },
            // { test: /\.(png|jpg|jpeg|gif|bmp)$/, use: 'url-loader?limit=3462842&name=images/[hash:8]-[name][ext'},
            {
                test: /\.(jpg|jpeg|bmp|png|gif)$/,
                use: [{
                    loader: 'url-loader',
                    options: {
                        /* 
                        npm run dev时，走的路线是：webpack-dev-server。会做以下事情：1.js代码托管在内存根目录下，在package.json中配置的"scripts"下的dev中配置 2.html-webpack-plugin有两个作用：将html代码也托管到根目录，同时将打包好的用script标签引入的文件追加到
                        body关闭标签的前面。3.outputPath:'./images'，是将css中解析的文件托管到根目录/下
                        images文件夹中。

                        然而，当使用$ webpack  或者$npm run pub命令打包文件时，将叠加上outputPath上定义
                        的路径path:path.resolve(__dirname,'dist')即dist/*.js  和dist/images/*.jpeg等

                        */
                        // 这里这顶打包的图片图片是dist下的images文件夹
                        // 在output里面已经声明了打包文件的dist路径
                        outputPath: './images',
                        // 图片大小为48509b,只有设定的limit值小于48509时才会打包到dist/images文件夹。反之，则转化为base64编码字符串
                        // a.打包到dist/images文件夹下
                        limit: 48500,
                        // b.打包成base64字符串
                        // limit: 48510,
                        name: '[hash:8]-[name].[ext]'

                    }
                }]

            },
            { test: /\.js$/, use: 'babel-loader', exclude: /node_modules/ }
        ]
    }
};