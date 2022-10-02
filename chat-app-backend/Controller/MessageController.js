const express = require('express');
const MessageModel = require('../Models/MessageModel');
const { checkAuth } = require('../middleware');

const message = express.Router();

message.get('/', (req, res) => {
    res.send({
        status: 200,
        message: "Connected Successfully"
    });
});

message.post('/send-message', checkAuth, async (req, res) => {
    const { content, chatId } = req.body;
    const userId = req.session.user.userId;

    if (!content || !chatId || !userId) {
        return res.send({
            status: 400,
            message: "Invalid Credentials"
        });
    }

    try {
        const message = await MessageModel.sendMessage({ content, chatId, userId });

        return res.send({
            status: 200,
            message: "Message sent successfully",
            data: message
        });
    } catch (error) {
        return res.send({
            status: 400,
            message: "Error",
            error
        });
    }
});

message.get('/fetch-messages/:chatId', checkAuth, async (req, res) => {
    const userId = req.session.user.userId;
    const { chatId } = req.params;

    if (!chatId || !userId) {
        return res.send({
            status: 400,
            message: "Invalid Credentials"
        });
    }

    try {
        const messages = await MessageModel.fetchMessages({ chatId });

        return res.send({
            status: 200,
            message: "Chat fetched successfully",
            data: messages
        });
    } catch (error) {
        return res.send({
            status: 400,
            message: "Error",
            error
        });
    }
});

module.exports = message;