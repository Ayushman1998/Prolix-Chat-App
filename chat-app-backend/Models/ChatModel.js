const ChatSchema = require('../Schemas/ChatSchema');
const UserSchema = require('../Schemas/UserSchema');

function accessChat({ userId_1, userId_2 }) {
    return new Promise(async (resolve, reject) => {

        let isChat = await ChatSchema.find({
            isGroupChat: false,
            $and: [
                { participants: { $elemMatch: { $eq: userId_1 } } },
                { participants: { $elemMatch: { $eq: userId_2 } } }
            ]
        })
            .populate("participants", "-password")
            .populate("latestMessage");

        isChat = await UserSchema.populate(isChat, {
            path: "latestMessage.sender",
            select: "name email profilePic"
        });

        if (isChat.length > 0) {
            return resolve(isChat[0]);
        } else {
            try {
                const chatData = new ChatSchema({
                    chatName: "sender",
                    isGroupChat: false,
                    participants: [userId_1, userId_2]
                });

                const createdChat = await chatData.save();

                const fullChat = await ChatSchema.findOne({ _id: createdChat._id })
                    .populate("participants", "-password");

                return resolve(fullChat);
            } catch (error) {
                return reject(error);
            }
        }
    });
}

function fetchChats(chatUser) {
    return new Promise(async (resolve, reject) => {
        try {
            const fetchedChats = await ChatSchema.find({ participants: { $elemMatch: { $eq: chatUser } } })
                .populate("participants", "-password")
                .populate("groupAdmin", "-password")
                .populate("latestMessage")
                .sort({ updatedAt: -1 });

            const finalFetchedChats = await UserSchema.populate(fetchedChats, {
                path: "latestMessage.sender",
                select: "name email profilePic"
            });

            return resolve(finalFetchedChats);
        } catch (error) {
            return reject(error);
        }
    })
}

function createGroupChat({ groupCreator, chatName, users }) {
    return new Promise(async (resolve, reject) => {
        try {
            const groupChatData = new ChatSchema({
                chatName,
                participants: users,
                isGroupChat: true,
                groupAdmin: groupCreator
            });

            const groupChat = await groupChatData.save();

            const finalGroupchat = await ChatSchema.findOne({ _id: groupChat._id })
                .populate("participants", "-password")
                .populate("groupAdmin", "-password");

            return resolve(finalGroupchat);
        } catch (error) {
            return reject(error);
        }
    });
}

function renameGroup({ chatId, newChatName }) {
    return new Promise(async (resolve, reject) => {
        try {
            const renamedChat = await ChatSchema.findByIdAndUpdate(
                chatId, { chatName: newChatName }, { new: true }
            )
                .populate("participants", "-password")
                .populate("groupAdmin", "-password");

            return resolve(renamedChat);
        } catch (error) {
            return reject(error);
        }
    });
}

function addToGroup({ chatId, usersList, userId }) {
    return new Promise(async (resolve, reject) => {
        try {
            const chat = await ChatSchema.findById(chatId);

            if ((chat.groupAdmin).toString() != userId.toString()) {
                return reject("User(s) can only be added by group admin");
            }

            usersList = usersList.filter(item => !chat.participants.includes(item));

            if (usersList.length === 0) {
                return reject("User(s) already exists in the group");
            }

            const updatedChat = await ChatSchema.findByIdAndUpdate(
                chatId, { $push: { participants: { $each: usersList } } }, { new: true }
            )
                .populate("participants", "-password")
                .populate("groupAdmin", "-password");

            return resolve(updatedChat);
        } catch (error) {
            return reject(error);
        }
    });
}

function removeFromGroup({ chatId, usersList, userId }) {
    return new Promise(async (resolve, reject) => {
        try {
            const chat = await ChatSchema.findById(chatId);

            if ((chat.groupAdmin).toString() != userId.toString()) {
                return reject("User(s) can only be removed by group admin");
            }

            usersList = usersList.filter(item => chat.participants.includes(item));

            if (usersList.length === 0) {
                return reject("User(s) already removed from the group");
            }

            if (usersList.includes(chat.groupAdmin.toString())) {
                const list = chat.participants.filter(item => !usersList.includes(item.toString()));

                if (list.length === 0) {
                    const updatedChat = await ChatSchema.findByIdAndDelete(chatId)
                        .populate("participants", "-password")
                        .populate("groupAdmin", "-password");

                    return resolve(updatedChat);
                } else {
                    const newGroupAdmin = list[0];

                    const updatedChatInitial = await ChatSchema.findByIdAndUpdate(
                        chatId, { $pull: { participants: { $in: usersList } } }
                    )

                    const updatedChat = await ChatSchema.findByIdAndUpdate(
                        chatId, { $set: { groupAdmin: newGroupAdmin } }, { new: true }
                    )
                        .populate("participants", "-password")
                        .populate("groupAdmin", "-password");

                    return resolve(updatedChat);
                }
            }

            const updatedChat = await ChatSchema.findByIdAndUpdate(
                chatId, { $pull: { participants: { $in: usersList } } }, { new: true }
            )
                .populate("participants", "-password")
                .populate("groupAdmin", "-password");

            return resolve(updatedChat);
        } catch (error) {
            return reject(error);
        }
    });
}

module.exports = { accessChat, fetchChats, createGroupChat, renameGroup, addToGroup, removeFromGroup };
