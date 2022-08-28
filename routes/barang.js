var express = require('express');
var router = express.Router();
var moment = require('moment')

/* GET home page. */
module.exports = function (db) {

    router.get('/', async function (req, res, next) {
        try {
            let wheres = []
            let values = []
            let count = 1

            if (req.query.cari_id) {
                wheres.push(`id_barang ilike '%' || $${count++} || '%'`);
                values.push(req.query.cari_id);
            }

            if (req.query.cari_nama) {
                wheres.push(`nama_barang ilike '%' || $${count++} || '%'`);
                values.push(req.query.cari_nama);
            }

            if (req.query.cari_alamat) {
                wheres.push(`alamat_barang ilike '%' || $${count++} || '%'`);
                values.push(req.query.cari_alamat);
            }

            if (req.query.cari_telepon) {
                wheres.push(`telepon_barang ilike '%' || $${count++} || '%'`);
                values.push(req.query.cari_telepon);
            }

            if (req.query.cari_email) {
                wheres.push(`email_barang ilike '%' || $${count++} || '%'`);
                values.push(req.query.cari_email);
            }

            sql = 'SELECT * FROM barang '
            if (wheres.length > 0) {
                sql += ` WHERE ${wheres.join(' AND ')}`
            }

            sql += 'ORDER BY id_barang'


            const { rows } = await db.query(sql, values);

            const varian = await db.query('SELECT * FROM varian ORDER BY id_barang');

            res.render('barang/list', {
                rows,
                varian: varian.rows,
                query: req.query
            })
        } catch (e) {
            res.send(e)
        }
    });

    router.get('/add', async function (req, res, next) {
        try {
            res.render('barang/add')
        } catch (e) {
            res.send(e)
        }
    });

    router.post('/add', async function (req, res, next) {
        try {
            const { rows } = await db.query('INSERT INTO barang(nama_barang,alamat_barang,telepon_barang,email_barang) VALUES ($1, $2, $3, $4)',
                [req.body.nama_barang, req.body.alamat_barang, req.body.telepon_barang, req.body.email_barang])
            console.log('tlp', req.body.telepon_barang)
            res.redirect('/barang')
        } catch (e) {
            res.send(e)
        }
    });

    router.get('/edit/:id', async function (req, res, next) {
        try {
            const { rows } = await db.query('SELECT * FROM barang WHERE id_barang = $1', [req.params.id])
            res.render('barang/edit', { item: rows[0] });
        } catch (e) {
            res.send(e)
        }
    });

    router.post('/edit/:id', async function (req, res, next) {
        try {
            const { rows } = await db.query(`UPDATE barang SET 
      nama_barang = $1,
      alamat_barang = $2,
      telepon_barang = $3,
      email_barang = $4
      WHERE id_barang = $5`, [req.body.nama_barang, req.body.alamat_barang, req.body.telepon_barang, req.body.email_barang, req.params.id])
            res.redirect('/barang')
        } catch (e) {
            res.send(e)
        }
    });

    router.get('/delete/:id', async function (req, res, next) {
        try {
            const { rows } = await db.query('DELETE FROM barang WHERE id_barang = $1', [req.params.id])
            res.redirect('/barang')
        } catch (e) {
            res.send(e)
        }
    });

    return router;
}