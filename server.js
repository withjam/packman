var express = require('express');
var cors = require('cors');
var app = express();
var bodyParser = require('body-parser');
var cookieParser = require('cookie-parser')
var multer = require('multer');
var upload = multer(); // for parsing multipart/form-data
var sassMiddleware = require('node-sass-middleware');

var config = require('config');
var logger = require('bunyan').createLogger(config.bunyan);

var path = require('path');
var uiPath =  path.join(__dirname, 'ui');
var staticPath = path.join(uiPath,'www');
var templatePath = path.join(uiPath, 'lib');
var merge = require('merge');

var mysql = require('mysql');
var connection = mysql.createConnection(config.mysql);

var bwip = require('bwip-js');

// static bundles
var glob = require('glob');
var assets = require('assets-middleware');
var packmanJs = {
  src: function(destpath, callback) {
    glob('./ui/lib/**/*.js', null, callback);
  },
  dest: './ui/www/scripts/packman.js',
  serve: false
}

app.use(cors());

app.use(sassMiddleware({
  src: path.join(uiPath,'styles'),
  force: process.env.NODE_ENV === 'production',
  prefix: '/styles',
  includePaths: [
    path.join(staticPath,'bower_components', 'bootstrap-sass', 'assets', 'stylesheets'),
    path.join(staticPath,'bower_components', 'font-awesome', 'scss')
  ]
}));
app.get('/scripts/packman.js', assets(packmanJs)); // pre-bundle the assets
app.use(express.static(staticPath));
app.use('/templates', express.static(templatePath, { extensions: [ 'html', 'htm' ], fallthrough: false }));

// parse cookies
app.use(cookieParser());

app.use(bodyParser.json()); // for parsing application/json
app.use(bodyParser.urlencoded({ extended: true })); // for parsing application/x-www-form-urlencoded

// custom middleware for easier use
app.use(function(req, res, next) {
  req.db = connection; // pass along mysql connection
  req.logger = logger; // expose logger to all request handlers
  next();
});

app.use('/barcode/:name.png', function(req, res) {
  req.logger.trace('barcode for %s', req.params.name);
  bwip.toBuffer(merge({
    text: req.params.name
  },config.bwip), function(err, png) {
    if(err) {
      req.logger.error('Could not render barcard', err);
      res.sendStatus(500);
    } else {
      res.write(png);
      res.end();
    }
  })
})

// routes
app.use('/api', require('./packman.server.js').router());

// fallback route for SPA
var fallback = require('express-history-api-fallback');
app.use(fallback('index.html', { root: staticPath }));

logger.info('Establishing mysql connection - %s:%d/%s', config.mysql.host, config.mysql.port, config.mysql.database);
connection.connect(function(err) {
  if (err) {
    logger.error(err);
  } else {
    app.listen(config.port, config.host, function() {
      logger.info('Listening on port %s:%d', (config.host || 'localhost'), config.port);
    });  
  } 
})
