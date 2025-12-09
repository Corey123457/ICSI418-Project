const mongoose = require("mongoose");

const MessageSchema = new mongoose.Schema({
    groupId: String,
    sender: String,
    text: String,
    timestamp: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model("Message", MessageSchema);
