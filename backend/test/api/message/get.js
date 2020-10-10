process.env.NODE_ENV = 'test';
const expect = require('chai').expect;
const request = require('supertest');

const app = require('../../../app');
const conn = require('../../../db/index');

describe('GET /api/message', () => {
    before((done) => {
      conn.connect()
        .then(() => done())
        .catch((err) => done(err));
    })
  
    after((done) => {
      conn.close()
        .then(() => done())
        .catch((err) => done(err));
    })
  
    it('get error without username', (done) => {
      request(app).get('/api/message')
        .then((res) => {
          expect(res.status).to.be.equals(400);
          expect(res.text).to.be.equals("username not provided")
          done();
        })
        .catch((err) => done(err));
    });

    it("no messages", (done) => {
      request(app).get('/api/message?username=myname')
        .then((res) => {
          expect(res.status).to.equal(200);
          expect(res.text).to.equal('[]');
          done();
        })
        .catch((err) => done(err));
    });

  })