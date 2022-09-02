var express = require('express');
var router = express.Router();
const { ObjectId } = require('mongodb');

module.exports = function (db) {
  //const collection = db.collection('users');

  //GET, READ USERS
  router.get('/', async function (req, res, next) {

    //const url = req.url == '/' ? '/?page=1' : req.url;
    const page = req.query.page || 1;
    const limit = 3 //parseInt(req.query.display);
    //const offset = (page - 1) * limit;
    const wheres = {}
    //const filter = `&idCheck=${req.query.idCheck}&id=${req.query.id}&stringCheck=${req.query.stringCheck}&string=${req.query.string}&integerCheck=${req.query.integerCheck}&integer=${req.query.integer}&floatCheck=${req.query.floatCheck}&float=${req.query.float}&dateCheck=${req.query.dateCheck}&startDate=${req.query.startDate}&endDate=${req.query.endDate}&booleanCheck=${req.query.booleanCheck}&boolean=${req.query.boolean}`
    var sortBy = req.query.sortBy == undefined ? 'string' : req.query.sortBy;
    var sortMode = req.query.sortMode == undefined ? 1 : req.query.sortMode;
    var sortMongo = JSON.parse(`{"${sortBy}" : ${sortMode}}`);
    const offset = limit == 'all' ? 0 : (page - 1) * limit

    if (req.query.string) {
      wheres["string"] = new RegExp(`${req.query.string}`, 'i')
    }

    if (req.query.integer) {
      wheres['integer'] = parseInt(req.query.integer)
    }

    if (req.query.float) {
      wheres['float'] = JSON.parse(req.query.float)
    }

    //======
    if (req.query.startDate && req.query.endDate) {
      wheres['date'] = { $gte: new Date(`${req.query.startDate}`), $lte: new Date(`${req.query.endDate}`) }
    }
    else if (req.query.startDate) {
      wheres['date'] = { $gte: new Date(`${req.query.startDate}`) }
    }
    else if (req.query.endDate) {
      wheres['date'] = { $lte: new Date(`${req.query.endDate}`) }
    }
    //======   

    if (req.query.boolean) {
      wheres['boolean'] = (req.query.boolean)
    }


    try {
      const collection = db.collection('users');

      const totalData = await collection.find(wheres).count();
      const totalPages = limit == 'all' ? 1 : Math.ceil(totalData / limit)
      const limitation = limit == 'all' ? {} : { limit: parseInt(limit), skip: offset }

      const users = await collection.find(wheres, limitation).collation({ 'locale': 'en' }).sort(sortMongo).toArray();
      console.log('sortMongo', sortMongo)
      res.status(200).json({
        data: users,
        totalData,
        totalPages,
        display: limit,
        page: parseInt(page)
        // sortBy,
        // sortMode
      })
    } catch (e) {
      res.json(e)
    }
  });

  //POST, CREATE USERS
  router.post('/', async function (req, res, next) {
    try {
      const collection = db.collection('users');
      const insertResult = await collection.insertOne({ string: req.body.string, integer: parseInt(req.body.integer), float: JSON.parse(req.body.float), date: new Date(req.body.date), boolean: req.body.boolean });
      res.status(201).json(insertResult)
    } catch (e) {
      res.json(e)
    }
  });


  //PUT, EDIT USERS
  router.put('/:id', async function (req, res, next) {
    try {
      const collection = db.collection('users');
      const updateResult = await collection.updateOne({ _id: ObjectId(req.params.id) }, { $set: { string: req.body.string, integer: parseInt(req.body.integer), float: JSON.parse(req.body.float), date: new Date(req.body.date), boolean: req.body.boolean } });
      res.status(201).json(updateResult)
    } catch (e) {
      res.json(e)
    }
  });

  //DELETE, USSER DELETE
  router.delete('/:id', async function (req, res, next) {
    try {
      const collection = db.collection('users');
      const deleteResult = await collection.deleteOne({ _id: ObjectId(req.params.id) });
      res.status(201).json(deleteResult)
    } catch (e) {
      res.json(e)
    }
  });

  router.get('/', isLoggedIn, function (req, res) {
    // Pagination preparation
    let limit = 5
     let currentOffset;
     let totalPage;
     let currentLink;
     let pageInput = parseInt(req.query.page)
   
   
     if (!req.query.page) {
       currentOffset = 1;
       pageInput = 1;
     } else {
       currentOffset = parseInt(req.query.page);
     }
     const offset = (limit * currentOffset) - limit;
     
   
     if (req.url === '/') {
       currentLink = '/?page=1'
     } else {
       if (req.url.includes('/?page')) {
         currentLink = req.url
       } else {
         if (req.url.includes('&page=')) {
           currentLink = req.url
         } else {
           if (req.url.includes('&page=')) {
           } else {
             currentLink = req.url + `&page=${pageInput}`
           }
         }
       }
     }
   
   
       const { cari_id, cari_nama, cari_tanggal_awal, cari_tanggal_akhir } = req.query
       let search = []
       let count = 1
       let syntax = []
       let sql_count = `SELECT count(beli.no_invoice_beli) AS total 
       FROM pembelian beli`
       let sql = `SELECT * FROM pembelian beli`
   
       if (cari_id) {
         sql += ' WHERE '
         sql_count += ' WHERE '
         search.push(`%${cari_id}%`)
         syntax.push(`no_invoice_beli ILIKE $${count}`)
         count++
       }
       if (cari_tanggal_awal && cari_tanggal_akhir) {
         if (!sql.includes(' WHERE ')) {
           sql += ' WHERE'
           sql_count += ' WHERE'
         }
         search.push(`${cari_tanggal_awal}`)
         search.push(`${cari_tanggal_akhir}`)
         syntax.push(` tanggal_pembelian >= $${count} AND tanggal_pembelian < $${count + 1}`)
         count++
         count++
       } else if (cari_tanggal_awal) {
         if (!sql.includes(' WHERE ')) {
           sql += ' WHERE'
           sql_count += ' WHERE'
         }
         search.push(`${cari_tanggal_awal}`)
         syntax.push(` tanggal_pembelian >= $${count}`)
         count++
       } else if (cari_tanggal_akhir) {
         if (!sql.includes(' WHERE ')) {
           sql += ' WHERE'
           sql_count += ' WHERE'
         }
         search.push(`${cari_tanggal_akhir}`)
         syntax.push(` tanggal_pembelian <= $${count}`)
         count++
       }
       if (syntax.length > 0) {
         sql += syntax.join(' AND ')
         sql += ` ORDER BY beli.no_invoice_beli ASC`
         sql_count += syntax.join(' AND ')
         sql_count += `  GROUP BY beli.no_invoice_beli`
         sql_count += ` ORDER BY beli.no_invoice_beli ASC`
       }
       sql += ` LIMIT 5 OFFSET ${offset}`
       db.query(sql_count, search, (err, data) => {
         if (err) console.log('test count', err)
      totalData = data.rows[0].total
                 if (syntax.length > 0) {
                   data.rows.forEach((item) => {
                     totalData = parseInt(totalData) + parseInt(item.total)
                     if (totalData > parseInt(data.rows.length)) {
                       totalData -= 1
                     }
                   })
                 }
                
                 totalPage = Math.ceil(totalData / limit)
         db.query(sql, search, (err, rows) => {
           if (err) console.log('test sql', err)
           res.render('barang_masuk', { rows: rows.rows, currentDir: 'barang_masuk',
            current: '', moment, currencyFormatter, page: totalPage, currentPage: pageInput,
             currentUrl: currentLink, offset,
            link: req.url, query: req.query });
         })
       })
     })

  return router;
}