const mongoose = require("mongoose");

function connect() {
    return new Promise((resolve, reject) => {
        mongoose.connect(process.env.DB_URI, {
            useNewUrlParser: true, useUnifiedTopology: true, authSource: "admin"
        }).then((res, err) => {
            if (err) return reject(err);
            resolve();
        });
    });
}

function close() {
    return mongoose.disconnect();
}

module.exports = {connect, close};