const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const merge = require('webpack-merge');
const validate = require('webpack-validator');
const parts = require('./lib/parts');



const PATHS = {
  app: path.join(__dirname, 'app'),
  build: path.join(__dirname, 'build'),
  style: [
    path.join(__dirname, 'node_modules', 'purecss'),
    path.join(__dirname, 'app', 'main.css')
  ]
};


const common = {

  // Entry accepts a path or an object of entries.
  // We'll be using the latter form given it's
  // convenient with more complex configurations.
  entry: {
    app: PATHS.app,
    style: PATHS.style
  },
  output: {
    path: PATHS.build,
    filename: '[name].js'
    // TODO: Set publicPath to match your GitHub project name
    // E.g., '/kanban-demo/'. Webpack will alter asset paths
    // based on this. You can even use an absolute path here
    // or even point to a CDN.
    //publicPath: ''
  },
  plugins: [
    new HtmlWebpackPlugin({
      title: 'Webpack demo'
    })
  ]
};


var config;

// Detect how npm is run and branch based on that
switch(process.env.npm_lifecycle_event) {
  case 'build':
  case 'stats':
    config = merge(
      common,
      {
        devtool: 'source-map',
        output: {
          path: PATHS.build,
          filename: '[name].[chunkhash].js',
          // This is used for require.ensure. The setup
          // will work without but this is useful to set.
          chunkFilename: '[chunkhash].js'
        }
      },
      parts.clean(PATHS.build),
      parts.setFreeVariable('process.env.NODE_ENV','production'),
      parts.extractBundle({
        name: 'vendor',
        entries: ['react']
      }),
      parts.minify(),
      parts.extractCSS(PATHS.style),
      parts.purifyCSS([PATHS.app])
    );
    break;
  default:
    config = merge(
      common,
      {
        devtool: 'eval-source-map'
      },
      parts.devServer({
      // Customize host/port here if needed
        host: process.env.HOST,
        port: process.env.PORT
      }),
      parts.setupCSS(PATHS.style) //remains setupCSS, so Hot Module Reload it is still enabled for css in development
    );
}

module.exports = validate(config);