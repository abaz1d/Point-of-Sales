var express = require('express');
const gudang = require('./gudang');
const satuan = require('./satuan');
var router = express.Router();

/* GET home page. */
module.exports = function (db) {
  router.get('/', function (req, res, next) {
    res.render('login');
  });

  router.post('/login', function (req, res, next) {
    res.redirect('/utama');
  });

  router.get('/utama', function (req, res, next) {
    const { cari_id, cari_nama } = req.query
    let searchb = []
    let countb = 1
    let syntaxb = []
    let sql_countb = 'SELECT count(*) AS total FROM barang'
    let sqlb = 'SELECT * FROM barang'
    if (cari_id) {
      sqlb += ' WHERE '
      sql_countb += ' WHERE '
      searchb.push(`%${cari_id}%`)
      syntaxb.push(`id_barang ilike '%' || $${countb++} || '%'`)
      countb++
    }
    if (cari_nama) {
      if (!sqlb.includes(' WHERE ')) {
        sqlb += ' WHERE '
        sql_countb += ' WHERE '
      }
      searchb.push(`%${cari_nama}%`)
      syntaxb.push(` nama_barang ilike '%' || $${countb++} || '%'`)
      countb++
    }

    if (syntaxb.length > 0) {
      sqlb += syntaxb.join(' AND ')
      sqlb += ` ORDER BY id_barang ASC`

      sql_countb += syntaxb.join(' AND ')
      sql_countb += ` GROUP BY id_barang ORDER BY id_barang ASC`
    }
    db.query(sqlb, searchb, (err, barang) => {
      if (err) console.log(err)
      //const id_barang = req.query.id_barang ? req.query.id_barang : barang.rows.length > 0 ? barang.rows[0].id_barang : '';
      const id_barang = req.query.id_barang ? req.query.id_barang : '';

      db.query('SELECT dp.*, b.nama_barang FROM varian as dp LEFT JOIN barang as b ON dp.id_barang = b.id_barang WHERE dp.id_barang = $1 ORDER BY dp.id_varian ASC', [id_barang], (err, varian) => {
        if (err) console.log(err)
        let wheresg = []
        let valuesg = []
        let countg = 1

        if (req.query.cari_id_gudang) {
          wheresg.push(`id_gudang ilike '%' || $${countg++} || '%'`);
          valuesg.push(req.query.cari_id_gudang);
        }

        if (req.query.cari_nama_gudang) {
          wheresg.push(`nama_gudang ilike '%' || $${countg++} || '%'`);
          valuesg.push(req.query.cari_nama_gudang);
        }

        if (req.query.cari_alamat_gudang) {
          wheresg.push(`alamat_gudang ilike '%' || $${countg++} || '%'`);
          valuesg.push(req.query.cari_alamat_gudang);
        }

        sqlg = 'SELECT * FROM gudang'
        if (wheresg.length > 0) {
          sqlg += ` WHERE ${wheresg.join(' AND ')}`
        }

        sqlg += ` ORDER BY id_gudang`


        db.query(sqlg, valuesg, (err, gudang) => {

          let swheres = []
          let svalues = []
          let scount = 1

          if (req.query.cari_id_satuan) {
            swheres.push(`id_satuan ilike '%' || $${scount++} || '%'`);
            svalues.push(req.query.cari_id_satuan);
          }

          if (req.query.cari_nama_satuan) {
            swheres.push(`nama_satuan ilike '%' || $${scount++} || '%'`);
            svalues.push(req.query.cari_nama_satuan);
          }

          sqls = 'SELECT * FROM satuan'
          if (swheres.length > 0) {
            sqls += ` WHERE ${swheres.join(' AND ')}`
          }

          sqls += ' ORDER BY id_satuan'

          db.query(sqls, svalues, (err, satuan) => {

            let supwheres = []
            let supvalues = []
            let supcount = 1

            if (req.query.cari_id_supplier) {
              supwheres.push(`id_supplier ilike '%' || $${supcount++} || '%'`);
              supvalues.push(req.query.cari_id_supplier);
            }

            if (req.query.cari_nama_supplier) {
              supwheres.push(`nama_supplier ilike '%' || $${supcount++} || '%'`);
              supvalues.push(req.query.cari_nama_supplier);
            }

            if (req.query.cari_alamat_supplier) {
              supwheres.push(`alamat_supplier ilike '%' || $${supcount++} || '%'`);
              supvalues.push(req.query.cari_alamat_supplier);
            }

            if (req.query.cari_telepon_supplier) {
              supwheres.push(`telepon_supplier ilike '%' || $${supcount++} || '%'`);
              supvalues.push(req.query.cari_telepon_supplier);
            }

            if (req.query.cari_email_supplier) {
              supwheres.push(`email_supplier ilike '%' || $${supcount++} || '%'`);
              supvalues.push(req.query.cari_email_supplier);
            }

            supsql = 'SELECT * FROM supplier '
            if (supwheres.length > 0) {
              supsql += ` WHERE ${supwheres.join(' AND ')}`
            }

            supsql += 'ORDER BY id_supplier'


            db.query(supsql, supvalues, (err, supplier) => {

              let uwheres = []
              let uvalues = []
              let ucount = 1

              if (req.query.cari_email) {
                uwheres.push(`email_user ilike '%' || $${ucount++} || '%'`);
                uvalues.push(req.query.cari_email);
              }

              if (req.query.cari_username) {
                uwheres.push(`username ilike '%' || $${ucount++} || '%'`);
                uvalues.push(req.query.cari_username);
              }

              if (req.query.cari_role) {
                uwheres.push(`role = $${ucount++}`);
                uvalues.push(req.query.cari_role);
              }

              usql = 'SELECT * FROM users '
              if (uwheres.length > 0) {
                usql += ` WHERE ${uwheres.join(' AND ')}`
              }

              usql += 'ORDER BY id_users'



              db.query(usql, uvalues, (err, users) => {

                res.render('utama', {
                  varian: varian.rows,
                  barang: barang.rows,
                  gudang: gudang.rows,
                  satuan: satuan.rows,
                  supplier: supplier.rows,
                  users: users.rows,
                  query: req.query
                });
              })
            })
          })
        })
      })
    })
  });

  router.get('/collapse', function (req, res, next) {
    res.render('collapse');
  });

  router.get('/register', function (req, res, next) {
    res.render('register');
  });

  router.post('/register', function (req, res, next) {
    res.render('register');
  });

  router.get('/logout', function (req, res, next) {
    res.redirect('/')
  });

  return router;
}