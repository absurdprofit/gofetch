const path = require('path');

module.exports = {
  mode: 'development',
  entry: {
    index: path.resolve(__dirname, 'src', 'index.ts'),
    ['common/streams']: path.resolve(__dirname, 'src', 'common', 'streams.ts')
  },
  module: {
    rules: [
      {
        test: /\.ts?$/,
        use: 'ts-loader',
        exclude: /node_modules/,
      },
    ],
  },
  resolve: {
    extensions: ['.ts', '.js'],
  },
  experiments: {
    outputModule: true
  },
  target: ['web', 'es6'],
  output: {
    library: {
      type: 'module'
    },
    // filename: 'gofetch.js',
    path: path.resolve(__dirname, 'build'),
    clean: true
  },
};