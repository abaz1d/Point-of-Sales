var express = require('express');
var router = express.Router();

/* GET home page. */
module.exports = function (db) {
  router.get('/', function(req, res, next) {
    res.render('login');
  });

  router.post('/login', function(req, res, next) {
    res.redirect('/utama');
  });

  router.get('/utama', function(req, res, next) {
    res.render('utama');
  });

  router.get('/collapse', function(req, res, next) {
    res.render('collapse');
  });

  router.get('/register', function(req, res, next) {
    res.render('register');
  });

  router.post('/register', function(req, res, next) {
    res.render('register');
  });

  router.get('/logout', function(req, res, next) {
    res.redirect('/')
  });

  return router;
}