var path = require('path');
var webpack = require('webpack');
//var node_modules_dir = path.resolve(__dirname, 'node_modules');
module.exports = {
    entry: {
        //基礎功能
        m_menu: path.resolve(__dirname, 'Scripts/src/tsx/m-menu.js'),
        m_login: path.resolve(__dirname, 'Scripts/src/tsx/m-login.js'),
        m_roles: path.resolve(__dirname, 'Scripts/src/tsx/m-roles.js'),
        m_change_password: path.resolve(__dirname, 'Scripts/src/tsx/m-change_password.js'),
        m_users: path.resolve(__dirname, 'Scripts/src/tsx/m-users.js'),
        //後台 管理者
        m_sales: path.resolve(__dirname, 'Scripts/src/tsx/m-sales.js'),
        m_sales_rank: path.resolve(__dirname, 'Scripts/src/tsx/m-sales_rank.js'),
        m_product: path.resolve(__dirname, 'Scripts/src/tsx/m-product.js'),
        m_purchase: path.resolve(__dirname, 'Scripts/src/tsx/m-purchase.js'),
        m_settle: path.resolve(__dirname, 'Scripts/src/tsx/m-settle.js'),
        m_news: path.resolve(__dirname, 'Scripts/src/tsx/m-news.js'),
        m_issue: path.resolve(__dirname, 'Scripts/src/tsx/m-issue.js'),
        m_product_category_l1: path.resolve(__dirname, 'Scripts/src/tsx/m-product_category_l1.js'),
        m_product_category_l2: path.resolve(__dirname, 'Scripts/src/tsx/m-product_category_l2.js'),
        m_product_set: path.resolve(__dirname, 'Scripts/src/tsx/m-product_set.js'),
        m_aboutus: path.resolve(__dirname, 'Scripts/src/tsx/m-aboutus.js'),
        m_parm: path.resolve(__dirname, 'Scripts/src/tsx/m-parm.js'),
        m_payment_reply: path.resolve(__dirname, 'Scripts/src/tsx/m-payment_reply.js'),
        m_banner: path.resolve(__dirname, 'Scripts/src/tsx/m-banner.js'),
        m_settle_accumulate: path.resolve(__dirname, 'Scripts/src/tsx/m-settle_accumulate.js'),
        //前台
        w_purchase_cart: path.resolve(__dirname, 'Scripts/src/tsx/w-purchase_cart.js'),
        w_purchase_history: path.resolve(__dirname, 'Scripts/src/tsx/w-purchase_history.js'),
        w_payment_order: path.resolve(__dirname, 'Scripts/src/tsx/w-payment_order.js'),
        w_payment_reply: path.resolve(__dirname, 'Scripts/src/tsx/w-payment_reply.js'),
        w_product_search: path.resolve(__dirname, 'Scripts/src/tsx/w-product_search.js'),
        //後台 一般會員
        m_sales_self: path.resolve(__dirname, 'Scripts/src/tsx/m-sales_self.js'),
        m_settle_self: path.resolve(__dirname, 'Scripts/src/tsx/m-settle_self.js'),
        m_purchase_view: path.resolve(__dirname, 'Scripts/src/tsx/m-purchase_view.js'),
        m_share_circle: path.resolve(__dirname, 'Scripts/src/tsx/m-share_circle.js'),
        m_sales_recommend: path.resolve(__dirname, 'Scripts/src/tsx/m-sales_recommend.js'),
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