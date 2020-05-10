/* jshint esversion: 6 */
// 对于webpack4使用的新插件，可以在ngithub或者npm中搜索这些插件名，然后会有对应的配置说明
const path = require('path');
// 导入每次删除【打包文件夹】的插件
const { CleanWebpackPlugin } = require('clean-webpack-plugin');
const UglifyJsPlugin = require('uglifyjs-webpack-plugin');
/* 
html-webpack-plugin包有两个作用：
1.根据提供的模板，在内存根目录中托管一个html页面
2.将打包好的bundle.js文件，追加到</body>标签前面
*/
const htmlWebpackPlugin = require('html-webpack-plugin');
/*
mini-css-extract-plugin 分离css
optimize-css-assets-webpack-plugin 压缩css
*/
const miniCssExtractPlugin = require('mini-css-extract-plugin');
const optimizeCssAssetsWebpackPlugin = require('optimize-css-assets-webpack-plugin');
module.exports = {
    // mode: 'production',//告诉webpack是生产环境还是开发环境，mode取值：'production' 'development' 'none'
    // resolve()方法把多个片段从右往左解析成绝对路径，如果拼接后还不是绝对路径，将自动叠加上当前目录
    // 绝对路径以 /开头
    // entry: './src/main.js',
    /* 
    注意：在抽离第三方包的时候，上面的entry入口配置要发生变化
    */
    // 多入口：app 和vendors1两个入口
    entry: {
        app: './src/main.js',
        // vendor小贩、摊贩、（某种产品的）销售公司
        // 和plugin中元素name的名称一致即可
        vendors1: ['jquery']
    },
    output: {
        // 
        path: path.resolve(__dirname, 'dist'),
        filename: '[name].[hash:8].js',
    },
    plugins: [
        // 参数是一个数组，每次重新发布后，会重现删除上次打包文件
        // new CleanWebpackPlugin(['dist']),
        // 由于webpack版本更新，新版本的new CleanWebpackPlugin(object),参数必须是一个对象，不能像低版本那样传一个数组了
        new CleanWebpackPlugin(),
        new htmlWebpackPlugin({
            // 如果从右往左组织的路径片段，不是绝对路径(/开头)，会自动叠加上本地目录
            // 使用path.join(__dirname,'./src/index.html')也可以
            template: './src/index.html',
            filename: 'index.html',
            minify: {//minify是一个压缩选项，默认值为false,表示默认不对html文件进行压缩
                removeComments: true,//移除注释
                collapseWhitespace: true,//移除空格 
                removeAttributeQuotes: true//移除标签中属性值的引号
            }
        }),
        /* 
        CommonsChunkPlugin在webpack4中已被移除，是被移除的四个常用plugin之一（UglifyjsWebpackPlugin，CommonsChunkPlugin，ModuleConcatenationPlugin，NoEmitOnErrorsPlugin），改用optimization.splitChunks和optimization.runtimeChunk替代
        */
        // webpack4中commonsChunkPlugin方法被移除了，需要使用webpack4中的配置
        // new webpack.optimize.CommonsChunkPlugin({
        //     name: 'vendors1',//指定要抽离的入库名称
        //     filename: 'vendors.js'//指定抽离的第三方包文件，将来打包时除了会有bundle.js文件以外，还有一个抽离的第三方包文件vendors.js

        // })
        new miniCssExtractPlugin({
            // name是entry入口声明的文件名字，本配置中是app
            filename: ' css/[name].css'
            // 打包的组块文件名，可选
            // ,chunkFilename:'css/[id].css'
        })
    ],
    // 分离包
    optimization: {//bundle.js中只存放自己的包，把main.js中引入的第三方包抽离出来
        splitChunks: {
            // chunks 值为async：表示按需(异步)抽取模块 值为initial表示抽取同步模块 all:表示对所有模块生效
            // chunks: 'all',
            // 使用缓存组
            cacheGroups: {
                // 这是一个抽包规则
                vendors: {//抽离第三方插件
                    test: /[\\/]node_modules[\\/]/,
                    chunks: 'initial',
                    name: 'vendors1',
                    priority: 10,
                    enforce: true

                }
            }
        },
        // 没有下面代码：每次运行npm run pub,hash值就会发生变化
        runtimeChunk: {//为webpack创建代码运行单独的chunk
            // 作用：单独分离出webpack的一些运行文件，方便浏览器缓存，提升加载速度
            name: 'manifest'
        },
        minimizer: [
            // 对生成的js代码中进行压缩
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
                loader: 'url-loader',
                options: {
                    // 打包到本地的文件路径
                    outputPath: './images',
                    /* 
                       options选项中这个publicPath必须配置，否则下面分离css包后，npm run dev是图片不显示。
                       原因是：分离css包时，分离的css文件放在css文件夹下，生成的托管页面中图片的路径变成了http://localhost:3000/%20css/images/00759c6d-VDD.jpeg， 托管图片等静态资源的路径使用publicPath
                       声明，../images,让图片路径设定为localhost:3000/images/00759c6d-VDD.jpeg
                    */
                    publicPath: '../images',
                    // 图片实际大小为48509
                    // limit: 48510,
                    limit: 48500,
                    name: '[hash:8]-[name].[ext]'

                }
            },
            { test: /\.js$/, use: 'babel-loader', exclude: /node_modules/ }
        ]
    }
};
/*
1，问题，重新打包前，删除上次打包的文件
当我们再次使用 $ webpack 或者$ npm run pub打包时，重新在dist文件中生成了打包文件，如果代码继续更改，就分不清
哪些是上次打包生成的文件，哪些是最新生成的，如何解决此问题呢？
解决：安装 clean-webpack-plugin插件，可以完成每次打包前，清理上次打包内容的任务

2.问题，分离第三方包，减小bundle.js的大小：
bundle.js的文件还是过大，是因为我们引入了第三方包jquery和sass相关包，有没有办法【将第三方包分离出来，而bundle.js中只存放
自己的包呢】？

*/