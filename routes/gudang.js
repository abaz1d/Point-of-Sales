var express = require('express');
var router = express.Router();
var moment = require('moment')

/* GET home page. */
module.exports = function (db) {

  router.get('/', function (req, res,) {

    res.render('gudang/list')
  })

  router.get('/add', function (req, res,) {

    res.render('gudang/add')
  })

  router.get('/edit', function (req, res,) {

    res.render('gudang/edit')
  })

  return router;
}