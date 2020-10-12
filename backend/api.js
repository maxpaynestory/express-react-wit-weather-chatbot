const express = require('express');
const api = express();
const Message = require('./db/models/message');
const request = require('request');

createMessage = (username, text) => {
    return `${username}: ${text}`
}

api.post('/message', (req, res) => {
    if(!req.body.username){
        return res.status(400).send("username not provided");
    }
    if(!req.body.text){
        return res.status(400).send("message text is missing");
    }
    const message = new Message({
        username: req.body.username,
        text: createMessage(req.body.username ,req.body.text)
    });
    message.save(message)
    .then((mess) => {
        url = `https://api.wit.ai/message?v=20201010&q=${encodeURIComponent(req.body.text)}`;
        options = {
            'auth' :{
                'bearer' : process.env.WIT_AI_TOKEN
            }
        }
        request.get(url, options, (error, res2, body) => {
            if(error || res2.statusCode != 200){
                return res.status(500).send(error);
            }
            const jsonObject = JSON.parse(body)
            const intents = jsonObject.intents;
            const entities = jsonObject.entities;
            const minConfidence = process.env.MIN_CONFIDENCE
            for (let intent of intents){
                if(intent.name === "weather" && intent.confidence > minConfidence){
                    if(!entities.hasOwnProperty('cityName:cityName')){
                        return res.json([mess]);
                    }else{
                        const cityNames = entities['cityName:cityName'];
                        for (let city of cityNames){
                            if(city.name === "cityName" && city.confidence > minConfidence){
                                const weatherUrl = `https://api.openweathermap.org/data/2.5/weather?q=${encodeURIComponent(city.value)}&units=metric&appid=${process.env.OPEN_WEATHER_API_KEY}`;
                                request.get(weatherUrl, (err1, res1, body1) => {
                                    if(err1 || res1.statusCode != 200){
                                        return res.json([mess]);
                                    }
                                    const weatherObject = JSON.parse(body1);
                                    if(!weatherObject.hasOwnProperty("main")){
                                        return res.json([mess]);
                                    }
                                    const botText = `Weather in ${city.value} is ${Math.floor(weatherObject.main.temp)} C`;
                                    const botMessage = createMessage("Bot", botText);
                                    const message2 = new Message({
                                        username: req.body.username,
                                        text: botMessage
                                    });
                                    message2.save(message2)
                                    .then((mess2) => {
                                        return res.json([mess, mess2]);
                                    })
                                    .catch((err55) => {
                                        return res.status(500).send(err55);
                                    });
                                });
                            }else{
                                return res.json([mess]);
                            }
                        }
                    }
                }else if(intent.name === "greet" && intent.confidence > minConfidence) {
                    const botText = `Hello ${req.body.username}`;
                    const botMessage = createMessage("Bot", botText);
                    const message2 = new Message({
                        username: req.body.username,
                        text: botMessage
                    });
                    message2.save(message2)
                    .then((mess2) => {
                        return res.json([mess, mess2]);
                    })
                    .catch((err55) => {
                        return res.status(500).json(err55);
                    });
                } else if(intent.name === "depart" && intent.confidence > minConfidence) {
                    const botText = `See you later ${req.body.username}`;
                    const botMessage = createMessage("Bot", botText);
                    const message2 = new Message({
                        username: req.body.username,
                        text: botMessage
                    });
                    message2.save(message2)
                    .then((mess2) => {
                        return res.json([mess, mess2]);
                    })
                    .catch((err55) => {
                        return res.status(500).json(err55);
                    });
                }else{
                    return res.json([mess]);
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
        res.json(messages);
    })
    .catch((err) => {
        res.status(400).send(err);
    });
});

module.exports = api;