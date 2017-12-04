require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const sassMiddleware = require('node-sass-middleware');
const mongoose = require('mongoose');
const passport = require('passport');

const stats = require('./routes/stats');
const users = require('./routes/users');
const auth = require('./routes/auth');
const contents = require('./routes/contents');
const {localStrategy, jwtStrategy} = require('./auth/strategies.js');

const app = express();

mongoose.Promise = global.Promise;

app.use(cors());

app.use(sassMiddleware({
  src: path.join(__dirname, 'public'),
  dest: path.join(__dirname, 'public'),
  indentedSyntax: false, // true = .sass and false = .scss
  sourceMap: true
}));

passport.use(localStrategy);
passport.use(jwtStrategy);

app.use(express.static(path.join(__dirname, 'public')));

app.use('/stats', stats);
app.use('/users', users);
app.use('/contents', contents);
app.use('/auth', auth);

module.exports = app;