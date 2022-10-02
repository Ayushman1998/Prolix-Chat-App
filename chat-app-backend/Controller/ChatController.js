const express = require('express');

const ChatModel = require('../Models/ChatModel');
const { checkAuth } = require('../middleware');

const chat = express.Router();

chat.get('/', (req, res) => {
    res.send({
        status: 200,
        message: "Connected Successfully"
    });
});

chat.post('/access-chat', checkAuth, async (req, res) => {
    const userId_1 = req.session.user.userId;
    const userId_2 = req.body.user;

    if (!userId_1 || !userId_2) {
        return res.send({
            status: 400,
            message: "Invalid Credentials"
        });
    }

    try {
        const isChat = await ChatModel.accessChat({ userId_1, userId_2 });

        return res.send({
            status: 200,
            message: "Accessed Chat",
            data: isChat
        });
    } catch (error) {
        return res.send({
            status: 400,
            message: "Error",
            error
        });
    }
});

chat.get('/fetch-chats', checkAuth, async (req, res) => {
    const chatUser = req.session.user.userId;

    if (!chatUser) {
        return res.send({
            status: 400,
            message: "Invalid Credentials"
        });
    }

    try {
        const fetchedChats = await ChatModel.fetchChats(chatUser);

        return res.send({
            status: 200,
            message: "Fetched Chat",
            data: fetchedChats
        });
    } catch (error) {
        return res.send({
            status: 400,
            message: "Error",
            error
        });
    }
});

chat.post('/create-group-chat', checkAuth, async (req, res) => {
    const groupCreator = req.session.user.userId;
    const chatName = req.body.chatName;
    let users = req.body.users

    if (!groupCreator || !chatName || !users) {
        return res.send({
            status: 400,
            message: "Invalid Credentials"
        });
    }

    users = JSON.parse(users);

    if (users.length < 2) {
        return res.send({
            status: 400,
            message: "More than 2 users are required to form a group chat"
        });
    }

    users.push(groupCreator.toString());
    try {
        const groupChat = await ChatModel.createGroupChat({ groupCreator, chatName, users });

        return res.send({
            status: 200,
            message: "Group Chat Created",
            data: groupChat
        });
    } catch (error) {
        return res.send({
            status: 400,
            message: "Error",
            error
        });
    }
});

chat.put('/rename-group', checkAuth, async (req, res) => {
    const { chatId, newChatName } = req.body;

    if (!chatId || !newChatName) {
        return res.send({
            status: 400,
            message: "Invalid Credentials"
        });
    }

    try {
        const updatedChat = await ChatModel.renameGroup({ chatId, newChatName });

        return res.send({
            status: 200,
            message: "Rename Successful",
            data: updatedChat
        });
    } catch (error) {
        return res.send({
            status: 400,
            message: "Error",
            error
        });
    }
});

chat.put('/add-to-group', checkAuth, async (req, res) => {
    let { chatId, usersList } = req.body;
    const userId = req.session.user.userId;

    if (!chatId || !usersList || !userId) {
        return res.send({
            status: 400,
            message: "Invalid Credentials"
        });
    }

    try {
        const updatedChat = await ChatModel.addToGroup({ chatId, usersList, userId });

        return res.send({
            status: 200,
            message: "User(s) successfully added",
            data: updatedChat
        });
    } catch (error) {
        return res.send({
            status: 400,
            message: "Error",
            error
        });
    }
});

chat.put('/remove-from-group', checkAuth, async (req, res) => {
    let { chatId, usersList } = req.body;
    const userId = req.session.user.userId;

    if (!chatId || !usersList || !userId) {
        return res.send({
            status: 400,
            message: "Invalid Credentials"
        });
    }

    try {
        const updatedChat = await ChatModel.removeFromGroup({ chatId, usersList, userId });

        return res.send({
            status: 200,
            message: "User(s) successfully removed",
            data: updatedChat
        });
    } catch (error) {
        return res.send({
            status: 400,
            message: "Error",
            error
        });
    }
});

module.exports = chat;