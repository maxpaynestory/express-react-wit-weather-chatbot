const mongoose = require('mongoose');

const MessageSchema = new mongoose.Schema({
    username: {
        type: String,
        required: true
    },
    text: {
        type: String,
        required: true
    }
});

const Message = mongoose.model('messages', MessageSchema);

module.exports = Message;