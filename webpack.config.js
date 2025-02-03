const path = require('path');

module.exports = {
  entry: './assets/js/main.js', // Punto di ingresso del tuo codice JS
  output: {
    filename: 'bundle.js',
    path: path.resolve(__dirname, 'dist') // Dove Webpack genera il file compilato
  },
  mode: 'development' // Può essere 'production' per ottimizzazioni
};
