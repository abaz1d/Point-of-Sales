var express = require('express');
var router = express.Router();
var moment = require('moment')
const { isLoggedIn } = require('../helpers/util')

/* GET home page. */
module.exports = function (db) {

  router.get('/', isLoggedIn, async function (req, res, next) {
    try {
    let wheres = []
    let values = []
    let count = 1

    if (req.query.cari_id) {
      wheres.push(`id_satuan ilike '%' || $${count++} || '%'`);
      values.push(req.query.cari_id);
    }

    if (req.query.cari_nama) {
      wheres.push(`nama_satuan ilike '%' || $${count++} || '%'`);
      values.push(req.query.cari_nama);
    }

      sql = 'SELECT * FROM satuan'
      if (wheres.length > 0) {
        sql += ` WHERE ${wheres.join(' AND ')}`
      }

      sql += ' ORDER BY id_satuan'
      
      const { rows } = await db.query(sql,values);

      res.render('satuan/list', {
        rows,
        userLogin: req.session.user.username,
        query: req.query
      })
    } catch (e) {
      res.send(e)
    }
  });

  router.get('/add', isLoggedIn, async function (req, res, next) {
    try {
      res.render('satuan/add')
    } catch (e) {
      res.send(e)
    }
  });

  router.post('/add', async function (req, res, next) {
    try {
      const { rows } = await db.query('INSERT INTO satuan(nama_satuan,keterangan_satuan) VALUES ($1, $2)',
        [req.body.nama_satuan, req.body.keterangan_satuan])
      res.redirect('/satuan')
    } catch (e) {
      res.send(e)
    }
  });

  router.get('/edit/:id', isLoggedIn, async function (req, res, next) {
    try {
      const { rows } = await db.query('SELECT * FROM satuan WHERE id_satuan = $1', [req.params.id])
      res.render('satuan/edit', { item: rows[0] });
      console.log('satuan', rows)
    } catch (e) {
      res.send(e)
    }
  });

  router.post('/edit/:id', async function (req, res, next) {
    try {
      const { rows } = await db.query(`UPDATE satuan SET 
      nama_satuan = $1,
      keterangan_satuan = $2
      WHERE id_satuan = $3`, [req.body.nama_satuan, req.body.keterangan_satuan, req.params.id])
      res.redirect('/satuan')
    } catch (e) {
      res.send(e)
    }
  });

  router.get('/delete/:id', isLoggedIn, async function (req, res, next) {
    try {
      const { rows } = await db.query('DELETE FROM satuan WHERE id_satuan = $1', [req.params.id])
      res.redirect('/satuan')
    } catch (e) {
      res.send(e)
    }
  });

  return router;
}