process.env.NODE_ENV = "test";
process.env.WIT_AI_TOKEN = "something";
process.env.OPEN_WEATHER_API_KEY = "weatherapi";
process.env.MIN_CONFIDENCE = 0.7;
const expect = require("chai").expect;
const request = require("supertest");

const app = require("../../../app");
const conn = require("../../../db/index");
const nock = require("nock");
const { query } = require("express");

describe("POST /api/message", () => {
  before((done) => {
    conn
      .connect()
      .then(() => done())
      .catch((err) => done(err));
  });

  after((done) => {
    conn
      .close()
      .then(() => done())
      .catch((err) => done(err));
  });

  it("get error without username", (done) => {
    request(app)
      .post("/api/message")
      .then((res) => {
        expect(res.status).to.equal(400);
        expect(res.text).to.equal("username not provided");
        done();
      })
      .catch((err) => done(err));
  });

  it("get error without message text", (done) => {
    request(app)
      .post("/api/message")
      .send({ username: "myname" })
      .then((res) => {
        expect(res.status).to.equal(400);
        expect(res.text).to.equal("message text is missing");
        done();
      })
      .catch((err) => done(err));
  });

  it("check if 1 message is inserted in database", (done) => {
    const question = "what is the weather in Berlin?";
    const username = "myname";
    const mynock = nock("https://api.wit.ai", {
      reqheaders: {
        authorization: `bearer ${process.env.WIT_AI_TOKEN}`,
      },
    })
      .get(`/message?v=20201010&q=${encodeURIComponent(question)}`)
      .reply(500, "Some error occured");

    request(app)
      .post("/api/message")
      .send({
        username: username,
        text: question,
      })
      .then((res) => {
        expect(res.status).to.equal(500);
        request(app)
          .get("/api/message?username=myname")
          .then((res) => {
            expect(res.status).to.equal(200);
            expect(res.body.length).to.equal(1);
            done();
          });
      })
      .catch((err) => done(err));
    nock.removeInterceptor(mynock);
  });

  it("Test weather is found but entity cityName:cityName not found", (done) => {
    const witresponse = {
      intents: [
        {
          name: "weather",
          confidence: 0.8,
        },
      ],
      entities: {
        "cityName:asdsadas": [],
      },
    };
    const question = "what is the weather in Berlin?";
    const username = "myname";
    const mynock = nock("https://api.wit.ai")
      .get(`/message?v=20201010&q=${encodeURIComponent(question)}`)
      .reply(200, witresponse);

    request(app)
      .post("/api/message")
      .send({
        username: username,
        text: question,
      })
      .then((res) => {
        expect(res.status).to.equal(200);
        expect(res.body.length).to.equal(1);
        const mess = res.body[0];
        expect(mess.username).to.equal(username);
        done();
      })
      .catch((err) => done(err));

    nock.removeInterceptor(mynock);
  });

  it("test intent greet", (done) => {
    const witresponse = {
      intents: [
        {
          name: "greet",
          confidence: 0.8,
        },
      ],
      entities: {
        "cityName:asdsadas": [],
      },
    };
    const question = "Hello";
    const username = "myname";
    const mynock = nock("https://api.wit.ai")
      .get(`/message?v=20201010&q=${encodeURIComponent(question)}`)
      .reply(200, witresponse);

    request(app)
      .post("/api/message")
      .send({
        username: username,
        text: question,
      })
      .then((res) => {
        expect(res.status).to.equal(200);
        expect(res.body.length).to.equal(2);
        const mess = res.body[1];
        expect(mess.text).to.equal(`Bot: Hello ${username}`);
        done();
      })
      .catch((err) => done(err));

    nock.removeInterceptor(mynock);
  });

  it("test intent depart", (done) => {
    const witresponse = {
      intents: [
        {
          name: "depart",
          confidence: 0.8,
        },
      ],
      entities: {
        "cityName:asdsadas": [],
      },
    };
    const question = "Bye";
    const username = "myname";
    const mynock = nock("https://api.wit.ai")
      .get(`/message?v=20201010&q=${encodeURIComponent(question)}`)
      .reply(200, witresponse);

    request(app)
      .post("/api/message")
      .send({
        username: username,
        text: question,
      })
      .then((res) => {
        expect(res.status).to.equal(200);
        expect(res.body.length).to.equal(2);
        const mess = res.body[1];
        expect(mess.text).to.equal(`Bot: See you later ${username}`);
        done();
      })
      .catch((err) => done(err));

    nock.removeInterceptor(mynock);
  });

  it("test error thrown by weather api", (done) => {
    const witresponse = {
      intents: [
        {
          name: "weather",
          confidence: 0.8,
        },
      ],
      entities: {
        "cityName:cityName": [
          {
            name: "cityName",
            value: "Berlin",
            confidence: 0.8,
          },
        ],
      },
    };
    const question = "what is the weather in Berlin?";
    const username = "myname";
    const mynock1 = nock("https://api.wit.ai")
      .get(`/message?v=20201010&q=${encodeURIComponent(question)}`)
      .reply(200, witresponse);

    const mynock2 = nock("https://api.openweathermap.org")
      .get("/data/2.5/weather?q=Berlin&units=metric&appid=weatherapi")
      .reply(500, {
          some:"asdadasd"
      });

    request(app)
      .post("/api/message")
      .send({
        username: username,
        text: question,
      })
      .then((res) => {
        expect(res.status).to.equal(200);
        expect(res.body.length).to.equal(1);
        done();
      })
      .catch((err) => done(err));

    nock.removeInterceptor(mynock1);
    nock.removeInterceptor(mynock2);
  });
});
