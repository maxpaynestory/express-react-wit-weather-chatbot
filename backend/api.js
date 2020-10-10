const express = require('express');
const api = express();
const Message = require('./db/models/message');

api.post('/message', (req, res) => {
    if(!req.body.username){
        return res.status(400).send("username not provided");
    }
});

api.get('/message', (req, res) =>{
    if(!req.query.username){
        return res.status(400).send("username not provided");
    }
    const username = req.query.username;
    Message.find({username: username})
    .then((messages) => {
        res.send(messages);
    })
    .catch((err) => {
        res.status(400).send(err);
    });
});

module.exports = api;