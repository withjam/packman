var express = require('express');

exports.router = function() {

  var router = express.Router();

  var qs = {
    'query_package': 'SELECT * FROM packages WHERE name = ?',
    'update_package': 'UPDATE packages SET body = ? WHERE id = ?',
    'insert_package': 'INSERT INTO packages VALUES (NULL,?,?)',
    'delete_package': 'DELETE FROM packages WHERE ID = ?',
    'query_package_items': 'SELECT * FROM package_items WHERE package_id = ?',
    'query_package_pics': 'SELECT * FROM package_photos WHERE package_id = ?'
  }

  router.param('packageName', function(req, res, next, packageName) {
    // lookup primary key if it exists
    var name = packageName.replace('+',' ');
    var package = { name: name };
    req.logger.debug('query for package name: %s', package.name);
    req.db.query(qs.query_package, [package.name], function(err, results, fields) {
      if (err) {
        req.logger.error(err);
        res.status(500);
        res.send(err);
      } else {
        if (results.length === 1) {
          package = results[0]
        }
        req.packman = {
          package: package
        }
        next();          
      }
    })
  })

  router.route('/package/:packageName/photo/:id')
    .all(function(req, res, next) {
      var packageId = req.packman.package.id;
      if (packageId) {
        req.db.query(qs.query_package_pic, [req.params.id], function(err, results) {
          if (err) {
            req.logger.err('Could not query pic', err);
            res.status(500);
            return;
          }
          if (results.length) {
            req.packman.package.pics = {
              id: results[0]
            }
          }
        })
      } else {
        next();
      }
    })
    .get(function(req, res) {
      res.send(req.packman.package.pics[req.params.id]);
    })
    .post(function(req,res) {
      req.logger.debug('post photo', req.query);
      res.send(200);
    })
    .delete(function(req,res) {
      req.logger.debug('delete photo', req.query);
      res.send(200);
    })

  router.get('/package/:packageName/photos', function(req, res) {
    var id = req.packman.package.id;
    if (id) {
      req.db.query(qs.query_package_pics, [id], function(err, results, fields) {
        if (err) {
          req.logger.err('Could not retrieve photos', err);
          res.status(500);
          res.send(err);
          return;
        }
        res.send(results);
      })
    } else {
      res.sendStatus(404);
    }
  })

  router.route('/package/:packageName/item/:itemId')
    .get(function(req, res) {
      req.logger.trace('get itemId %s', req.params.itemId);
      res.sendStatus(200);
    })
    .post(function(req, res) {
      req.logger.trace('post item %s', req.params.itemId)
      res.sendStatus(200);
    })
    .delete(function(req, res) {
      req.logger.trace('delete item %s', req.params.itemId);
      res.sendStatus(200);
    })

  router.get('/package/:packageName/items', function(req, res) {
    req.db.query(qs.query_package_items, [req.packman.package.id], function(err, results, fields) {
      if (err) {
        req.logger.error(err);
        res.status(500);
        return;
      }
      res.send(results);
    })
  })

  // CRUD for a single package
  router.route('/package/:packageName')
    .get(function(req, res) {
      res.send(req.packman);
    })
    .post(function(req, res) {
      // do an upsert
      function upsertResults(err, results) {
        req.logger.trace('Upsert results', results);
        if (err) {
          req.logger.warn(err);
          res.status(500);
          res.send(err);
        } else {
          res.sendStatus(200);  
        }
      }
      req.logger.debug('upsertPackage', req.query);
      if (req.package.id) {
        req.db.query(qs.update_package, [ req.query.body, req.packman.package.id ], upsertResults);
      } else {
        req.db.query(qs.insert_package, [ req.packman.package.name, req.query.body || '' ], upsertResults);
      }
    })
    .delete(function(req, res) {
      req.logger.trace('deleting package %d', req.packman.package.id);
      req.db.query(qs.delete_package, [req.packman.package.id], function(err) {
        if (err) {
          req.logger.warn(err);
          res.status(500);
          res.send(err);
        } else {
          res.sendStatus(200);
        }
      });
    })

  router.use(function(req, res) {
    req.logger.info('uknown route', req.path);
    res.sendStatus(400);
  })

  return router;

}