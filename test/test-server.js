const chai = require('chai');
const chaiHttp = require('chai-http');

const {app} = require('../app');

const should = chai.should();
chai.use(chaiHttp);