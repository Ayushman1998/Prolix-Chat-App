const mongoose = require('mongoose');

const ChatSchema = new mongoose.Schema({
    chatName: {
        type: String,
        trim: true
    },
    isGroupChat: {
        type: Boolean,
        default: false
    },
    participants: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: "user"
    }],
    latestMessage: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "message"
    },
    groupAdmin: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "user"
    }
},
    {
        timestamps: true,
    });

module.exports = mongoose.model('chat', ChatSchema);
