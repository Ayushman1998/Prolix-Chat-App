const chat = require("../Controller/ChatController");
const ChatSchema = require("../Schemas/ChatSchema");
const MessageSchema = require("../Schemas/MessageSchema");
const UserSchema = require("../Schemas/UserSchema");

function sendMessage({ content, chatId, userId }) {
    return new Promise(async (resolve, reject) => {
        try {
            const messageData = new MessageSchema({
                sender: userId,
                content: content,
                chat: chatId,
            });

            let message = await messageData.save();
            message = await message.populate("sender", "name profilePic")
            message = await message.populate("chat", "participants")
            message = await UserSchema.populate(message, {
                path: "chat.participants",
                select: "name profilePic email",
            });

            await ChatSchema.findByIdAndUpdate(chatId, { latestMessage: message });

            return resolve(message);
        } catch (error) {
            return reject(error);
        }
    });
}

function fetchMessages({ chatId }) {
    return new Promise(async (resolve, reject) => {
        try {
            const messages = await MessageSchema.find({ chat: chatId })
                .populate("sender", "name profilePic email")
                .populate("chat");

            return resolve(messages);
        } catch (error) {
            return reject(error);
        }
    });
}

module.exports = { sendMessage, fetchMessages };
