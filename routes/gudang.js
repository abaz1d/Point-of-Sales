var express = require('express');
var router = express.Router();
var moment = require('moment')

/* GET home page. */
module.exports = function (db) {

  router.get('/', async function (req, res, next) {
    try {
      const { rows } = await db.query('SELECT * FROM gudang');
      res.render('gudang/list', {
        // currentPage: 'barang',
        rows
        // currencyFormatter
      })
    } catch (e) {
      res.send(e)
    }

  });

  // router.get('/', (req, res) => {
  //   db.query('SELECT * FROM gudang'), (err, data) => {
  //     if (err) {
  //       res.send(err)
  //     }
  //     res.render('gudang/list', {
  //       // currentPage: 'barang',
  //       data: data.rows
  //       // currencyFormatter
  //     })
  //   }
  // });

  router.get('/add', async function (req, res, next) {
    try {
      res.render('gudang/add')
    } catch (e) {
      res.send(e)
    }

  });

  router.post('/add', async function (req, res, next) {
    try {
      await db.query('INSERT INTO gudang(nama_gudang,alamat_gudang) VALUES ($1, $2)'), 
      [req.body.nama_gudang, req.body.alamat_gudang]
      console.log('nama', req.body.nama_gudang, req.body.alamat_gudang)
      res.redirect('/gudang')
    } catch (e) {
      res.send(e)
    }

  });


  // router.post('/add', (req, res) => {
  //   db.query('INSERT INTO todos(string,integer,float,date, boolean) VALUES ($1, $2, $3, $4, $5)', 
  //   [req.body.string, parseInt(req.body.integer), parseFloat(req.body.float), req.body.date, req.body.boolean], (err) => {
  //     if (err) {
  //       console.error(err);
  //     }
  //   })
  //   res.redirect('/');
  // })

  router.get('/edit', function (req, res,) {

    res.render('gudang/edit')
  })

  router.get('/print', function (req, res,) {

    res.render('gudang/print')
  })

  return router;
}