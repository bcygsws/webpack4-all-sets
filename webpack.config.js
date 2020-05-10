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
/*
mini-css-extract-plugin 分离css
optimize-css-assets-webpack-plugin 压缩css
*/
const miniCssExtractPlugin = require('mini-css-extract-plugin');
const optimizeCssAssetsWebpackPlugin = require('optimize-css-assets-webpack-plugin');
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
            // 覆盖掉output中文件名的声明，打包html时文件名为index.html
            filename: 'index.html',
            minify: {//是一个压缩选项，minify默认值为false,表示不对生成的html文件进行压缩
                removeComments: true,//移除注释
                collapseWhitespace: true,//移除空格
                removeAttributeQuotes: true//移除属性值的引号(并不是所有的引号都去掉，去掉引号会发生的错误的引号不会被移除)
            }
        }),
        // 定义将src下的一个或者多个.css .less .sass(.scss)文件打包生成的一个css文件名
        new miniCssExtractPlugin({
            // name是entry入口声明的文件名字，本配置中是app
            // 此处的filename会覆盖掉output中filename的声明 
            filename: ' css/[name].css'
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
            }),
            // 対生成的css代码进行压缩，mode='production'是生效
            new optimizeCssAssetsWebpackPlugin()
        ]
    },
    module: {
        rules: [
            {
                test: /\.css$/,
                include: [path.resolve(__dirname, 'src')],
                exclude: /node_modules/,
                use: [
                    // 配置了{ loader: miniCssExtractPlugin.loader }，就不用配置style-loader
                    // {loader:'style-loader'} //将处理结束的css代码存到js中，运行时嵌入到<style></style>标签中，然后挂载到页面上
                    { loader: miniCssExtractPlugin.loader },
                    { loader: 'css-loader' },//css加载器，使得webpack能够识别css代码
                    { loader: 'postcss-loader' }//承载autoprefixer功能，为css添加前缀
                ]
            },
            {
                test: /\.scss$/,
                include: [path.resolve(__dirname, 'src')],
                exclude: /node_modules/,
                use: [
                    { loader: miniCssExtractPlugin.loader },
                    // 'style-loader',
                    { loader: 'css-loader' },
                    { loader: 'postcss-loader' },
                    {
                        loader: 'sass-loader',
                        options: {//loader的额外参数，配置视loader具体而定  
                            sourceMap: true//要安装resolve-url-loader插件，当此配置启用，才能正确加载sass里的相对路径
                        }
                    },


                ]
            },
            {
                test: /\.less$/,
                include: [path.resolve(__dirname, 'src')],
                exclude: /node_modules/,
                use: [
                    { loader: miniCssExtractPlugin.loader },
                    { loader: 'css-loader' },
                    { loader: 'postcss-loader' },
                    {
                        loader: 'less-loader',
                        options: {//loader的额外参数，配置视loader具体而定  
                            sourceMap: true//要安装resolve-url-loader插件，当此配置启用，才能正确加载sass里的相对路径
                        }
                    }
                ]
            },
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
                        // 在output里面已经声明了打包文件的dist路径，打包图片时，叠加images路径
                        outputPath: './images',
                        /* 
                        options选项中这个publicPath必须配置，否则下面分离css包后，npm run dev是图片不显示。
                        原因是：分离css包时，分离的css文件放在css文件夹下，生成的托管页面中图片的路径变成了http://localhost:3000/%20css/images/00759c6d-VDD.jpeg，
                        */
                        publicPath: '../images',
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