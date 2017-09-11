//process.traceDeprecation = true;
const path = require('path');
const autoprefixer = require('autoprefixer');
const px2viewport = require('postcss-px-to-viewport');
const aspectRatio = require('postcss-aspect-ratio-mini');
const writeSvg = require('postcss-write-svg');
const ExtractTextPlugin = require('extract-text-webpack-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');

const CommonsChunkPlugin = require('webpack/lib/optimize/CommonsChunkPlugin');
const LoaderOptionsPlugin = require('webpack/lib/LoaderOptionsPlugin');
const ProvidePlugin = require('webpack/lib/ProvidePlugin');
const HtmlWebpackHarddiskPlugin = require('html-webpack-harddisk-plugin');
const MinifyPlugin = require("babel-minify-webpack-plugin");
const CleanWebpackPlugin = require('clean-webpack-plugin');
const BundleAnalyzerPlugin = require('webpack-bundle-analyzer').BundleAnalyzerPlugin;
const DefinePlugin = require('webpack/lib/DefinePlugin');
const BrowserSyncPlugin = require('browser-sync-webpack-plugin')


// VARS
const NODE_ENV = process.env.NODE_ENV;

const ENV_DEVELOPMENT = NODE_ENV === 'development';
const ENV_PRODUCTION = NODE_ENV === 'production';

const HOST = 'localhost';
const PORT = '9988';


// LOADERS
const rules = {
  js: {
    test: /\.js?$/,
    use: [{
      loader: 'babel-loader',
      options: {
        plugins: [
          'transform-object-assign',
          'transform-es2015-destructuring',
          'transform-es2015-arrow-functions',
          'transform-es2015-spread',
          'transform-es2015-template-literals',
          'transform-es2015-shorthand-properties',
          'transform-object-set-prototype-of-to-assign',
        ],
      }
    }],
    exclude: /node_modules/,
  },
  html: {
    test: /\.pug$/,
    use: ['pug-loader'] ,
    exclude: /node_modules/
  },
  css: {
    test: /\.(styl|css)/,
    exclude: /node_modules/,
    use: ['style-loader','css-loader', 'postcss-loader', 'stylus-loader']
  },
  img: {
    test: /\.(png|jpe?g|gif|svg)(\?.*)?$/,
    loader: 'url-loader',
    options: {
      limit: 1000,
      name: 'img/[name].[ext]'
    }
  },
  fonts: {
    test: /\.(woff2?|eot|ttf|otf)(\?.*)?$/,
    loader: 'url-loader',
    options: {
      limit: 1000,
      name: 'fonts/[name].[hash:7].[ext]'
    }
  }, 
  json: {
    test: /\.json$/,
    use: ['json-loader'] 
  }
  
};

// CONFIG
const config = module.exports = {};

config.resolve = {
  extensions: ['.js', '.css', '.styl', '.pug', '.json'],
  mainFields: ['browser', 'module', 'main']
};

config.module = {
  rules: [
    rules.js,
    rules.html,
    rules.img,
    rules.fonts,
    rules.json
  ]
};

config.plugins = [
  new ProvidePlugin({
  }),
  new LoaderOptionsPlugin({
    debug: false,
    minimize: ENV_PRODUCTION,
    options: {
      postcss: [
        autoprefixer({
          browsers: "android >= 4.4"
        }),
        // px2viewport({
        //   viewportWidth: 750,
        //   viewportHeight: 1670,
        //   unitPrecision: 5,
        //   viewportUnit: 'vw',
        //   selectorBlackList: [],
        //   minPixelValue: 1,
        //   mediaQuery: false
        // }),
        writeSvg(),
        aspectRatio() 
      ]
    }
  }),
  new HtmlWebpackPlugin({
    title: 'index',
    chunkSortMode: 'dependency',
    filename: path.resolve(__dirname, 'app/dist/index.html'),
    hash: false,
    alwaysWriteToDisk: true,
    inject: true,
    chunks: ['index'],
    template: path.resolve(__dirname, 'app/src/index.pug')
  }),
  new HtmlWebpackPlugin({
    title: 'other',
    chunkSortMode: 'dependency',
    filename: path.resolve(__dirname, 'app/dist/other.html'),
    hash: false,
    alwaysWriteToDisk: true,
    inject: true,
    chunks: ['other'],
    template: path.resolve(__dirname, 'app/src/other.pug')
  }),
  new HtmlWebpackHarddiskPlugin(),
  new BrowserSyncPlugin({
    host: 'localhost',
    port: 3000,
    proxy: 'localhost:9988'
  })

];

// DEVELOPMENT or PRODUCTION
if (ENV_DEVELOPMENT || ENV_PRODUCTION) {
  config.entry = {
    index:path.resolve(__dirname, 'app/src/js/index.js') ,
    other: path.resolve(__dirname, 'app/src/js/other.js')
  };

  config.output = {
    path: path.join(__dirname, 'app/dist'),
    filename: 'js/[name].bundle.js'
  };

  config.plugins.push(
    new CommonsChunkPlugin({
      children: true,
      async: true
    })
  );
}

// DEVELOPMENT
if (ENV_DEVELOPMENT) {
  config.devtool = 'cheap-module-source-map';

  config.output.filename =  'js/[name].js';

  config.module.rules.push(rules.css);

  config.devServer = {
    contentBase: path.resolve(__dirname, 'app/dist'),
    historyApiFallback: true,
    inline: true,
    host: HOST,
    port: PORT,
    stats: {
      cached: true,
      cachedAssets: true,
      chunks: true,
      chunkModules: false,
      colors: true,
      hash: false,
      reasons: true,
      timings: true,
      version: false
    }
  };

}

// PRODUCTION 
if(ENV_PRODUCTION) {
  config.devtool = false;

  config.output.filename = 'js/[name].[chunkhash:8].js';

  config.module.rules.push({
    test: /\.(styl|css)/,
    include: path.join(__dirname,'app/src/css'),
    use: ExtractTextPlugin.extract({
      fallback: 'style-loader',
      publicPath: '../',
      use: ['css-loader', 'postcss-loader', 'stylus-loader']
    })
  });

  config.plugins.push(
    new CleanWebpackPlugin(['app/dist/js','app/dist/css', 'app/log/*']),
    new DefinePlugin({
      'process.env': {
        'NODE_ENV': JSON.stringify('production')
      }
    }),
    new ExtractTextPlugin({
      filename: 'css/[name].[chunkhash:8].css'
    }),

    new MinifyPlugin(), 
    new BundleAnalyzerPlugin({
      analyzerMode: 'static',
      reportFilename: '../log/report.html',
      openAnalyzer: true
    })
  );
}
