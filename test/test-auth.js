global.DATABASE_URL = 'mongodb://localhost/memo-test';
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

describe('Authentication Tests', function() {
	beforeEach(function(done) {
		User.hashPassword(password)
		.then((password) => {
			return User
				.create({
					username,
					password
				})
		})
		.then(() => {
			done(); // Remind me what this does again?
		})
	})

	afterEach(function() {
		return destroyDb();
	})

	after(function() {
		return mongoose.connection.close();
	})

	describe('POST /login', function() {
		it('should reject requests w/o body', function() {
			return chai
				.request(app)
				.post('/auth/login')
				.then(() => expect.fail(null, null, 'Request shouldnt complete'))
				.catch(err => {
					expect(err.response).to.have.status(400);
				})
		})
		it('should return a valid jwt', function() {
			return chai
				.request(app)
				.post('/auth/login')
				.send({username, password})
				.then(res => {
					const payload = jwt.verify(res.body.authToken, process.env.JWT_SECRET, {
						algorithm: ['HS256']
					});

					expect(res).to.have.status(200);
					expect(res.body).to.be.an('object');
					expect(res.body.authToken).to.be.a('string');
					expect(payload.user).to.deep.equal({
						username,
						content: []
					})
				})
		})
	})
})