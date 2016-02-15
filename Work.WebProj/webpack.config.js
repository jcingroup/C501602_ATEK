var path = require('path');
var webpack = require('webpack');
//var node_modules_dir = path.resolve(__dirname, 'node_modules');
module.exports = {
    entry: {
        //基礎功能
        m_menu: path.resolve(__dirname, 'Scripts/src/tsx/m-menu.js'),
        m_menu_set: path.resolve(__dirname, 'Scripts/src/tsx/m-menu_set.js'),
        m_login: path.resolve(__dirname, 'Scripts/src/tsx/m-login.js'),
        m_roles: path.resolve(__dirname, 'Scripts/src/tsx/m-roles.js'),
        m_change_password: path.resolve(__dirname, 'Scripts/src/tsx/m-change_password.js'),
        m_users: path.resolve(__dirname, 'Scripts/src/tsx/m-users.js'),
        //後台 管理者
        m_news: path.resolve(__dirname, 'Scripts/src/tsx/m-news.js'),
        m_aboutus: path.resolve(__dirname, 'Scripts/src/tsx/m-aboutus.js'),
        m_parm: path.resolve(__dirname, 'Scripts/src/tsx/m-parm.js'),
        m_index_img: path.resolve(__dirname, 'Scripts/src/tsx/m-index_img.js'),
        m_banner: path.resolve(__dirname, 'Scripts/src/tsx/m-banner.js'),
        m_support: path.resolve(__dirname, 'Scripts/src/tsx/m-support.js'),
        m_product_category_l1: path.resolve(__dirname, 'Scripts/src/tsx/m-product_category_l1.js'),
        m_product_category_l2: path.resolve(__dirname, 'Scripts/src/tsx/m-product_category_l2.js'),
        m_product_category_l3: path.resolve(__dirname, 'Scripts/src/tsx/m-product_category_l3.js'),
        m_all_category: path.resolve(__dirname, 'Scripts/src/tsx/m-all_category.js'),
        m_sortable: path.resolve(__dirname, 'Scripts/src/tsx/m-sortable.js'),//測試sortable
        vendors: ['jquery', 'react', 'react-bootstrap', 'moment']
    },
    output: {
        path: path.resolve(__dirname, 'Scripts/build/app'),
        filename: '[name].js'
    },
    module: {
        loaders: [
          { test: /\.jsx$/, loader: 'babel' },
          { test: /\.css$/, loader: "style-loader!css-loader" }
        ]
    },
    resolve: {
        alias: {
            moment: "moment/moment.js"
        },
        modulesDirectories: ["app_modules", "node_modules"],
        extensions: ['', '.js', 'jsx', '.json']
    },
    plugins: [
      new webpack.optimize.CommonsChunkPlugin('vendors', 'vendors.js'),
      new webpack.ContextReplacementPlugin(/moment[\/\\]locale$/, /zh-tw/),
      new webpack.optimize.UglifyJsPlugin({ compress: { warnings: false } })
    ]
};