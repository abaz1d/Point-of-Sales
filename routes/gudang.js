var express = require('express');
var router = express.Router();
var moment = require('moment')

/* GET home page. */
module.exports = function (db) {

  router.get('/', async function (req, res, next) {

    //const { cari_id, cari_nama } = req.query
    const page = req.query.page || 1;
    const url = req.url == '/' ? '/?page=1' : req.url;
    //const url = `${req.url}gudang` == '/gudang' ? '/gudang?page=1' : `${req.url}gudang`;
    // let url = req.url 
    
    // if(url == '/')  
    // url = 'gudang/?page=1'
    // else if(url == '/gudang')
    // url == `gudang/?page=${page}`
    // else
    // url == req.url


    // if (req.url === '/') {
    //   url = '/gudang?page=1'
    // } else {
    //   if (req.url.includes('/gudang?page')) {
    //     url = req.url
    //   } else {
    //     if (req.url.includes('&page=')) {
    //       url = req.url
    //     } else {
    //       if (req.url.includes('&page=')) {
    //       } else {
    //         url = req.url + `&page=${page}`
    //       }
    //     }
    //   }
    // }

    
    const limit = 2;
    const offset = (page - 1) * limit;
    let wheres = []
    let values = []
    let count = 1


    const filter = `&cari_id=${req.query.cari_id}&cari_nama=${req.query.cari_nama}`

    var sortBy = req.query.sortBy == undefined ? `id_gudang` : req.query.sortBy;
    var sortMode = req.query.sortMode == undefined ? `asc` : req.query.sortMode;

    if (req.query.cari_id && req.query.cari_id == undefined) {
      wheres.push(`id_gudang ilike '%' || $${count++} || '%'`);
      values.push(req.query.cari_id);
    }

    if (req.query.cari_nama && req.query.cari_nama == undefined) {
      wheres.push(`nama_gudang ilike '%' || $${count++} || '%'`);
      values.push(req.query.cari_nama);
    }

    let sql = 'SELECT COUNT(*) AS total FROM gudang';
    if (wheres.length > 0) {
      sql += ` WHERE ${wheres.join(' AND ')}`
    }
    try {
      //console.log('sql', sql)
      const data = await db.query(sql, values);
      //console.log('data', data)

      const pages = Math.ceil(data.rows[0].total / limit)
      sql = 'SELECT * FROM gudang'
      if (wheres.length > 0) {
        sql += ` WHERE ${wheres.join(' AND ')}`
      }
      sql += ` ORDER BY ${sortBy} ${sortMode} LIMIT $${count++} OFFSET $${count++}`;

      console.log('sql', sql)
      console.log('req.url', req.url)
      console.log('url', url)



      const { rows } = await db.query(sql, [...values, limit, offset]);
      //console.log('rows', rows)
      res.render('gudang/list', {
        rows,
        pages,
        page,
        link: req.url,
        url,
        query: req.query,
        filter,
        sortBy,
        sortMode
      })
    } catch (e) {
      res.send(e)
    }
  });

  router.get('/add', async function (req, res, next) {
    try {
      res.render('gudang/add')
    } catch (e) {
      res.send(e)
    }
  });

  router.post('/add', async function (req, res, next) {
    try {
      const { rows } = await db.query('INSERT INTO gudang(nama_gudang,alamat_gudang) VALUES ($1, $2)',
        [req.body.nama_gudang, req.body.alamat_gudang])
      res.redirect('/gudang')
    } catch (e) {
      res.send(e)
    }
  });

  router.get('/edit/:id', async function (req, res, next) {
    try {
      const { rows } = await db.query('SELECT * FROM gudang WHERE id_gudang = $1', [req.params.id])
      res.render('gudang/edit', { item: rows[0] });
    } catch (e) {
      res.send(e)
    }
  });

  router.post('/edit/:id', async function (req, res, next) {
    try {
      const { rows } = await db.query(`UPDATE gudang SET 
      nama_gudang = $1,
      alamat_gudang = $2
      WHERE id_gudang = $3`, [req.body.nama_gudang, req.body.alamat_gudang, req.params.id])
      res.redirect('/gudang')
    } catch (e) {
      res.send(e)
    }
  });

  router.get('/delete/:id', async function (req, res, next) {
    try {
      const { rows } = await db.query('DELETE FROM gudang WHERE id_gudang = $1', [req.params.id])
      res.redirect('/gudang')
    } catch (e) {
      res.send(e)
    }
  });

  return router;
}