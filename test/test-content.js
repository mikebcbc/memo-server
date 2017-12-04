const chai = require('chai');
const chaiHttp = require('chai-http');
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');

const {User} = require('../models/users');

const app = require('../bin/www');
const expect = chai.expect; // Difference between expect and should?
chai.use(chaiHttp);

function destroyDb() {
	return mongoose.connection.dropDatabase();
}

const username = 'testing';
const password = 'testing';