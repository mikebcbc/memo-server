require('dotenv').config();
const express = require('express');
const path = require('path');
const sassMiddleware = require('node-sass-middleware');
const mongoose = require('mongoose');
const passport = require('passport');

const index = require('./routes/index');
const stats = require('./routes/stats');
const users = require('./routes/users');
const auth = require('./routes/auth');
const contents = require('./routes/contents');
const {localStrategy, jwtStrategy} = require('./auth/strategies.js');

const app = express();

mongoose.Promise = global.Promise;

app.use(sassMiddleware({
  src: path.join(__dirname, 'public'),
  dest: path.join(__dirname, 'public'),
  indentedSyntax: false, // true = .sass and false = .scss
  sourceMap: true
}));

passport.use(localStrategy);
passport.use(jwtStrategy);

app.use(express.static(path.join(__dirname, 'public')));

app.use('/', index);
app.use('/stats', stats);
app.use('/users', users);
app.use('/contents', contents);
app.use('/auth', auth);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  const err = new Error('Not Found');
  err.status = 404;
  next(err);
});

module.exports = app;