const express = require('express');
const api = express();
const Message = require('./db/models/message');
const request = require('request');

api.post('/message', (req, res) => {
    if(!req.body.username){
        return res.status(400).send("username not provided");
    }
    if(!req.body.text){
        return res.status(400).send("message text is missing");
    }
    const message = new Message({
        username: req.body.username,
        text: req.body.text
    });
    message.save(message)
    .then((mess) => {
        url = `https://api.wit.ai/message?v=20201010&q=${encodeURIComponent(req.body.text)}`;
        options = {
            'auth' :{
                'bearer' : process.env.WIT_AI_TOKEN
            }
        }
        request.get(url, options, (error, response, body) => {
            const jsonObject = JSON.parse(body)
            const intents = jsonObject.intents;
            const entities = jsonObject.entities;
            const minConfidence = process.env.MIN_CONFIDENCE
            for (let intent of intents){
                if(intent.name === "weather" && intent.confidence > minConfidence){
                    if(entities.hasOwnProperty('cityName:cityName')){
                        const cityNames = entities['cityName:cityName'];
                        for (let city of cityNames){
                            if(city.name === "cityName" && city.confidence > minConfidence){
                                return res.send(city.value);
                            }
                        }
                    }
                }
            }
        });
    })
    .catch((err) => {
        return res.status(500).send(err);
    })

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