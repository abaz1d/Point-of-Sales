var express = require('express');
var router = express.Router();
var moment = require('moment');
var path = require('path');
const { currencyFormatter } = require('../helpers/util')

module.exports = function (db) {
    router.get('/', async function (req, res, next) {
        try {
            const { cari_inv, searchStartDate, searchEndDate } = req.query
            let search = []
            let count = 1
            let syntax = []
            let sql_count = 'SELECT count(*) AS total FROM barang'
            let sql = 'SELECT * FROM penjualan'
            if (cari_inv) {
                sql += ' WHERE '
                sql_count += ' WHERE '
                search.push(`%${cari_inv}%`)
                syntax.push(`no_invoice ilike '%' || $${count++} || '%'`)
                count++
            }
            if (searchStartDate && searchEndDate) {
                if (!sql.includes(' WHERE ')) {
                  sql += ' WHERE'
                  sql_count += ' WHERE'
                }
                search.push(`${searchStartDate}`)
                search.push(`${searchEndDate}`)
                syntax.push(` tanggal_penjualan >= $${count} AND tanggal_penjualan < $${count + 1}`)
                count++
                count++
              } else if (searchStartDate) {
                if (!sql.includes(' WHERE ')) {
                  sql += ' WHERE'
                  sql_count += ' WHERE'
                }
                search.push(`${searchStartDate}`)
                syntax.push(` tanggal_penjualan >= $${count}`)
                count++
              } else if (searchEndDate) {
                if (!sql.includes(' WHERE ')) {
                  sql += ' WHERE'
                  sql_count += ' WHERE'
                }
                search.push(`${searchEndDate}`)
                syntax.push(` tanggal_penjualan <= $${count}`)
                count++
              }
    
            if (syntax.length > 0) {
                sql += syntax.join(' AND ')
                sql += ` ORDER BY tanggal_penjualan DESC`
    
                sql_count += syntax.join(' AND ')
                sql_count += ` GROUP BY no_invoice ORDER BY id_barang ASC`
            }
            const { rows } = await db.query(sql,search);
            //console.log('rows',rows)
            //const noInvoice = req.query.noInvoice ? req.query.noInvoice : rows.length > 0 ? rows[0].no_invoice : '';
            const noInvoice = req.query.noInvoice ? req.query.noInvoice : '';
            //console.log(req.query.noInvoice, noInvoice)
            const details = await db.query('SELECT dp.*, v.nama_varian FROM penjualan_detail as dp LEFT JOIN varian as v ON dp.id_varian = v.id_varian WHERE dp.no_invoice = $1 ORDER BY dp.id_detail_jual', [noInvoice]);
            const varian = await db.query('SELECT var.*, b.id_barang, b.nama_barang FROM varian as var LEFT JOIN barang as b ON var.id_barang = b.id_barang ORDER BY var.id_barang');
            res.render('penjualan/list', {
                penjualan: rows,
                moment,
                currencyFormatter,
                detailsj: details.rows,
                varian: varian.rows,
                query: req.query
            })
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
