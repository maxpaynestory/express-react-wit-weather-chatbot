const express = require("express");
const api = require('./api');
const app = express();
const bodyParser = require('body-parser');

app.use(bodyParser.json());

app.use('/api', api);


module.exports = app;