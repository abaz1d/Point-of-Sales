require('dotenv').config()

var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
const fileUpload = require('express-fileupload');
var session = require('express-session');
var flash = require('connect-flash');


const { Pool } = require('pg')
const pool = new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  password: process.env.DB_PASS,
  port: process.env.DB_PORT,
  ssl: {
    rejectUnauthorized: false
  }
})

var indexRouter = require('./routes/index')(pool);
var gudangRouter = require('./routes/gudang')(pool);
var satuanRouter = require('./routes/satuan')(pool);
var supplierRouter = require('./routes/supplier')(pool);

var barangRouter = require('./routes/barang')(pool);
var penjualanRouter = require('./routes/penjualan')(pool);
var pembelianRouter = require('./routes/pembelian')(pool);
var usersRouter = require('./routes/users')(pool);


var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.use(fileUpload());
app.use(session({
  secret: 'rubicamp',
  resave: false,
  saveUninitialized: true,
}));
app.use(flash());


app.use('/', indexRouter);
app.use('/gudang', gudangRouter);
app.use('/satuan', satuanRouter);
app.use('/supplier', supplierRouter);
app.use('/barang', barangRouter);
app.use('/penjualan', penjualanRouter);
app.use('/pembelian', pembelianRouter);
app.use('/users', usersRouter);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
  //res.render('pages-404');
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
