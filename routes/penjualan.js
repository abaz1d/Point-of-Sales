var express = require('express');
var router = express.Router();
var moment = require('moment');
var path = require('path');
const { currencyFormatter } = require('../helpers/util')

module.exports = function (db) {
    router.get('/', async function (req, res, next) {
        try {
            const { rows } = await db.query('SELECT * FROM penjualan ORDER BY tanggal_penjualan DESC');
            const penjualan = await db.query('SELECT * FROM penjualan WHERE no_invoice = $1', [req.params.no_invoice])
            //const noInvoice = req.query.noInvoice ? req.query.noInvoice : rows.length > 0 ? rows[0].no_invoice : '';
            const noInvoice = req.query.noInvoice ? req.query.noInvoice : '';
            //console.log(req.query.noInvoice, noInvoice)
            const details = await db.query('SELECT dp.*, v.nama_varian FROM penjualan_detail as dp LEFT JOIN varian as v ON dp.id_varian = v.id_varian WHERE dp.no_invoice = $1 ORDER BY dp.id_detail_jual', [noInvoice]);
            const varian = await db.query('SELECT var.*, b.id_barang, b.nama_barang FROM varian as var LEFT JOIN barang as b ON var.id_barang = b.id_barang ORDER BY var.id_barang');
            res.render('penjualan/list', {
                rows,
                penjualan: penjualan.rows,
                moment,
                currencyFormatter,
                detailsj: details.rows,
                varian: varian.rows,
                query: req.query
            })
            console.log('penjualan', penjualan)
        } catch (e) {
            res.send(e)
        }

    });
    //v
    router.post('/create', async function (req, res, next) {
        try {
            const { rows } = await db.query('INSERT INTO penjualan(total_harga_jual) VALUES(0) returning *')
            //res.redirect(`/penjualan/show/${rows[0].no_invoice}`)
            res.json(rows[0])
        } catch (e) {
            res.send(e)
        }
    });
    //v
    router.put('/show/:no_invoice', async function (req, res, next) {
        try {
            //const varian = await db.query('SELECT var.*, b.id_barang, b.nama_barang FROM varian as var LEFT JOIN barang as b ON var.id_barang = b.id_barang ORDER BY var.id_barang');
            const { rows } = await db.query('SELECT * FROM penjualan WHERE no_invoice = $1 returning *', [req.params.no_invoice])
            // penjualan = await db.query('SELECT * FROM penjualan');
            
            res.json(rows)
        } catch (e) {
            res.send(e)
        }
    });
    //v
    router.get('/barang/:id_varian', async function (req, res, next) {
        try {
            const { rows } = await db.query('SELECT var.*, b.id_barang, b.nama_barang FROM varian as var LEFT JOIN barang as b ON var.id_barang = b.id_barang WHERE id_varian = $1 ORDER BY var.id_barang', [req.params.id_varian])
            res.json(rows[0])
        } catch (e) {
            res.send(e)
        }
    });
    //v
    router.post('/additem', async function (req, res, next) {
        try {
            detail = await db.query('INSERT INTO penjualan_detail(no_invoice, id_varian, qty)VALUES ($1, $2, $3) returning *', [req.body.no_invoice, req.body.id_varian, req.body.qty])
            const { rows } = await db.query('SELECT * FROM penjualan WHERE no_invoice = $1', [req.body.no_invoice])
            res.json(rows[0])
        } catch (e) {
            res.send(e)
        }
    });
    //v
    router.post('/upjual', async function (req, res, next) {
        try {
            detail = await db.query('UPDATE penjualan SET total_bayar_jual = $1, kembalian_jual = $2 WHERE no_invoice = $3', [req.body.total_bayar_jual, req.body.kembalian, req.body.no_invoice])

            //res.json(rows[0])
        } catch (e) {
            res.send(e)
        }
    });
    //v
    router.get('/details/:no_invoice', async function (req, res, next) {
        try {
            const { rows } = await db.query('SELECT dp.*, v.nama_varian FROM penjualan_detail as dp LEFT JOIN varian as v ON dp.id_varian = v.id_varian WHERE dp.no_invoice = $1 ORDER BY dp.id_detail_jual', [req.params.no_invoice]);
            res.json(rows)
        } catch (e) {
            res.send(e)
        }
    });

    router.get('/delete/:no_invoice', async function (req, res, next) {
        try {
            const { rows } = await db.query('DELETE FROM penjualan WHERE no_invoice = $1', [req.params.no_invoice])
            //console.log('data', rows)
            //console.log(rows)
            //detail = await db.query('DELETE FROM penjualan WHERE no_invoice = $1', [req.params.no_invoice])
            res.redirect('/penjualan')
            //res.redirect('/penjualan')
        } catch (e) {
            console.log(e)
            res.render(e)
        }
    })


    return router;
}
