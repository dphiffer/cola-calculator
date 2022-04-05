const path = require('path');

module.exports = {
  mode: 'production',
  entry: './public/cola.js',
  output: {
    filename: 'cola.dist.js',
    path: path.resolve(__dirname, 'public')
  },
};
