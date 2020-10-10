const express = require('express');
const api = express();

api.get('/message', (req, res) =>{
    if(req.query.username){
        const username = req.query.username;
        return res.json({yey: true});
    }
    return res.status(400).send("username not provided");
});

module.exports = api;