var express = require('express');
var router = express.Router();
var moment = require('moment')

/* GET home page. */
module.exports = function (db) {

  router.get('/', async function (req, res, next) {

    //const { cari_id, cari_nama } = req.query
    const page = req.query.page || 1;
    const url = req.url == '/' ? '/?page=1' : req.url;
    //const url = `${req.url}satuan` == '/satuan' ? '/satuan?page=1' : `${req.url}satuan`;
    // let url = req.url 
    
    // if(url == '/')  
    // url = 'satuan/?page=1'
    // else if(url == '/satuan')
    // url == `satuan/?page=${page}`
    // else
    // url == req.url


    // if (req.url === '/') {
    //   url = '/satuan?page=1'
    // } else {
    //   if (req.url.includes('/satuan?page')) {
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

    var sortBy = req.query.sortBy == undefined ? `id_satuan` : req.query.sortBy;
    var sortMode = req.query.sortMode == undefined ? `asc` : req.query.sortMode;

    if (req.query.cari_id && req.query.cari_id == undefined) {
      wheres.push(`id_satuan ilike '%' || $${count++} || '%'`);
      values.push(req.query.cari_id);
    }

    if (req.query.cari_nama && req.query.cari_nama == undefined) {
      wheres.push(`nama_satuan ilike '%' || $${count++} || '%'`);
      values.push(req.query.cari_nama);
    }

    let sql = 'SELECT COUNT(*) AS total FROM satuan';
    if (wheres.length > 0) {
      sql += ` WHERE ${wheres.join(' AND ')}`
    }
    try {
      //console.log('sql', sql)
      const data = await db.query(sql, values);
      //console.log('data', data)

      const pages = Math.ceil(data.rows[0].total / limit)
      sql = 'SELECT * FROM satuan'
      if (wheres.length > 0) {
        sql += ` WHERE ${wheres.join(' AND ')}`
      }
      sql += ` ORDER BY ${sortBy} ${sortMode} LIMIT $${count++} OFFSET $${count++}`;

      console.log('sql', sql)
      console.log('req.url', req.url)
      console.log('url', url)



      const { rows } = await db.query(sql, [...values, limit, offset]);
      //console.log('rows', rows)
      res.render('satuan/list', {
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

  return router;
}