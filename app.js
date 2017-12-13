require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const sassMiddleware = require('node-sass-middleware');
const mongoose = require('mongoose');
const passport = require('passport');
const jwtSocket = require('socketio-jwt-auth');

const app = express();
const io  = app.io = require("socket.io")();
app.set('io', io);

const stats = require('./routes/stats');
const users = require('./routes/users')(io);
const auth = require('./routes/auth');
const contents = require('./routes/contents');
const {localStrategy, jwtStrategy} = require('./auth/strategies.js');

io.use(jwtSocket.authenticate({secret: process.env.JWT_SECRET}, (payload, done) => done(null, payload.user)));

io.on("connection", (socket) => {
	socket.join(socket.request.user.username);
})

mongoose.Promise = global.Promise;

app.use(cors({
	origin: 'http://memoapp.netlify.com',
	optionsSuccessStatus: 200
}));

app.use(sassMiddleware({
  src: path.join(__dirname, 'public'),
  dest: path.join(__dirname, 'public'),
  indentedSyntax: false,
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