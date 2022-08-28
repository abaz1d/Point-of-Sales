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

    if (req.query.cari_email) {
      wheres.push(`email_user ilike '%' || $${count++} || '%'`);
      values.push(req.query.cari_email);
    }

    if (req.query.cari_username) {
      wheres.push(`username ilike '%' || $${count++} || '%'`);
      values.push(req.query.cari_username);
    }

    if (req.query.cari_role) {
      wheres.push(`role ilike '%' || $${count++} || '%'`);
      values.push(req.query.cari_role);
    }

      sql = 'SELECT * FROM users '
      if (wheres.length > 0) {
        sql += ` WHERE ${wheres.join(' AND ')}`
      }

      sql += 'ORDER BY id_users'


      
      const { rows } = await db.query(sql,values);

      res.render('users/list', {
        rows,

        query: req.query
      })
    } catch (e) {
      res.send(e)
    }
  });

  router.get('/add', async function (req, res, next) {
    try {
      res.render('users/add')
    } catch (e) {
      res.send(e)
    }
  });

  router.post('/add', async function (req, res, next) {
    try {
      const { rows } = await db.query('INSERT INTO users(email_user,username,password,role) VALUES ($1, $2, $3, $4)',
        [req.body.email_user, req.body.username, req.body.password, req.body.role])
      res.redirect('/users')
    } catch (e) {
      res.send(e)
    }
  });

  router.get('/edit/:id', async function (req, res, next) {
    try {
      const { rows } = await db.query('SELECT * FROM users WHERE id_users = $1', [req.params.id])
      res.render('users/edit', { item: rows[0] });
    } catch (e) {
      res.send(e)
    }
  });

  router.post('/edit/:id', async function (req, res, next) {
    try {
      const { rows } = await db.query(`UPDATE users SET 
      email_user = $1,
      username = $2,
      password = $3,
      role = $4
      WHERE id_users = $5`, [req.body.email_user, req.body.username, req.body.password, req.body.role, req.params.id])
      res.redirect('/users')
    } catch (e) {
      res.send(e)
    }
  });

  router.get('/delete/:id', async function (req, res, next) {
    try {
      const { rows } = await db.query('DELETE FROM users WHERE id_users = $1', [req.params.id])
      res.redirect('/users')
    } catch (e) {
      res.send(e)
    }
  });

  return router;
}